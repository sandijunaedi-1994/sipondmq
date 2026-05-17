'use client';

// Flip Card styles injected once
const FLIP_STYLE = `
  .flip-card { perspective: 1000px; }
  .flip-inner { transition: transform 0.65s cubic-bezier(.4,0,.2,1); transform-style: preserve-3d; position: relative; }
  .flip-inner.flipped { transform: rotateY(180deg); }
  .flip-front, .flip-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .flip-back { transform: rotateY(180deg); }
`;

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const PROGRAMS = [
  {
    icon: '📖',
    title: 'SD Tahfidz',
    desc: 'Fondasi kuat akhlak dan hafalan Juz 30 untuk anak usia dini dengan pendampingan intensif.',
    highlights: [
      'Target hafalan Juz 30 sebelum lulus',
      'Pembelajaran Al-Qur\'an dengan metode talaqqi',
      'Kurikulum SD terintegrasi pesantren',
      'Pembentukan karakter sejak dini',
      'Pembiasaan shalat berjamaah & ibadah harian',
    ],
  },
  {
    icon: '🏫',
    title: 'SMP Tahfidz',
    desc: 'Pendalaman tahfidz dan ilmu agama serta kurikulum nasional untuk jenjang menengah pertama.',
    highlights: [
      'Target hafalan 15 - 20 juz',
      'Pelajaran bahasa Arab dan Inggris harian',
      'Kurikulum nasional terintegrasi pesantren',
      'Kegiatan ekstrakurikuler islami',
      'Bimbingan konseling dan pengembangan diri',
    ],
  },
  {
    icon: '🎓',
    title: 'SMA Tahfidz',
    desc: 'Persiapan perguruan tinggi terbaik dengan bekal hafalan mutqin dan prestasi akademik.',
    highlights: [
      'Target hafalan 30 juz mutqin',
      'Persiapan SNBP & SNBT perguruan tinggi negeri',
      'Program Olimpiade Sains & keagamaan',
      'Pelatihan kepemimpinan & organisasi',
      'Bimbingan beasiswa dalam & luar negeri',
    ],
  },
  {
    icon: '📜',
    title: "Ma'had Aly",
    desc: "Program intensif ulama muda dengan kajian kitab kuning dan tahfidz mendalam pasca SMA.",
    highlights: [
      'Kajian kitab kuning intensif',
      'Pendalaman Fiqh, Ushul Fiqh & Hadits',
      'Nahwu, Shorof & Balaghah tingkat lanjut',
      'Riset & Bahtsul Masa\'il',
      'Persiapan dakwah & retorika publik',
    ],
  },
];

