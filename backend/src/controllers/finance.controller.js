const prisma = require('../lib/prisma');
const midtransClient = require('midtrans-client');

const getSnapClient = () => {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
  });
};

const globalInstallments = {};

const getBillingHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { registrationId } = req.query;

    const registration = await prisma.registration.findFirst({
      where: registrationId ? { id: registrationId, userId } : { userId }
    });

    if (!registration) {
      return res.status(200).json({ bills: [] });
    }

    const regPayment = await prisma.pembayaran.findFirst({
      where: { registrationId: registration.id, status: 'LUNAS' },
      orderBy: { paidAt: 'asc' }
    });
    const isPaid = !!regPayment;

    const mockBills = [
      {
        id: "inv-001",
        title: "Biaya Registrasi PPDB",
        amount: 350000,
        status: isPaid ? "LUNAS" : "BELUM_BAYAR",
        dueDate: "2026-05-10T00:00:00.000Z",
        paidAt: isPaid ? new Date().toISOString() : null
      }
    ];

    // Add Uang Masuk bill if status is DAFTAR_ULANG or SELESAI
    if (registration.status === 'DAFTAR_ULANG' || registration.status === 'SELESAI') {
      const uangMasukTotal = registration.uangMasukNominal ? Number(registration.uangMasukNominal) : 15000000;
      
      const payments = await prisma.pembayaran.findMany({
        where: { registrationId: registration.id, status: 'LUNAS' }
      });
      
      const paidAmount = payments.reduce((sum, p) => sum + Number(p.totalNominal), 0);
      
      mockBills.push({
        id: "inv-002",
        title: "Uang Masuk / Uang Pangkal",
        amount: uangMasukTotal,
        paidAmount: paidAmount,
        status: paidAmount >= uangMasukTotal ? "LUNAS" : (paidAmount > 0 ? "DICICIL" : "BELUM_BAYAR"),
        dueDate: "2026-07-01T00:00:00.000Z",
        paidAt: paidAmount >= uangMasukTotal ? (payments.length > 0 ? payments[0].paidAt : new Date().toISOString()) : null,
        isInstallmentEligible: false // Midtrans snap handles the full amount or we can let them pay full for now.
      });
    }

    res.status(200).json({ bills: mockBills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const simulatePay = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { registrationId } = req.body;

    const registration = await prisma.registration.findFirst({
      where: registrationId ? { id: registrationId, userId } : { userId }
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.status === 'PEMBAYARAN_REGISTRASI' || registration.status === 'KELENGKAPAN_DATA') {
      // Simulate creating the payment record
      await prisma.pembayaran.create({
        data: {
          userId: registration.userId,
          registrationId: registration.id,
          totalNominal: 300000,
          metode: 'TUNAI',
          status: 'LUNAS',
          catatan: 'Simulasi Pembayaran',
          paidAt: new Date()
        }
      });

      const hasData = await prisma.registrationData.findUnique({
        where: { registrationId: registration.id }
      });
      const isLanjutan = registration.program === 'SMA' && registration.previousSchool === "SMP Madinatul Qur'an (Lanjutan Internal)";
      const newStatus = (hasData || isLanjutan) ? 'TES_WAWANCARA' : 'KELENGKAPAN_DATA';
      
      await prisma.registration.update({
        where: { id: registration.id },
        data: { status: newStatus }
      });
    }

    res.status(200).json({ message: 'Payment simulation successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const payInstallment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const currentPaid = globalInstallments[userId] || 0;
    const newTotal = currentPaid + amount;
    
    // Cap at 15,000,000
    globalInstallments[userId] = Math.min(newTotal, 15000000);

    res.status(200).json({ 
      message: 'Installment payment successful',
      paidAmount: globalInstallments[userId]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSnapToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { registrationId } = req.body;
    
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { user: true }
    });

    if (!registration || registration.userId !== userId) {
      return res.status(404).json({ message: 'Registrasi tidak ditemukan' });
    }

    // Kalkulasi nominal yang harus dibayar
    const nominalTagihan = registration.uangMasukNominal ? Number(registration.uangMasukNominal) : 15000000;
    
    // Hitung total yang sudah dilunasi
    const payments = await prisma.pembayaran.findMany({
      where: { registrationId, status: 'LUNAS' }
    });
    const paidAmount = payments.reduce((sum, p) => sum + Number(p.totalNominal), 0);
    const amount = nominalTagihan - paidAmount;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Tagihan sudah lunas' });
    }

    // Cek apakah sudah ada pembayaran PENDING untuk sisa tagihan yang sama persis
    const existingPayment = await prisma.pembayaran.findFirst({
      where: { registrationId, status: 'PENDING', metode: 'MIDTRANS', totalNominal: amount }
    });

    if (existingPayment && existingPayment.snapToken) {
      return res.status(200).json({ token: existingPayment.snapToken, orderId: existingPayment.kodeBayar });
    }

    const orderId = `PPDB-${registration.id.substring(0, 8)}-${Date.now()}`;
    const snap = getSnapClient();

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      customer_details: {
        first_name: registration.studentName || 'Calon Santri',
        email: registration.user.email || 'user@example.com',
        phone: registration.user.phone || '0800000000'
      },
      item_details: [{
        id: "PPDB_UANG_PANGKAL",
        price: amount,
        quantity: 1,
        name: "Uang Pangkal PPDB MQ"
      }]
    };

    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    // Simpan ke DB
    await prisma.pembayaran.create({
      data: {
        userId: registration.userId,
        registrationId: registration.id,
        kodeBayar: orderId,
        snapToken,
        totalNominal: amount,
        metode: 'MIDTRANS',
        status: 'PENDING'
      }
    });

    res.status(200).json({ token: snapToken, orderId });
  } catch (error) {
    console.error('Error generating snap token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getBillingHistory, simulatePay, payInstallment, getSnapToken };
