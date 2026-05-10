# **Project Brief: Pengembangan Aplikasi My MQ (Flutter)**

## **1\. Pendahuluan & Visi Produk**

**My MQ** adalah ekosistem digital terpadu untuk Pesantren yang dirancang untuk memberikan pengalaman "Seamless & Omni-channel" bagi calon wali santri dan pengelola. Fokus utama fase pertama adalah digitalisasi proses **Penerimaan Peserta Didik Baru (PPDB)** dan **Manajemen Pembayaran Tagihan**.

## **2\. Target Pengguna (User Roles)**

1. **Calon Wali Santri:** Pendaftar baru yang akan melakukan registrasi, mengunggah berkas, dan memantau progres seleksi.  
2. **Wali Santri Aktif:** Orang tua yang telah terdaftar dan menggunakan aplikasi untuk membayar tagihan bulanan (SPP) atau biaya lainnya.  
3. **Admin Pusat:** Pengelola pesantren yang melakukan review dokumen, manajemen data, dan rekonsiliasi keuangan.

## **3\. Cakupan Fitur Utama (MVP \- Phase 1\)**

### **A. Modul PPDB (Omni-Channel Registration)**

Fitur ini dirancang untuk memudahkan pendaftaran awal dengan input yang minimalis:

* **Simple Registration Form:** Pendaftar hanya perlu mengisi data berikut pada tahap awal:  
  * **Tahun Ajaran:** Pilihan tahun akademik yang dituju.  
  * **Program:** Dropdown pilihan (SD, SMP, SMA, atau Ma'had Aly).  
  * **Jenis Kelamin:** Laki-laki / Perempuan.  
  * **Asal Sekolah:** Nama sekolah sebelumnya.  
  * **Email:** Untuk korespondensi digital.  
  * **Nomor Kontak Utama:** Nomor WhatsApp aktif untuk pengiriman kredensial.  
  * **Sumber Informasi (Dropdown):**  
    * Facebook  
    * Instagram  
    * TikTok  
    * YouTube  
    * Google Search / Website Resmi  
    * Rekomendasi Guru / Alumni / Keluarga  
    * Iklan Banner / Brosur / Spanduk  
    * Event / Sosialisasi Sekolah  
    * Lainnya  
  * **Alasan Memilih Madinatul Qur'an:** Motivasi pendaftaran.  
* **Dual-Platform Experience:** Pengembangan menggunakan Flutter untuk Android/iOS dengan sinkronisasi data real-time ke dashboard admin berbasis web.  
* **Automated Onboarding:** Pengiriman kredensial (Username/Password) otomatis via WhatsApp API dan Email segera setelah pendaftaran awal selesai.  
* **Selection Milestone Tracker:** Progress bar interaktif untuk memantau status (Administrasi \-\> Pembayaran \-\> Tes \-\> Wawancara \-\> Kelulusan).  
* **Document Vault:** Unggah berkas digital (Ijazah, KK, Akta) dengan status review (Diterima/Ditolak/Revisi).  
* **Virtual Participant Card:** Generate kartu ujian otomatis dengan QR Code yang bisa diunduh langsung dari aplikasi.

### **B. Modul Pembayaran & Tagihan (Fintech Integration)**

* **Payment Gateway Integration:** Pembayaran via Virtual Account (VA), E-Wallet, dan QRIS (Midtrans/Xendit).  
* **Billing Dashboard:** Tampilan daftar tagihan (Biaya Pendaftaran, Uang Masuk, dan SPP Bulanan).  
* **Instant Verification:** Status pembayaran berubah menjadi "Lunas" secara otomatis tanpa perlu konfirmasi manual atau kirim bukti transfer.  
* **Digital Receipt:** Penerbitan kuitansi digital otomatis sebagai bukti sah transaksi.

### **C. Digital Selection Suite**

* **Simple CBT Proctoring:** Ujian akademik di dalam aplikasi dengan deteksi pindah tab/aplikasi (*app-switch detection*).  
* **Virtual Interview Room:** Integrasi video call langsung di dalam aplikasi My MQ.

## **4\. Spesifikasi Teknis & Arsitektur**

* **Frontend:** Flutter (Android & iOS).  
* **Backend:** Node.js.  
* **Database Design (Identity Management):**  
  * **Primary Key:** Menggunakan **UniqueID (UUID)** yang dihasilkan sistem, bukan email.  
  * **Auth Method:** Mendukung login menggunakan **Email** atau **Nomor HP** (keduanya harus unik dalam database).  
  * **Database Engine:** MySQL.  
* **Security:** JWT Authentication, SSL Encryption, dan input validation.

## **5\. Rencana Tahapan Pengembangan (Milestones)**

| Milestone | Aktivitas | Output Utama |
| :---- | :---- | :---- |
| **M1: Discovery** | Analisis UI/UX & Flow Chart | Wireframe & Prototype Figma |
| **M2: Core PPDB** | Form Reg (8 Field), Auth, & Tracker | Aplikasi Flutter (Alpha) |
| **M3: Finance** | Integrasi Payment Gateway & Tagihan | Sistem Pembayaran Otomatis |
| **M4: Selection** | Fitur CBT & Video Call Integration | Modul Seleksi Digital |
| **M5: Admin Web** | Dashboard Review & Migrasi Data | Panel Kontrol Pusat |
| **M6: Launch** | QA, Stress Test, & Deployment | App Store & Play Store Release |

## **6\. Fitur Pasca-Seleksi (Post-Selection Smart Mapping)**

Setelah santri dinyatakan lulus:

1. **Data Mapping:** Pengelompokan Kamar dan Kelas otomatis.  
2. **Profile Migration:** Migrasi status dari "Calon Santri" ke "Santri Aktif".  
3. **Initial Billing:** Otomatisasi pembuatan tagihan Uang Masuk/Daftar Ulang.

**Catatan untuk Antigravity:**

* Pastikan sistem login dapat mengenali apakah input pengguna berupa format email atau nomor telepon secara dinamis.  
* Prioritaskan kestabilan notifikasi WhatsApp karena merupakan kanal utama pengiriman akses akun.

Akun FTP
username: mymq@mq.zamzami.or.id
ftp host: 185.229.118.152
password: 7#kHl0vBm=zFM^Vo

Akun Database Phpmyadmin
username: ponp9455_mymq
nama database: ponp9455_mymq
password database: e!XtA=&PERohM=!x

Link hosting mq.zamzami.or.id