export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [flipped, setFlipped] = useState({});

  const toggleFlip = (i) => setFlipped(prev => ({ ...prev, [i]: !prev[i] }));

  useEffect(() => {
    setIsClient(true);
    // Inject flip styles
    if (!document.getElementById('flip-styles')) {
      const s = document.createElement('style');
      s.id = 'flip-styles';
      s.innerHTML = FLIP_STYLE;
      document.head.appendChild(s);
    }
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#beranda', label: 'Beranda' },
    { href: '#tentang', label: 'Tentang' },
    { href: '#program', label: 'Program' },
    { href: '#fasilitas', label: 'Fasilitas' },
    { href: '#spmb', label: 'SPMB' },
  ];

  return (
    <div className="bg-slate-50 text-slate-800 overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav
        className="fixed w-full z-50 transition-all duration-300 py-4 px-6 md:px-12 flex justify-between items-center"
        style={{
          backgroundColor: navScrolled ? 'white' : 'transparent',
          boxShadow: navScrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
          color: navScrolled ? '#1e293b' : 'white',
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo MQ" className="w-10 h-10 object-contain" />
          <div>
            <span className="font-extrabold text-sm leading-tight block">MADINATUL QUR'AN</span>
            <span className={`text-[10px] font-medium tracking-widest ${navScrolled ? 'text-emerald-600' : 'text-emerald-300'}`}>BOARDING SCHOOL</span>
          </div>
        </div>

        <div className="hidden md:flex gap-7 font-semibold text-sm">
          {navLinks.map(l => (
            <a key={l.href} href={l.href}
              className={`hover:text-emerald-500 transition ${navScrolled ? 'text-slate-700' : 'text-white'}`}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className={`hidden md:block text-sm font-bold px-4 py-2 rounded-lg transition ${navScrolled ? 'text-slate-700 hover:text-emerald-600' : 'text-white hover:text-emerald-200'}`}>
            Login
          </Link>
          <Link href="/register"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-5 py-2.5 rounded-xl font-bold transition shadow-lg">
            Daftar Sekarang
          </Link>
          <button className="md:hidden text-2xl" onClick={() => setMobileOpen(true)}>☰</button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900 z-[60] flex flex-col items-center justify-center gap-8 text-white text-2xl font-bold">
          <button className="absolute top-8 right-8 text-3xl" onClick={() => setMobileOpen(false)}>✕</button>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="hover:text-emerald-400 transition">{l.label}</a>
          ))}
          <Link href="/login" onClick={() => setMobileOpen(false)} className="text-emerald-300">Login</Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section id="beranda" className="relative h-screen flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop"
            alt="Madinatul Qur'an Boarding School"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>
        {isClient && <SpiderWebEffect />}

        <div className="relative z-10 max-w-4xl mx-auto">
          <img src="/logo.png" alt="Logo MQ" className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto mb-6 drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
          <span className="bg-emerald-600/30 border border-emerald-400/50 text-emerald-300 px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6 inline-block uppercase">
            Boarding School Islami • Est. 2008
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-tight">
            Madinatul Qur'an <br />
            <span className="text-emerald-400">Boarding School</span>
          </h1>
          <p className="text-slate-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Membentuk generasi Qur'ani yang beradab, berilmu, dan berdaya saing global. Daftar sekarang untuk Tahun Ajaran 2027/2028.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-lg transition shadow-2xl shadow-emerald-900/50 flex items-center justify-center gap-2">
              Mulai Pendaftaran →
            </Link>
            <a href="#program"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-2xl font-bold text-lg transition">
              Lihat Program Kami
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="relative z-10 -mt-10 mx-4 md:mx-12">
        <div className="bg-white rounded-2xl shadow-xl border-b-4 border-emerald-500 grid grid-cols-2 md:grid-cols-4 gap-0 overflow-hidden">
          {[
            { value: '1.200+', label: 'Santri Aktif' },
            { value: '3', label: 'Kampus' },
            { value: '30 Juz', label: 'Target Hafalan' },
            { value: '100%', label: 'Lulus Tahfidz' },
          ].map((s, i) => (
            <div key={i} className={`text-center py-6 px-4 ${i > 0 ? 'border-l border-slate-100' : ''}`}>
              <div className="text-2xl md:text-3xl font-extrabold text-emerald-600">{s.value}</div>
              <div className="text-slate-500 text-xs md:text-sm font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TENTANG ── */}
      <section id="tentang" className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-emerald-600 font-bold tracking-widest text-sm uppercase block mb-3">Mengenal Lebih Dekat</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-slate-900 leading-snug">
            Visi Membangun Generasi Qur'ani, Berkarakter, dan Visioner
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Madinatul Qur'an Boarding School hadir dengan semangat mengembalikan kejayaan peradaban Islam melalui pendidikan yang komprehensif. Kami percaya setiap anak memiliki potensi untuk menjadi pemimpin masa depan yang berlandaskan Al-Qur'an dan Sunnah.
          </p>
          <ul className="space-y-4 mb-8">
            {[
              'Program tahfidz 30 juz dengan metode talaqqi bersanad',
              'Kurikulum nasional terintegrasi dengan pendidikan pesantren',
              'Penanaman Karakter Kepemimpinan dan Kemandirian',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/register" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-4 transition-all">
            Mulai Pendaftaran Sekarang →
          </Link>
        </div>
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-200/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-300/40 rounded-full blur-3xl" />
          <img
            src="https://images.unsplash.com/photo-1590076215667-873d96c89bb4?q=80&w=2000&auto=format&fit=crop"
            alt="Santri Madinatul Qur'an"
            className="rounded-3xl shadow-2xl relative z-10 w-full h-[480px] object-cover"
          />
          <div className="absolute bottom-8 left-8 bg-white p-5 rounded-2xl shadow-xl z-20 max-w-[220px]">
            <p className="text-emerald-600 font-bold text-sm mb-1">🕌 Lingkungan Islami</p>
            <p className="italic text-slate-500 text-xs leading-relaxed">"Tempat terbaik membentuk karakter dan hafalan Al-Qur'an anak Anda."</p>
          </div>
        </div>
      </section>

      {/* ── PROGRAM ── */}
      <section id="program" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-bold tracking-widest text-sm uppercase block mb-3">Jenjang Pendidikan</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Program Unggulan</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Kami menyediakan berbagai jenjang pendidikan yang memadukan kecerdasan spiritual, intelektual, dan emosional.</p>
          </div>
          <p className="text-slate-400 text-sm mb-10">✦ Klik kartu untuk melihat program unggulan setiap jenjang</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROGRAMS.map((p, i) => (
              <div
                key={i}
                className="flip-card cursor-pointer"
                style={{ height: '320px' }}
                onClick={() => toggleFlip(i)}
              >
                <div className={`flip-inner w-full h-full${flipped[i] ? ' flipped' : ''}`}>
                  {/* FRONT */}
                  <div className="flip-front absolute inset-0 bg-white/5 border border-white/10 p-7 rounded-3xl flex flex-col justify-between hover:bg-emerald-700/40 transition-colors">
                    <div>
                      <div className="text-5xl mb-5">{p.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                    </div>
                    <span className="text-emerald-400 text-xs font-bold tracking-wider">TAP UNTUK DETAIL →</span>
                  </div>
                  {/* BACK */}
                  <div className="flip-back absolute inset-0 bg-emerald-600 border border-emerald-500 p-7 rounded-3xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold mb-4 text-white">{p.title}</h3>
                      <ul className="space-y-2.5">
                        {p.highlights.map((h, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-emerald-50">
                            <span className="text-emerald-300 font-bold shrink-0">✓</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <span className="text-emerald-200 text-xs font-bold tracking-wider">TAP UNTUK KEMBALI ←</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FASILITAS ── */}
      <section id="fasilitas" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <span className="text-emerald-600 font-bold tracking-widest text-sm uppercase block mb-2">Fasilitas Penunjang</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Lingkungan Belajar yang Nyaman</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { img: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800', label: "Masjid Jami'" },
              { img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800', label: 'Perpustakaan' },
              { img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800', label: 'Sport Center' },
              { img: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800', label: 'Asrama Modern' },
            ].map((f, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl h-52 md:h-64 cursor-default">
                <img src={f.img} alt={f.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-5">
                  <h4 className="text-white font-bold text-sm md:text-base">{f.label}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPMB / PENDAFTARAN ── */}
      <section id="spmb" className="py-24 px-6 md:px-12 bg-emerald-50">
        <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel */}
          <div className="md:w-2/5 bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 text-white flex flex-col justify-center">
            <img src="/logo.png" alt="Logo MQ" className="w-16 h-16 object-contain mb-6" />
            <h2 className="text-2xl font-extrabold mb-4 leading-snug">Penerimaan Santri Baru 2027/2028</h2>
            <p className="text-emerald-100 mb-8 leading-relaxed text-sm">
              Pastikan putra-putri Anda mendapatkan pendidikan terbaik. Slot terbatas untuk setiap jenjangnya.
            </p>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">📱</div>
                <span>WhatsApp: 0812-xxxx-xxxx</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">📧</div>
                <span>spmb@madinatulquran.id</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">📍</div>
                <span>3 Kampus tersebar di wilayah Jawa Barat</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="md:w-3/5 p-10">
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">Mulai Pendaftaran Online</h3>
            <p className="text-slate-500 text-sm mb-8">Proses pendaftaran cepat, mudah, dan bisa dipantau secara real-time melalui dashboard khusus.</p>

            <div className="space-y-4 mb-8">
              {[
                { step: '1', title: 'Isi Form Pendaftaran', desc: 'Buat akun wali dan isi data calon santri secara online.' },
                { step: '2', title: 'Lengkapi Berkas', desc: 'Upload dokumen yang diperlukan melalui dashboard Anda.' },
                { step: '3', title: 'Tes & Wawancara', desc: 'Ikuti seleksi sesuai jadwal yang sudah ditentukan.' },
                { step: '4', title: 'Pengumuman', desc: 'Pantau hasil seleksi langsung dari dashboard wali.' },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{s.step}</div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{s.title}</p>
                    <p className="text-slate-500 text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-center transition shadow-lg shadow-emerald-500/20">
                Daftar Sekarang
              </Link>
              <Link href="/login"
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl text-center transition">
                Sudah Daftar? Login
              </Link>
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">Data Anda aman dan dilindungi. Tim kami siap membantu.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-300 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 text-white mb-5">
              <img src="/logo.png" alt="Logo MQ" className="w-10 h-10 object-contain" />
              <div>
                <p className="font-extrabold text-sm">MADINATUL QUR'AN</p>
                <p className="text-[10px] text-emerald-400 tracking-widest">BOARDING SCHOOL</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              Mewujudkan sistem pendidikan pesantren modern yang mandiri dan berakhlakul karimah untuk kejayaan umat Islam.
            </p>
            <div className="flex gap-3">
              {['📘', '📸', '▶️', '📱'].map((icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-600 transition text-sm">{icon}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-5 uppercase text-xs tracking-widest">Program</h4>
            <ul className="space-y-3 text-sm">
              {['SD / MI', 'SMP / MTs', 'SMA / MA', "Ma'had Aly", 'Tahfidz Intensif'].map(p => (
                <li key={p}><a href="#program" className="hover:text-emerald-400 transition">{p}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-5 uppercase text-xs tracking-widest">Tautan</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/register" className="hover:text-emerald-400 transition">Pendaftaran Online</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition">Login Dashboard</Link></li>
              <li><a href="#tentang" className="hover:text-emerald-400 transition">Profil Pesantren</a></li>
              <li><a href="#fasilitas" className="hover:text-emerald-400 transition">Fasilitas</a></li>
              <li><a href="#spmb" className="hover:text-emerald-400 transition">Info SPMB</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Madinatul Qur'an Boarding School. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function SpiderWebEffect() {
  useEffect(() => {
    const canvas = document.getElementById('lp-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles = [];
    const count = 50;
    const lineLen = 150;
    let mouse = { x: null, y: null };

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onOut = () => { mouse.x = null; mouse.y = null; };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onOut);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8
      });
    }

    let raf;
    function loop() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        if (p.x + p.vx > w || p.x + p.vx < 0) p.vx *= -1;
        if (p.y + p.vy > h || p.y + p.vy < 0) p.vy *= -1;
        p.x += p.vx; p.y += p.vy;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52,211,153,0.4)'; ctx.fill();
      });
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len < lineLen) {
            ctx.strokeStyle = `rgba(52,211,153,${(1 - len / lineLen) * 0.25})`;
            ctx.lineWidth = 0.5; ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
        if (mouse.x !== null) {
          const dx = particles[i].x - mouse.x, dy = particles[i].y - mouse.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len < lineLen * 1.5) {
            ctx.strokeStyle = `rgba(52,211,153,${(1 - len / (lineLen * 1.5)) * 0.5})`;
            ctx.lineWidth = 1; ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onOut);
    };
  }, []);
  return <canvas id="lp-canvas" className="absolute inset-0 z-[1] pointer-events-none opacity-60" />;
}
