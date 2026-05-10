"use client";

import { useEffect, useState } from "react";
import { Info, Users, LayoutDashboard, GraduationCap, MonitorSmartphone, Monitor, Presentation } from "lucide-react";

export default function TentangPage() {
  const [activeTab, setActiveTab] = useState("aplikasi"); // "aplikasi" | "organisasi"

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative pb-10">
      
      {/* Spider Web Cursor Effect */}
      <SpiderWebEffect />

      {/* TABS NAVIGATION */}
      <div className="max-w-5xl mx-auto flex gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab("aplikasi")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === "aplikasi"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
          }`}
        >
          <Info size={18} />
          Tentang Aplikasi
        </button>
        <button
          onClick={() => setActiveTab("organisasi")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === "organisasi"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
          }`}
        >
          <Users size={18} />
          Struktur Organisasi
        </button>
      </div>

      {activeTab === "aplikasi" && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors max-w-5xl mx-auto relative overflow-hidden animate-in slide-in-from-bottom-4">
          
          {/* Background Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

          {/* HEADER SECTION */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center pb-8 border-b border-slate-100 dark:border-slate-800 transition-colors">
            <img 
              src="/logo.png" 
              alt="Logo My MQBS" 
              className="w-32 h-auto mb-6 drop-shadow-2xl transition-transform hover:scale-105"
            />
            <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 transition-colors">
              My MQBS
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium italic mb-4 text-lg">"Setiap Perkembangan Adalah Kebahagiaan Bersama"</p>
            
            <div className="space-y-1 text-slate-600 dark:text-slate-300 transition-colors">
              <p className="font-bold text-lg">Madinatul Qur'an Boarding School</p>
              <p className="text-sm">Yayasan Zamzami Internasional</p>
            </div>

            <span className="mt-6 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold transition-colors shadow-inner border border-slate-200 dark:border-slate-700">
              Versi 1.0.0 (Admin Core)
            </span>
          </div>

          {/* ECOSYSTEM SECTION */}
          <div className="py-10 border-b border-slate-100 dark:border-slate-800 transition-colors relative z-10">
            <h3 className="text-2xl font-black text-center text-slate-800 dark:text-slate-100 mb-8 transition-colors">Ekosistem Aplikasi My MQBS</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Portal Santri */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group flex flex-col">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner">
                  <Monitor size={24} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">Portal Santri</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors flex-1">
                  Layar monitor interaktif yang ditempatkan di ruang umum asrama/sekolah. Memungkinkan santri untuk melihat pencapaian hafalan, nilai, pelanggaran, hingga pengumuman terkini secara mandiri dan *real-time*.
                </p>
              </div>

              {/* Portal Wali Santri */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group flex flex-col">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
                  <MonitorSmartphone size={24} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">Portal Wali Santri</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors flex-1">
                  Aplikasi khusus bagi orang tua/wali untuk memantau perkembangan akademik anak, histori kesehatan, riwayat pelanggaran, pengumuman yayasan, serta kemudahan pengecekan & pembayaran tagihan SPP.
                </p>
              </div>

              {/* Portal Asatidz */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group flex flex-col">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner">
                  <Presentation size={24} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">Portal Asatidz</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors flex-1">
                  Pusat kontrol bagi ustadz dan musyrif untuk menginput nilai harian, setoran hafalan Qur'an, poin kedisiplinan, dan asrama secara cepat, terintegrasi langsung ke pusat data.
                </p>
              </div>

              {/* Portal Manajemen */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group flex flex-col">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
                  <LayoutDashboard size={24} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">Portal Manajemen</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors flex-1">
                  Aplikasi kendali utama bagi pengurus yayasan, direktur, dan kepala bidang untuk memantau indikator kinerja utama (KPI), rekapitulasi keuangan, serta pengambilan keputusan strategis berbasis data komprehensif.
                </p>
              </div>

              {/* Portal Alumni */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 group flex flex-col lg:col-span-2 xl:col-span-1">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner">
                  <GraduationCap size={24} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">Portal Alumni</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors flex-1">
                  Wadah silaturahmi digital terpadu untuk jaringan alumni MQBS. Menyediakan informasi pengembangan karir, agenda reuni, *update* program wakaf, serta database relasi alumni yang tersebar di berbagai daerah.
                </p>
              </div>
            </div>
          </div>

          {/* TECH & LICENSE SECTION */}
          <div className="pt-8 grid md:grid-cols-2 gap-8 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors">Teknologi & Engine</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 transition-colors">⚛️</div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm transition-colors">Next.js 15 & React 19</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Kerangka kerja frontend modern super cepat</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0 transition-colors">🎨</div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm transition-colors">Tailwind CSS 4.0</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Sistem desain antarmuka & dark mode adaptif</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 shrink-0 transition-colors">🟢</div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm transition-colors">Node.js Express & Prisma ORM</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Manajemen backend dan database PostgreSQL terpusat</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors">Lisensi & Hak Cipta</h3>
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                  Aplikasi ini dikembangkan secara eksklusif untuk kebutuhan internal manajemen administrasi, akademik, keuangan, dan data santri pada instansi <strong>Madinatul Qur'an Boarding School</strong>.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3 transition-colors">
                  Segala bentuk penyalinan, modifikasi, atau distribusi sistem inti tanpa izin tertulis dari pihak Yayasan Zamzami Internasional adalah dilarang.
                </p>
                <p className="text-xs text-slate-400 mt-4 italic transition-colors">
                  © {new Date().getFullYear()} Yayasan Zamzami Internasional. All rights reserved.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === "organisasi" && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors max-w-5xl mx-auto animate-in slide-in-from-bottom-4">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">
              Struktur Organisasi
            </h2>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg uppercase tracking-widest">Yayasan Zamzami Internasional</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Madinatul Qur'an Boarding School</p>
          </div>

          <div className="flex flex-col items-center max-w-4xl mx-auto">
            
            {/* LEVEL 1: Pengasuh */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white px-8 py-4 rounded-2xl shadow-lg border border-emerald-500/30 text-center relative z-10 w-80">
                <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-200 mb-1">Pengasuh</p>
                <h3 className="font-bold text-lg">Ust Fauzan Abdullah, ST., Lc., MA.</h3>
              </div>
              <div className="w-1 h-10 bg-emerald-500/30"></div>
            </div>

            {/* LEVEL 2: Ketua Yayasan */}
            <div className="flex flex-col items-center">
              <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500 text-slate-800 dark:text-slate-100 px-8 py-4 rounded-2xl shadow-md text-center relative z-10 w-80">
                <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 mb-1">Ketua Yayasan</p>
                <h3 className="font-bold text-base">Ust Sandi Junaedi</h3>
              </div>
              <div className="w-1 h-10 bg-slate-300 dark:bg-slate-700"></div>
            </div>

            {/* LEVEL 3: Direktorat Pusat */}
            <div className="flex flex-col items-center w-full">
              <div className="bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 px-10 py-3 rounded-xl shadow-md text-center relative z-10 font-black tracking-wide">
                Direktorat Pusat dan Markaz
              </div>
              
              {/* Connector line split */}
              <div className="w-1 h-8 bg-slate-300 dark:bg-slate-700"></div>
              
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 relative pt-6 border-t-2 border-slate-300 dark:border-slate-700">
                {/* Visual connecting lines to the columns */}
                <div className="absolute top-0 left-1/4 w-0.5 h-6 bg-slate-300 dark:bg-slate-700 hidden md:block"></div>
                <div className="absolute top-0 right-1/4 w-0.5 h-6 bg-slate-300 dark:bg-slate-700 hidden md:block"></div>
                <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-slate-300 dark:bg-slate-700 md:hidden"></div>

                {/* Left Column: 6 Bidang */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 md:p-6 shadow-sm relative">
                  {/* Visual connector */}
                  <div className="absolute -top-[26px] left-1/2 w-0.5 h-[26px] bg-slate-300 dark:bg-slate-700 hidden md:block -ml-[1px]"></div>
                  
                  <div className="text-center mb-6">
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-800">Bidang Struktural</span>
                  </div>
                  
                  <div className="space-y-3">
                    <OrgCard role="Bidang Sekretariat & Administrasi" name="Bpk Gusti Pordimansyah, SH." />
                    <OrgCard role="Bidang Litbang & Budaya Organisasi" name="Ust Abu Sena Wijanarko, S.Kom." />
                    <OrgCard role="Bidang Keuangan & Usaha Mandiri" name="Ust Sandi Junaedi" badge="PJS" />
                    <OrgCard role="Bidang Legal & Aset" name="Bpk Robby Nugraha, S.Pt." />
                    <OrgCard role="Bidang Komunikasi & Pemasaran" name="Ust Abu Sena Wijanarko, S.Kom." badge="PJS" />
                    <OrgCard role="Pengelolaan Dapur Pusat" name="Mbah" />
                  </div>
                </div>

                {/* Right Column: Markaz */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 md:p-6 shadow-sm relative">
                  {/* Visual connector */}
                  <div className="absolute -top-[26px] left-1/2 w-0.5 h-[26px] bg-slate-300 dark:bg-slate-700 hidden md:block -ml-[1px]"></div>
                  
                  <div className="text-center mb-6">
                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-purple-200 dark:border-purple-800">Unit Markaz</span>
                  </div>

                  <div className="space-y-4">
                    <MarkazGroup 
                      role="Mudir Markaz MQBS 1" 
                      name="Ust Abdul Ghofar, S.S., M.Pd." 
                      subordinates={[
                        { role: "Layanan Umum", name: "..." },
                        { role: "Waka Qur'an", name: "Ust. Budiyanto, S.Pd." },
                        { role: "Waka Akademik", name: "Ust Hidayatulloh, S.Pd" },
                        { role: "Waka Kesantrian", name: "Ust Ali Murtapi, Lc." }
                      ]}
                    />
                    <MarkazGroup 
                      role="Mudir Markaz MQBS 2" 
                      name="Ust Abdul Ropi, Lc." 
                      subordinates={[
                        { role: "Layanan Umum", name: "..." },
                        { role: "Waka Qur'an", name: "Ust. Wisnu Jabar Pamungkas, S.Pd." },
                        { role: "Waka Akademik", name: "Ust Aji Abdul Wahab, S.Pd., M.Pd." },
                        { role: "Waka Kesantrian", name: "Ust Habib Mujadid, Lc." }
                      ]}
                    />
                    <MarkazGroup 
                      role="Mudir Markaz MQBS 3" 
                      name="Ummu Sholeh" 
                      subordinates={[
                        { role: "Layanan Umum", name: "..." },
                        { role: "Waka Qur'an", name: "Ustz Suci Lestari" },
                        { role: "Waka Akademik", name: "Nesa Nelania, S.Pd.", badge: "PJ" },
                        { role: "Waka Kesantrian", name: "Ustz Ummu Husam" }
                      ]}
                    />
                    <MarkazGroup 
                      role="Kepala SD" 
                      name="Ummu Sholeh" 
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component for individual cards in the Org Chart
function OrgCard({ role, name, badge, highlight, small }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-colors ${
      highlight 
        ? "bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700" 
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
    }`}>
      <div className="mb-1 sm:mb-0 pr-2">
        <p className={`font-bold uppercase tracking-wider ${small ? "text-[9px]" : "text-[11px]"} ${highlight ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
          {role}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-bold text-slate-800 dark:text-slate-100 ${small ? "text-xs" : "text-sm"}`}>{name}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

// Sub-component for Markaz Group (Mudir + Subordinates)
function MarkazGroup({ role, name, subordinates }) {
  return (
    <div className="flex flex-col">
      <OrgCard role={role} name={name} highlight />
      {subordinates && subordinates.length > 0 && (
        <div className="ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 mt-2 space-y-2">
          {subordinates.map((sub, i) => (
            <OrgCard key={i} role={sub.role} name={sub.name} badge={sub.badge} small />
          ))}
        </div>
      )}
    </div>
  );
}

function SpiderWebEffect() {
  useEffect(() => {
    const canvas = document.getElementById("spider-web-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    const particles = [];
    const properties = {
      particleColor: 'rgba(16, 185, 129, 0.5)', // emerald-500 equivalent
      particleRadius: 2.5,
      particleCount: 60,
      particleMaxVelocity: 0.6,
      lineLength: 160,
    };

    let mouse = { x: null, y: null };
    
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    class Particle {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.velocityX = Math.random() * (properties.particleMaxVelocity * 2) - properties.particleMaxVelocity;
        this.velocityY = Math.random() * (properties.particleMaxVelocity * 2) - properties.particleMaxVelocity;
      }
      position() {
        // Bounce off edges
        if (this.x + this.velocityX > w && this.velocityX > 0 || this.x + this.velocityX < 0 && this.velocityX < 0) this.velocityX *= -1;
        if (this.y + this.velocityY > h && this.velocityY > 0 || this.y + this.velocityY < 0 && this.velocityY < 0) this.velocityY *= -1;
        this.x += this.velocityX;
        this.y += this.velocityY;
      }
      reDraw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, properties.particleRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = properties.particleColor;
        ctx.fill();
      }
    }

    for (let i = 0 ; i < properties.particleCount ; i++) {
      particles.push(new Particle());
    }

    function drawLines() {
      let x1, y1, x2, y2, length, opacity;
      for (let i = 0; i < properties.particleCount; i++) {
        for (let j = i + 1; j < properties.particleCount; j++) {
          x1 = particles[i].x;
          y1 = particles[i].y;
          x2 = particles[j].x;
          y2 = particles[j].y;
          length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          if (length < properties.lineLength) {
            opacity = 1 - length / properties.lineLength;
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.4})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
          }
        }
        
        // Line to mouse
        if (mouse.x !== null && mouse.y !== null) {
          x1 = particles[i].x;
          y1 = particles[i].y;
          x2 = mouse.x;
          y2 = mouse.y;
          length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          if (length < properties.lineLength * 1.5) {
            opacity = 1 - length / (properties.lineLength * 1.5);
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.8})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
    }

    let animationId;
    function loop() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < properties.particleCount; i++) {
        particles[i].position();
        particles[i].reDraw();
      }
      drawLines();
      animationId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return <canvas id="spider-web-canvas" className="pointer-events-none fixed inset-0 z-50 opacity-70"></canvas>;
}
