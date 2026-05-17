<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesantren Al-Ikhlas | Membangun Generasi Qur'ani</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .arabic { font-family: 'Amiri', serif; }
        .gradient-overlay {
            background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6));
        }
        .nav-scrolled {
            background-color: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            color: #1e293b;
        }
        html { scroll-behavior: smooth; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 overflow-x-hidden">

    <nav id="navbar" class="fixed w-full z-50 transition-all duration-300 py-4 px-6 md:px-12 flex justify-between items-center text-white">
        <div class="flex items-center gap-2">
            <div class="bg-emerald-600 p-2 rounded-lg">
                <i class="fas fa-mosque text-2xl"></i>
            </div>
            <span class="text-xl font-bold tracking-tight">AL-IKHLAS</span>
        </div>
        
        <div class="hidden md:flex gap-8 font-medium">
            <a href="#beranda" class="hover:text-emerald-500 transition">Beranda</a>
            <a href="#tentang" class="hover:text-emerald-500 transition">Tentang</a>
            <a href="#program" class="hover:text-emerald-500 transition">Program</a>
            <a href="#fasilitas" class="hover:text-emerald-500 transition">Fasilitas</a>
            <a href="#kontak" class="hover:text-emerald-500 transition">Kontak</a>
        </div>

        <div class="flex items-center gap-4">
            <a href="#daftar" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-semibold transition shadow-lg">Daftar Sekarang</a>
            <button id="mobile-menu-btn" class="md:hidden text-2xl"><i class="fas fa-bars"></i></button>
        </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div id="mobile-menu" class="fixed inset-0 bg-slate-900 z-[60] flex flex-col items-center justify-center gap-8 text-white text-2xl font-bold transition-all duration-500 opacity-0 pointer-events-none">
        <button id="close-menu" class="absolute top-8 right-8"><i class="fas fa-times"></i></button>
        <a href="#beranda" class="mobile-link">Beranda</a>
        <a href="#tentang" class="mobile-link">Tentang</a>
        <a href="#program" class="mobile-link">Program</a>
        <a href="#fasilitas" class="mobile-link">Fasilitas</a>
        <a href="#kontak" class="mobile-link">Kontak</a>
    </div>

    <section id="beranda" class="relative h-screen flex items-center justify-center text-center px-4">
        <div class="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop" alt="Background" class="w-full h-full object-cover">
            <div class="absolute inset-0 gradient-overlay"></div>
        </div>
        
        <div class="relative z-10 max-w-4xl">
            <span class="bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 px-4 py-1 rounded-full text-sm font-bold tracking-widest mb-6 inline-block">BOARDING SCHOOL ISLAMI</span>
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Membentuk Generasi <span class="text-emerald-400">Beradab & Berilmu</span>
            </h1>
            <p class="text-slate-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Pusat pendidikan Islam yang memadukan kurikulum pesantren salaf dengan sains modern untuk mencetak santri yang bertaqwa dan kompetitif.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#daftar" class="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-2xl flex items-center justify-center gap-2">
                    Mulai Bergabung <i class="fas fa-arrow-right"></i>
                </a>
                <a href="#program" class="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition">
                    Lihat Program Kami
                </a>
            </div>
        </div>
    </section>

    <section class="py-12 bg-white relative z-10 -mt-12 mx-4 md:mx-12 rounded-2xl shadow-xl grid grid-cols-2 md:grid-cols-4 gap-8 px-8 border-b-4 border-emerald-600">
        <div class="text-center">
            <div class="text-3xl font-bold text-emerald-600">1.200+</div>
            <div class="text-slate-500 text-sm font-medium">Santri Aktif</div>
        </div>
        <div class="text-center border-l md:border-l-slate-200">
            <div class="text-3xl font-bold text-emerald-600">50+</div>
            <div class="text-slate-500 text-sm font-medium">Asatidz Berpengalaman</div>
        </div>
        <div class="text-center border-l-none md:border-l border-slate-200">
            <div class="text-3xl font-bold text-emerald-600">25+</div>
            <div class="text-slate-500 text-sm font-medium">Cabang Alumni</div>
        </div>
        <div class="text-center border-l border-slate-200">
            <div class="text-3xl font-bold text-emerald-600">100%</div>
            <div class="text-slate-500 text-sm font-medium">Lulus Tahfidz</div>
        </div>
    </section>

    <section id="tentang" class="py-24 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
            <span class="text-emerald-600 font-bold tracking-widest text-sm uppercase block mb-4">Mengenal Lebih Dekat</span>
            <h2 class="text-3xl md:text-4xl font-bold mb-6 text-slate-900 leading-snug">Visi Kami Mencetak Ulama yang Intelek & Profesional</h2>
            <p class="text-slate-600 mb-6 leading-relaxed">
                Pesantren Al-Ikhlas didirikan dengan semangat untuk mengembalikan kejayaan peradaban Islam melalui pendidikan yang komprehensif. Kami percaya bahwa setiap anak memiliki potensi untuk menjadi pemimpin masa depan yang berlandaskan Al-Qur'an dan Sunnah.
            </p>
            <ul class="space-y-4 mb-8">
                <li class="flex items-start gap-3">
                    <div class="bg-emerald-100 text-emerald-600 p-1 rounded-full mt-1">
                        <i class="fas fa-check text-xs"></i>
                    </div>
                    <span>Penguasaan Kitab Kuning & Literatur Islam Klasik.</span>
                </li>
                <li class="flex items-start gap-3">
                    <div class="bg-emerald-100 text-emerald-600 p-1 rounded-full mt-1">
                        <i class="fas fa-check text-xs"></i>
                    </div>
                    <span>Kurikulum Nasional dengan Standar Akreditasi A.</span>
                </li>
                <li class="flex items-start gap-3">
                    <div class="bg-emerald-100 text-emerald-600 p-1 rounded-full mt-1">
                        <i class="fas fa-check text-xs"></i>
                    </div>
                    <span>Pembiasaan Bahasa Arab dan Inggris Sehari-hari.</span>
                </li>
            </ul>
            <button class="text-emerald-600 font-bold flex items-center gap-2 hover:gap-4 transition-all">
                Pelajari Selengkapnya <i class="fas fa-arrow-right"></i>
            </button>
        </div>
        <div class="relative">
            <div class="absolute -top-4 -left-4 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl"></div>
            <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl"></div>
            <img src="https://images.unsplash.com/photo-1590076215667-873d96c89bb4?q=80&w=2000&auto=format&fit=crop" alt="Santri" class="rounded-3xl shadow-2xl relative z-10 w-full h-[500px] object-cover">
            <div class="absolute bottom-8 left-8 bg-white p-6 rounded-2xl shadow-xl z-20 max-w-[200px]">
                <p class="italic text-slate-500 text-sm">"Pendidikan adalah senjata paling ampuh untuk mengubah dunia."</p>
            </div>
        </div>
    </section>

    <section id="program" class="py-24 bg-slate-900 text-white">
        <div class="max-w-7xl mx-auto px-6 md:px-12">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Program Unggulan</h2>
                <p class="text-slate-400 max-w-2xl mx-auto">Kami menawarkan berbagai jenjang pendidikan yang dirancang untuk menyeimbangkan kecerdasan spiritual dan intelektual.</p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <!-- Program 1 -->
                <div class="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-emerald-600 transition duration-500 group">
                    <div class="w-16 h-16 bg-emerald-600 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-6 transition">
                        <i class="fas fa-book-open text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Tahfidzul Qur'an</h3>
                    <p class="text-slate-400 group-hover:text-emerald-50 mb-6">Program akselerasi hafalan Al-Qur'an 30 juz dalam 3 tahun dengan metode talaqqi yang bersanad.</p>
                    <ul class="space-y-2 text-sm text-slate-300 group-hover:text-white">
                        <li><i class="fas fa-star text-emerald-500 mr-2"></i> Mutqin 30 Juz</li>
                        <li><i class="fas fa-star text-emerald-500 mr-2"></i> Sertifikat Sanad</li>
                        <li><i class="fas fa-star text-emerald-500 mr-2"></i> Tajwid Standar Madinah</li>
                    </ul>
                </div>

                <!-- Program 2 -->
                <div class="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-emerald-600 transition duration-500 group">
                    <div class="w-16 h-16 bg-emerald-600 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-6 transition">
                        <i class="fas fa-flask text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Sains & Teknologi</h3>
                    <p class="text-slate-400 group-hover:text-emerald-50 mb-6">Membekali santri dengan kemampuan IT, Robotic, dan persiapan masuk perguruan tinggi negeri terbaik.</p>
                    <ul class="space-y-2 text-sm text-slate-300 group-hover:text-white">
                        <li><i class="fas fa-star text-emerald-500 mr-2"></i> Coding & Programming</li>
                        <li><i class="fas fa-star text-emerald-500 mr-2"></i> Olimpiade Sains</li>
                        <li><i class="fas fa-star text-emerald-500 mr-2"></i> Lab Bahasa Modern</li>
                    </ul>
                </div>

                <!-- Program 3 -->
                <div class="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-emerald-600 transition duration-500 group">
                    <div class="w-16 h-16 bg-emerald-600 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-6 transition">
                        <i class="fas fa-scroll text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Dirasah Islamiyah</h3>
                    <p class="text-slate-400 group-hover:text-emerald-50 mb-6">Pendalaman kitab kuning, fiqh, ushul fiqh, dan bahasa Arab secara intensif untuk mencetak calon ulama.</p>
                    <ul class="space-y-2 text-sm text-slate-300 group-hover:text-white">
                        <li><i class="fas fa-star text-emerald-500 mr-2"></i> Bahtsul Masa'il</li>
                        <li><i class="fas fa-star text-emerald-500 mr-2"></i> Nahwu & Shorof</li>
                        <li><i class="fas fa-star text-emerald-500 mr-2"></i> Dakwah & Retorika</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <section id="fasilitas" class="py-24 px-6 md:px-12 bg-white">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div class="max-w-2xl">
                    <span class="text-emerald-600 font-bold tracking-widest text-sm uppercase block mb-2">Fasilitas Penunjang</span>
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-900">Lingkungan Belajar yang Nyaman dan Modern</h2>
                </div>
                <a href="#" class="bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-xl font-bold transition">Lihat Galeri Foto</a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="group relative overflow-hidden rounded-3xl h-64">
                    <img src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent flex items-end p-6">
                        <h4 class="text-white font-bold">Masjid Jami'</h4>
                    </div>
                </div>
                <div class="group relative overflow-hidden rounded-3xl h-64">
                    <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent flex items-end p-6">
                        <h4 class="text-white font-bold">Perpustakaan Digital</h4>
                    </div>
                </div>
                <div class="group relative overflow-hidden rounded-3xl h-64">
                    <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent flex items-end p-6">
                        <h4 class="text-white font-bold">Sport Center</h4>
                    </div>
                </div>
                <div class="group relative overflow-hidden rounded-3xl h-64">
                    <img src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent flex items-end p-6">
                        <h4 class="text-white font-bold">Asrama Eksklusif</h4>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="daftar" class="py-24 px-6 md:px-12 bg-emerald-50">
        <div class="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div class="md:w-2/5 bg-emerald-600 p-12 text-white flex flex-col justify-center">
                <h2 class="text-3xl font-bold mb-6">Penerimaan Santri Baru 2024/2025</h2>
                <p class="text-emerald-100 mb-8 leading-relaxed">
                    Pastikan putra-putri Anda mendapatkan pendidikan terbaik. Slot terbatas untuk setiap jenjangnya.
                </p>
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><i class="fas fa-phone"></i></div>
                        <span>(021) 1234 5678</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><i class="fas fa-envelope"></i></div>
                        <span>daftar@al-ikhlas.com</span>
                    </div>
                </div>
            </div>
            <div class="md:w-3/5 p-12">
                <form id="regForm" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold mb-2">Nama Lengkap Santri</label>
                            <input type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: Ahmad Fauzi">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2">Tempat, Tgl Lahir</label>
                            <input type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Jakarta, 12 Mei 2012">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Pilihan Jenjang</label>
                        <select class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
                            <option>Madrasah Tsanawiyah (MTS)</option>
                            <option>Madrasah Aliyah (MA)</option>
                            <option>Tahfidz Intensif (Pasca SMA)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Alamat Orang Tua / Wali</label>
                        <textarea class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none h-24" placeholder="Alamat lengkap rumah..."></textarea>
                    </div>
                    <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition">Kirim Data Pendaftaran</button>
                    <p class="text-center text-xs text-slate-400 mt-4">Data Anda aman dan akan kami tindaklanjuti dalam 1x24 jam.</p>
                </form>
            </div>
        </div>
    </section>

    <footer id="kontak" class="bg-slate-900 text-slate-300 py-16 px-6 md:px-12">
        <div class="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div class="col-span-1 md:col-span-1">
                <div class="flex items-center gap-2 text-white mb-6">
                    <div class="bg-emerald-600 p-2 rounded-lg">
                        <i class="fas fa-mosque text-2xl"></i>
                    </div>
                    <span class="text-xl font-bold tracking-tight">AL-IKHLAS</span>
                </div>
                <p class="text-sm leading-relaxed mb-6">Mewujudkan sistem pendidikan pesantren yang modern, mandiri, dan berakhlakul karimah untuk kejayaan umat Islam.</p>
                <div class="flex gap-4">
                    <a href="#" class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-600 transition"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-600 transition"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-600 transition"><i class="fab fa-youtube"></i></a>
                </div>
            </div>
            
            <div>
                <h4 class="text-white font-bold mb-6 uppercase text-sm tracking-widest">Tautan Cepat</h4>
                <ul class="space-y-4 text-sm">
                    <li><a href="#" class="hover:text-emerald-400 transition">Berita Pesantren</a></li>
                    <li><a href="#" class="hover:text-emerald-400 transition">Kalender Akademik</a></li>
                    <li><a href="#" class="hover:text-emerald-400 transition">Biaya Pendidikan</a></li>
                    <li><a href="#" class="hover:text-emerald-400 transition">Donasi Pembangunan</a></li>
                </ul>
            </div>

            <div>
                <h4 class="text-white font-bold mb-6 uppercase text-sm tracking-widest">Program</h4>
                <ul class="space-y-4 text-sm">
                    <li><a href="#" class="hover:text-emerald-400 transition">Program Tahfidz</a></li>
                    <li><a href="#" class="hover:text-emerald-400 transition">Bahasa Internasional</a></li>
                    <li><a href="#" class="hover:text-emerald-400 transition">Enterpreneur Santri</a></li>
                    <li><a href="#" class="hover:text-emerald-400 transition">Majelis Ta'lim</a></li>
                </ul>
            </div>

            <div>
                <h4 class="text-white font-bold mb-6 uppercase text-sm tracking-widest">Lokasi</h4>
                <p class="text-sm leading-relaxed mb-4">
                    Jl. Kebahagiaan No. 45, Desa Sukasari, <br>
                    Bogor, Jawa Barat 16123
                </p>
                <div class="rounded-xl overflow-hidden h-32 border border-white/10">
                    <img src="https://placehold.co/400x200/22c55e/ffffff?text=Map+Lokasi" class="w-full h-full object-cover">
                </div>
            </div>
        </div>
        
        <div class="max-w-7xl mx-auto border-t border-white/10 mt-16 pt-8 text-center text-xs">
            <p>&copy; 2024 Pesantren Al-Ikhlas Modern Boarding School. All Rights Reserved.</p>
        </div>
    </footer>

    <!-- Success Message Box -->
    <div id="success-box" class="fixed top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] transform -translate-y-40 transition-all duration-500 opacity-0">
        <div class="flex items-center gap-3">
            <i class="fas fa-check-circle text-2xl"></i>
            <div>
                <p class="font-bold">Berhasil Terkirim!</p>
                <p class="text-sm opacity-90">Tim kami akan segera menghubungi Anda.</p>
            </div>
        </div>
    </div>

    <script>
        // Navbar scroll effect
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('nav-scrolled');
            } else {
                navbar.classList.remove('nav-scrolled');
            }
        });

        // Mobile Menu Logic
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('close-menu');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-link');

        function toggleMenu() {
            mobileMenu.classList.toggle('opacity-0');
            mobileMenu.classList.toggle('pointer-events-none');
            document.body.classList.toggle('overflow-hidden');
        }

        mobileBtn.addEventListener('click', toggleMenu);
        closeBtn.addEventListener('click', toggleMenu);
        mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

        // Form Submission Interaction
        const regForm = document.getElementById('regForm');
        const successBox = document.getElementById('success-box');

        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate sending
            const btn = regForm.querySelector('button');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Mengirim...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = 'Kirim Data Pendaftaran';
                btn.disabled = false;
                regForm.reset();
                
                // Show Success Message
                successBox.classList.remove('-translate-y-40', 'opacity-0');
                setTimeout(() => {
                    successBox.classList.add('-translate-y-40', 'opacity-0');
                }, 4000);
            }, 1500);
        });

        // Reveal animations on scroll simple implementation
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);

        // Add simple fade in style
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fadeIn 0.8s ease-out forwards;
            }
        `;
        document.head.appendChild(style);

        // Apply to sections
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            observer.observe(section);
        });
    </script>
</body>
</html>