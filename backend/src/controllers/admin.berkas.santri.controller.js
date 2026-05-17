const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();

// ── Storage setup ─────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/berkas-santri/');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${req.params.santriId}_${req.params.type}_${Date.now()}${ext}`;
    cb(null, unique);
  }
});

const uploadBerkas = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, PDF, atau WEBP.'));
  }
}).single('file');

// ── Helpers ───────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function fileUrlFromPath(filename) {
  return `${BASE_URL}/uploads/berkas-santri/${filename}`;
}

function deleteFileIfExists(fileUrl) {
  if (!fileUrl) return;
  try {
    const filename = path.basename(fileUrl);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error('Gagal hapus file:', e.message);
  }
}

// ── GET /api/admin/santri/:santriId/documents ─────────────────
// Return semua dokumen santri (via registration.documents)
const getDocuments = async (req, res) => {
  try {
    const { santriId } = req.params;
    const santri = await prisma.santri.findUnique({
      where: { id: santriId },
      include: {
        registration: { include: { documents: true } },
        markaz: true,
        kelasRef: true,
      }
    });
    if (!santri) return res.status(404).json({ message: 'Santri tidak ditemukan' });
    res.json({ santriId, documents: santri.registration?.documents || [] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ── POST /api/admin/santri/:santriId/documents/:type ──────────
// Upload berkas baru (atau replace jika sudah ada)
const uploadDocument = (req, res) => {
  uploadBerkas(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan' });

    const { santriId, type } = req.params;
    try {
      const santri = await prisma.santri.findUnique({ where: { id: santriId } });
      if (!santri) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Santri tidak ditemukan' });
      }

      const fileUrl = fileUrlFromPath(req.file.filename);
      const registrationId = santriId; // Santri.id === Registration.id

      // Cek apakah dokumen tipe ini sudah ada
      const existing = await prisma.document.findFirst({
        where: { registrationId, type }
      });

      let doc;
      if (existing) {
        // Hapus file lama
        deleteFileIfExists(existing.fileUrl);
        // Update record
        doc = await prisma.document.update({
          where: { id: existing.id },
          data: { fileUrl, status: 'PENDING', notes: null }
        });
      } else {
        // Buat baru
        doc = await prisma.document.create({
          data: { registrationId, type, fileUrl, status: 'PENDING' }
        });
      }

      res.json({ message: 'Berkas berhasil diupload', document: doc });
    } catch (e) {
      // Hapus file jika error DB
      if (req.file?.path) fs.unlinkSync(req.file.path);
      res.status(500).json({ message: e.message });
    }
  });
};

// ── DELETE /api/admin/santri/:santriId/documents/:docId ───────
const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc) return res.status(404).json({ message: 'Dokumen tidak ditemukan' });

    deleteFileIfExists(doc.fileUrl);
    await prisma.document.delete({ where: { id: docId } });

    res.json({ message: 'Berkas berhasil dihapus' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getDocuments, uploadDocument, deleteDocument };
