const prisma = require('../lib/prisma');
const crypto = require('crypto');

const handleWebhook = async (req, res) => {
  try {
    const data = req.body;
    
    // Validasi Signature Key
    const hash = crypto.createHash('sha512').update(`${data.order_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`).digest('hex');
    
    if (data.signature_key !== hash) {
      return res.status(403).json({ message: 'Invalid signature key' });
    }

    const { order_id, transaction_status, fraud_status } = data;

    const pembayaran = await prisma.pembayaran.findUnique({
      where: { kodeBayar: order_id }
    });

    if (!pembayaran) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let status = pembayaran.status;

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        status = 'PENDING';
      } else if (fraud_status === 'accept') {
        status = 'LUNAS';
      }
    } else if (transaction_status === 'settlement') {
      status = 'LUNAS';
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      status = 'KEDALUWARSA'; // atau GAGAL
    } else if (transaction_status === 'pending') {
      status = 'PENDING';
    }

    // Update pembayaran
    await prisma.pembayaran.update({
      where: { kodeBayar: order_id },
      data: { 
        status, 
        paidAt: status === 'LUNAS' ? new Date() : null 
      }
    });

    // Jika LUNAS dan terkait dengan Registration PPDB, otomatis update status Registration jadi SELESAI
    if (status === 'LUNAS' && pembayaran.registrationId) {
      const reg = await prisma.registration.findUnique({ where: { id: pembayaran.registrationId } });
      if (reg && reg.status === 'DAFTAR_ULANG') {
        await prisma.registration.update({
          where: { id: reg.id },
          data: { status: 'SELESAI' }
        });
      } else if (reg && (reg.status === 'PEMBAYARAN_REGISTRASI' || reg.status === 'KELENGKAPAN_DATA')) {
        const hasData = await prisma.registrationData.findUnique({
          where: { registrationId: reg.id }
        });
        const isLanjutan = reg.program === 'SMA' && reg.previousSchool === "SMP Madinatul Qur'an (Lanjutan Internal)";
        const newStatus = (hasData || isLanjutan) ? 'TES_WAWANCARA' : 'KELENGKAPAN_DATA';
        await prisma.registration.update({
          where: { id: reg.id },
          data: { status: newStatus }
        });
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Midtrans Webhook Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { handleWebhook };
