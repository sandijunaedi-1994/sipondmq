const prisma = require('../lib/prisma');
const { logActivity } = require('../utils/logger');
const { mergePermissions } = require('../utils/permission');

// Mendapatkan daftar semua grup admin
const getGroupList = async (req, res) => {
  try {
    const groups = await prisma.adminGroup.findMany({
      orderBy: { nama: 'asc' },
      include: {
        _count: { select: { users: true } }
      }
    });
    res.status(200).json({ groups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Membuat grup admin baru
const createGroup = async (req, res) => {
  try {
    const { nama, deskripsi, permissions } = req.body;

    // Check MANAJEMEN_ADMIN
    const currentUser = await prisma.user.findUnique({ 
      where: { id: req.user.userId },
      include: { adminGroups: true }
    });
    
    const mergedPerms = mergePermissions(currentUser.permissions, currentUser.adminGroups);
    if (!mergedPerms.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const existing = await prisma.adminGroup.findUnique({ where: { nama } });
    if (existing) {
      return res.status(400).json({ message: 'Nama grup sudah digunakan.' });
    }

    const newGroup = await prisma.adminGroup.create({
      data: {
        nama,
        deskripsi,
        permissions: permissions || []
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'CREATE',
      entity: 'AdminGroup',
      entityId: newGroup.id,
      details: `Membuat grup admin: ${nama}`,
      req
    });

    res.status(201).json({ message: 'Grup berhasil dibuat', group: newGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Memperbarui grup admin
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, permissions } = req.body;

    const currentUser = await prisma.user.findUnique({ 
      where: { id: req.user.userId },
      include: { adminGroups: true }
    });
    
    const mergedPerms = mergePermissions(currentUser.permissions, currentUser.adminGroups);
    if (!mergedPerms.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    if (nama) {
      const existing = await prisma.adminGroup.findFirst({
        where: { nama, NOT: { id } }
      });
      if (existing) {
        return res.status(400).json({ message: 'Nama grup sudah digunakan oleh grup lain.' });
      }
    }

    const updated = await prisma.adminGroup.update({
      where: { id },
      data: {
        nama,
        deskripsi,
        permissions: permissions || []
      }
    });

    await logActivity({
      userId: req.user.userId,
      action: 'UPDATE',
      entity: 'AdminGroup',
      entityId: id,
      details: `Memperbarui grup admin: ${nama || id}`,
      req
    });

    res.status(200).json({ message: 'Grup berhasil diperbarui', group: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Menghapus grup admin
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const currentUser = await prisma.user.findUnique({ 
      where: { id: req.user.userId },
      include: { adminGroups: true }
    });
    
    const mergedPerms = mergePermissions(currentUser.permissions, currentUser.adminGroups);
    if (!mergedPerms.includes('MANAJEMEN_ADMIN')) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const group = await prisma.adminGroup.findUnique({ where: { id } });
    if (!group) {
      return res.status(404).json({ message: 'Grup tidak ditemukan.' });
    }

    await prisma.adminGroup.delete({ where: { id } });

    await logActivity({
      userId: req.user.userId,
      action: 'DELETE',
      entity: 'AdminGroup',
      entityId: id,
      details: `Menghapus grup admin: ${group.nama}`,
      req
    });

    res.status(200).json({ message: 'Grup berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getGroupList,
  createGroup,
  updateGroup,
  deleteGroup
};
