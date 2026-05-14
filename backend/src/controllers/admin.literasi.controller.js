const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Setup Multer Storage
const uploadDir = path.join(__dirname, '../../public/uploads/literasi');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx' || ext === '.txt') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PDF, DOCX, dan TXT yang didukung'));
    }
  }
});

exports.uploadMiddleware = upload.single('document');

// Extract text from file
const extractText = async (filePath, ext) => {
  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (ext === '.txt') {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    return null;
  }
  return null;
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }

    const title = req.body.title || req.file.originalname;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileUrl = `/uploads/literasi/${req.file.filename}`;

    // Extract text content
    const textContent = await extractText(req.file.path, ext);
    if (!textContent || textContent.trim().length === 0) {
      // Clean up file if failed
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Gagal membaca teks dari file, atau file kosong/gambar saja' });
    }

    // Save to DB
    const doc = await prisma.spmbLiterasiDocument.create({
      data: {
        title: title,
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        fileType: ext.replace('.', ''),
        textContent: textContent,
        uploadedBy: req.user.userId || req.user.id
      }
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const docs = await prisma.spmbLiterasiDocument.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        createdAt: true,
        // Exclude textContent so we don't send huge payloads in the list
      }
    });
    res.status(200).json(docs);
  } catch (error) {
    console.error('Error fetching literasi documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.spmbLiterasiDocument.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ message: 'Dokumen tidak ditemukan' });

    // Delete local file
    const filePath = path.join(__dirname, '../../public', doc.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.spmbLiterasiDocument.delete({ where: { id } });
    res.status(200).json({ message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting literasi document:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.chatWithDocument = async (req, res) => {
  try {
    const { documentId, message, history = [] } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY belum dikonfigurasi di server' });
    }
    if (!documentId || !message) {
      return res.status(400).json({ message: 'documentId dan message wajib diisi' });
    }

    const doc = await prisma.spmbLiterasiDocument.findUnique({
      where: { id: documentId }
    });

    if (!doc) {
      return res.status(404).json({ message: 'Dokumen tidak ditemukan' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format chat history for Gemini
    let formattedHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    // Gemini requires history to start with a 'user' role
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    // Start Chat Session
    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: {
        role: "system",
        parts: [{ text: `Kamu adalah asisten ahli yang bertugas menjawab pertanyaan pengguna DENGAN SANGAT AKURAT berdasarkan dokumen yang diberikan.\n\nAturan:\n1. Jawab HANYA menggunakan informasi dari dokumen berikut.\n2. Jika informasi tidak ada di dalam dokumen, katakan "Maaf, informasi tersebut tidak ditemukan dalam dokumen."\n3. Jangan mengarang informasi.\n4. Berikan jawaban dalam bahasa Indonesia yang profesional dan mudah dipahami.\n\n--- MULAI DOKUMEN ---\nJUDUL: ${doc.title}\nISI:\n${doc.textContent}\n--- AKHIR DOKUMEN ---` }]
      }
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error('Error in chatWithDocument:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghubungi AI', error: error.message });
  }
};
