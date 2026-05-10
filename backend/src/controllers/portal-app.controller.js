const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all portal apps
const getPortalApps = async (req, res) => {
  try {
    const { isAdmin } = req.query; // If admin, show all including inactive ones
    
    // Check user's app access
    const user = await prisma.user.findUnique({ where: { id: req.user.id || req.user.userId } });
    const isSuperAdmin = user?.permissions?.includes('MANAJEMEN_ADMIN');
    const allowedApps = Array.isArray(user?.portalAppsAccess) ? user.portalAppsAccess : [];

    let whereClause = isAdmin === 'true' ? {} : { isAktif: true };

    // If not a superadmin AND not requesting the full management list, filter by access
    if (isAdmin !== 'true' && !isSuperAdmin) {
      if (allowedApps.length === 0) {
        return res.json({ success: true, data: [] });
      }
      whereClause.id = { in: allowedApps };
    }

    const apps = await prisma.portalApp.findMany({
      where: whereClause,
      orderBy: { urutan: 'asc' }
    });

    res.json({
      success: true,
      data: apps
    });
  } catch (error) {
    console.error('Error fetching portal apps:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

// Create new portal app
const createPortalApp = async (req, res) => {
  try {
    const { nama, deskripsi, url, ikon, isAktif, urutan } = req.body;

    const newApp = await prisma.portalApp.create({
      data: {
        nama,
        deskripsi,
        url,
        ikon,
        isAktif: isAktif !== undefined ? isAktif : true,
        urutan: urutan || 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Aplikasi berhasil ditambahkan.',
      data: newApp
    });
  } catch (error) {
    console.error('Error creating portal app:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

// Update portal app
const updatePortalApp = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, url, ikon, isAktif, urutan } = req.body;

    const updatedApp = await prisma.portalApp.update({
      where: { id },
      data: {
        nama,
        deskripsi,
        url,
        ikon,
        isAktif,
        urutan
      }
    });

    res.json({
      success: true,
      message: 'Aplikasi berhasil diperbarui.',
      data: updatedApp
    });
  } catch (error) {
    console.error('Error updating portal app:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

// Delete portal app
const deletePortalApp = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.portalApp.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Aplikasi berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting portal app:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

module.exports = {
  getPortalApps,
  createPortalApp,
  updatePortalApp,
  deletePortalApp
};
