const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const register = async (req, res) => {
  try {
    const { contact, phone, email, password } = req.body;
    let finalEmail = email || null;
    let finalPhone = phone || null;
    
    // Fallback logic for login/older apps that only send 'contact'
    if (contact) {
      if (contact.includes('@')) {
        finalEmail = contact;
      } else {
        finalPhone = contact;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: finalEmail,
        phone: finalPhone,
        password: hashedPassword,
        role: 'CALON_WALI'
      }
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret_123',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email or phone number already in use' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const { mergePermissions } = require('../utils/permission');
const { logActivity } = require('../utils/logger');

const login = async (req, res) => {
  try {
    const { contact, password } = req.body;

    // Search by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: contact },
          { phone: contact }
        ]
      },
      include: {
        registrations: true,
        adminGroups: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'CALON_WALI' && user.registrations && user.registrations.length > 0) {
      const blockedStatuses = [
        'DITOLAK', 
        'TIDAK_LANJUT_BAYAR_REGISTRASI', 
        'TIDAK_LANJUT_TES', 
        'TIDAK_LANJUT_DAFTAR_ULANG', 
        'TIDAK_LANJUT_JADI_SANTRI',
        'NO_LEAD_DOUBLE'
      ];
      
      const hasActiveRegistration = user.registrations.some(reg => !blockedStatuses.includes(reg.status));
      
      if (!hasActiveRegistration) {
        return res.status(403).json({ message: 'Akses ditolak. Calon santri tidak melanjutkan proses pendaftaran.' });
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_123',
      { expiresIn: '7d' }
    );

    const finalPermissions = mergePermissions(user.permissions, user.adminGroups);

    // Log Activity
    await logActivity({
      userId: user.id,
      action: 'LOGIN',
      entity: 'Auth',
      details: 'User logged in successfully',
      req
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        namaLengkap: user.namaLengkap,
        role: user.role,
        permissions: finalPermissions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        registrations: {
          include: {
            registrationData: {
              include: {
                siblings: true,
                mqSiblings: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password lama tidak sesuai' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const { sendMail } = require('../utils/mailer');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email harus diisi' });

    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      // Return 200 even if not found to prevent email enumeration
      return res.status(200).json({ message: 'Jika email terdaftar, link reset telah dikirim.' });
    }

    // Create stateless JWT
    const secret = (process.env.JWT_SECRET || 'fallback_secret_123') + user.password;
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/admin/reset-password?token=${token}&id=${user.id}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #10b981; text-align: center;">Reset Password My MQ</h2>
        <p>Assalamu'alaikum,</p>
        <p>Anda menerima email ini karena ada permintaan untuk mengatur ulang password akun Anda.</p>
        <p>Silakan klik tombol di bawah ini untuk mengatur ulang password Anda. Link ini hanya berlaku selama 1 jam.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Atau copy paste link berikut di browser Anda:</p>
        <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <p style="margin-top: 40px; color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} My MQ. All rights reserved.</p>
      </div>
    `;

    await sendMail(user.email, 'Reset Password My MQ', htmlContent);

    res.status(200).json({ message: 'Jika email terdaftar, link reset telah dikirim.' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Gagal mengirim email: ' + error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id, token, newPassword } = req.body;

    if (!id || !token || !newPassword) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
    }

    const secret = (process.env.JWT_SECRET || 'fallback_secret_123') + user.password;
    
    try {
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Password berhasil direset' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Terjadi kesalahan internal' });
  }
};

module.exports = { register, login, getProfile, updatePassword, forgotPassword, resetPassword };
