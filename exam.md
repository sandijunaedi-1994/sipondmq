1. Struktur Data (Prisma/Sequelize Schema)
Untuk mendukung Unified Database, Akang butuh skema yang menghubungkan soal dengan progres santri:
- Table Exams: Menyimpan data induk ujian (durasi, ambang batas nilai, jadwal).
- Table Questions: Bank soal (teks, gambar, pilihan jawaban, kunci jawaban terenkripsi), dan kategori soal (diniyah, matematika, bahasa arab (untuk SMA)). Soalnya 20 pilihan ganda
- Table ExamAttempts: Mencatat sesi ujian tiap santri (kapan mulai, sisa waktu, status proctoring).
- Table Answers: Menyimpan jawaban santri secara real-time (biar kalau koneksi putus, jawaban tidak hilang).
2. Implementasi Sistem Proctoring (Detection)Sesuai Section 1.4, sistem harus bisa mendeteksi kecurangan. Di Node.js, Akang bisa menggunakan pendekatan ini:
- Frontend (Browser): Gunakan visibilitychange API untuk mendeteksi saat santri pindah tab atau meminimalkan browser.
- Backend (Node.js): Buat endpoint /log-event. Setiap kali santri pindah tab, kirim data ke backend untuk dicatat di Audit Trail.
- Contoh Log: { "userId": "S001", "event": "TAB_SWITCHED", "timestamp": "2026-04-25T14:00:00Z" }.
3. Logika Real-Time Timer (Socket.io)
Jangan hanya mengandalkan timer di sisi klien (karena bisa dimanipulasi).
- Gunakan Socket.io untuk melakukan sinkronisasi waktu antara server dan browser setiap beberapa detik.
- Jika waktu di server habis, backend akan memicu fungsi auto-submit untuk mengunci jawaban dan mengubah status pendaftaran di Selection Milestone Tracker menjadi "Selesai".
4. Keamanan Data & Integritas (UU PDP)Karena ini data sensitif calon santri, pastikan:
- Enkripsi: Simpan kunci jawaban menggunakan hashing agar admin IT pun tidak bisa membocorkan soal sebelum ujian.
- Access Control: Pastikan hanya santri dengan status "Sudah Bayar PSB" yang bisa mendapatkan token akses ke modul ujian.
- OTP Access: Login tetap menggunakan WhatsApp OTP agar tidak ada joki yang masuk sembarangan.
5. Integrasi Milestone
Setelah fungsi submit dijalankan, sistem Node.js Akang harus otomatis:
- Menghitung nilai (untuk soal pilihan ganda).
- Memperbarui Progress Bar di akun Wali Santri secara transparan.
- Mengirimkan notifikasi WhatsApp bahwa "Ujian telah selesai dilaksanakan"