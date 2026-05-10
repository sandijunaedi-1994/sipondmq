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

module.exports = { register, login, getProfile, updatePassword };
