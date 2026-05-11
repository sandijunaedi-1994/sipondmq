const prisma = require('../lib/prisma');
const crypto = require('crypto');

// --- McWorker ---
exports.getWorkers = async (req, res) => {
  try {
    const workers = await prisma.mcWorker.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: workers });
  } catch (error) {
    console.error('Get Workers Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pekerja' });
  }
};

exports.createWorker = async (req, res) => {
  try {
    const { nama, kategori, kontak, upahHarian } = req.body;
    const worker = await prisma.mcWorker.create({
      data: {
        id: crypto.randomUUID(),
        nama,
        kategori,
        kontak,
        upahHarian: upahHarian,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: worker });
  } catch (error) {
    console.error('Create Worker Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah data pekerja' });
  }
};

exports.updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, kategori, kontak, upahHarian } = req.body;
    const worker = await prisma.mcWorker.update({
      where: { id },
      data: {
        nama,
        kategori,
        kontak,
        upahHarian: upahHarian,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: worker });
  } catch (error) {
    console.error('Update Worker Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate data pekerja' });
  }
};

exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mcWorker.delete({ where: { id } });
    res.json({ success: true, message: 'Data pekerja berhasil dihapus' });
  } catch (error) {
    console.error('Delete Worker Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data pekerja' });
  }
};

// --- McVendor ---
exports.getVendors = async (req, res) => {
  try {
    const vendors = await prisma.mcVendor.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: vendors });
  } catch (error) {
    console.error('Get Vendors Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data vendor' });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { nama, kategori, kontak, alamat } = req.body;
    const vendor = await prisma.mcVendor.create({
      data: {
        id: crypto.randomUUID(),
        nama,
        kategori,
        kontak,
        alamat,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: vendor });
  } catch (error) {
    console.error('Create Vendor Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah data vendor' });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, kategori, kontak, alamat } = req.body;
    const vendor = await prisma.mcVendor.update({
      where: { id },
      data: {
        nama,
        kategori,
        kontak,
        alamat,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: vendor });
  } catch (error) {
    console.error('Update Vendor Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate data vendor' });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mcVendor.delete({ where: { id } });
    res.json({ success: true, message: 'Data vendor berhasil dihapus' });
  } catch (error) {
    console.error('Delete Vendor Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data vendor' });
  }
};

// --- McMaterial ---
exports.getMaterials = async (req, res) => {
  try {
    const materials = await prisma.mcMaterial.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: materials });
  } catch (error) {
    console.error('Get Materials Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data material' });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const { kode, nama, kategori, satuan, harga } = req.body;
    const material = await prisma.mcMaterial.create({
      data: {
        id: crypto.randomUUID(),
        kode,
        nama,
        kategori,
        satuan,
        harga,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: material });
  } catch (error) {
    console.error('Create Material Error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Kode material sudah digunakan' });
    }
    res.status(500).json({ success: false, message: 'Gagal menambah data material' });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, kategori, satuan, harga } = req.body;
    const material = await prisma.mcMaterial.update({
      where: { id },
      data: {
        kode,
        nama,
        kategori,
        satuan,
        harga,
        updatedAt: new Date()
      }
    });
    res.json({ success: true, data: material });
  } catch (error) {
    console.error('Update Material Error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Kode material sudah digunakan' });
    }
    res.status(500).json({ success: false, message: 'Gagal mengupdate data material' });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mcMaterial.delete({ where: { id } });
    res.json({ success: true, message: 'Data material berhasil dihapus' });
  } catch (error) {
    console.error('Delete Material Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data material' });
  }
};
