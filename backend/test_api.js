const jwt = require('jsonwebtoken');
const token = jwt.sign({ role: 'ADMIN_PUSAT', id: 'test' }, 'fallback_secret_123');

fetch('http://localhost:3000/api/admin/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    rencanaPekerjaan: 'Test',
    kategori: 'JANGKA_PENDEK',
    prioritas: 'Sedang',
    sumberTugas: 'Perencanaan',
    status: 'REGISTER',
    tanggalMulai: '2026-05-11',
    tanggalSelesai: '2026-05-15'
  })
}).then(res => res.json()).then(console.log).catch(console.error);
