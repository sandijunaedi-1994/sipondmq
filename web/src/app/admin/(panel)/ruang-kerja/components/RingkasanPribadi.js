"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function RingkasanPribadi() {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [currentUserId, setCurrentUserId] = useState("");
  const [subordinates, setSubordinates] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    // Get User ID from Token
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId || payload.id);
      } catch (e) {
        console.error("Failed to parse token", e);
      }
    }
    fetchSubordinates();
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [selectedUserId]);

  const fetchSubordinates = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/hierarchy/subordinates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubordinates(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch subordinates:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const token = localStorage.getItem("admin_token");
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/dashboard/summary`;
      if (selectedUserId) {
        url += `?userId=${selectedUserId}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const [isGeneratingMotivation, setIsGeneratingMotivation] = useState(false);
  const [currentMotivation, setCurrentMotivation] = useState(null);

  const MOTIVATIONS = [
    "Barangsiapa bersungguh-sungguh, sesungguhnya kesungguhannya itu adalah untuk dirinya sendiri. (QS. Al-Ankabut: 6)",
    "Pekerjaan yang paling dicintai Allah adalah yang dilakukan secara terus-menerus (rutin) meskipun sedikit. (HR. Muslim)",
    "Lakukanlah kebaikan sekecil apapun, karena kau tak pernah tahu kebaikan mana yang akan membawamu ke Surga. (Imam Hasan Al-Bashri)",
    "Waktu itu seperti pedang. Jika kau tidak memotongnya, ia yang akan memotongmu.",
    "Tidak ada kesuksesan tanpa kerja keras. Tidak ada keberhasilan tanpa doa. Hari ini adalah kesempatan emas Anda!",
    "Keberkahan suatu pekerjaan terletak pada keikhlasan hati saat melakukannya. Niatkan karena Allah, dan segalanya akan terasa ringan.",
    "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya. Semangat bertugas hari ini!",
    "Jangan pernah meremehkan amal yang kecil. Sebuah senyuman atau sapaan hangat bisa menjadi penyemangat luar biasa bagi rekan kerja Anda.",
    "Disiplin adalah jembatan antara cita-cita dan pencapaian. Jadikan rutinitas hari ini sebagai batu loncatan menuju kesuksesan.",
    "Syukuri apa yang Anda kerjakan hari ini, karena banyak orang di luar sana yang menginginkan posisi Anda saat ini.",
    "Bekerja keras adalah bagian dari ibadah. Tetesan keringat Anda hari ini akan menjadi saksi kebaikan di akhirat kelak.",
    "Sabar dalam menjalankan rutinitas memang berat, tapi buah kesabaran selalu manis pada akhirnya.",
    "Bukan tentang seberapa cepat Anda berlari, tapi tentang seberapa konsisten Anda melangkah. Konsistensi adalah kunci!",
    "Setiap kesulitan pasti ada kemudahan. Jika tugas hari ini terasa berat, percayalah bahwa Allah sedang menaikkan derajat Anda.",
    "Bekerjalah dengan cinta, seakan-akan Anda tidak membutuhkan uang. Maka Anda akan memberikan hasil yang maksimal.",
    "Mari hadirkan senyum terbaik hari ini. Aura positif yang Anda pancarkan akan menular ke seluruh keluarga besar MQBS!",
    "Fokuslah pada solusi, bukan pada masalah. Setiap tantangan di tempat kerja adalah ujian untuk naik level.",
    "Jangan biarkan rasa lelah mengalahkan semangat perjuangan. Ingatlah selalu tujuan mulia mengapa Anda berada di sini.",
    "Rahasia kemajuan adalah mulai bertindak. Selesaikan tugas Anda satu per satu dengan ketenangan dan fokus.",
    "Kualitas kerja Anda adalah cerminan dari karakter Anda. Berikan yang terbaik, bahkan ketika tidak ada yang melihat."
  ];

  const generateMotivation = () => {
    setIsGeneratingMotivation(true);
    setCurrentMotivation(null);
    
    // Fake AI Generation Delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * MOTIVATIONS.length);
      setCurrentMotivation(MOTIVATIONS[randomIndex]);
      setIsGeneratingMotivation(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 mb-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ringkasan Aktivitas</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Pantau statistik tugas dan pencapaian.</p>
        </div>
        {subordinates.length > 0 && (
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Saya Sendiri</option>
            {subordinates.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.namaLengkap || sub.email || 'Bawahan'}</option>
            ))}
          </select>
        )}
      </div>

      {/* Top Summary Cards */}
      {!loadingSummary && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Card 1: Tugas Pekan Ini */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
            <h4 className="text-slate-500 dark:text-slate-400 font-bold mb-4 text-sm flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">📊</span>
              Pekerjaan Pekan Ini
            </h4>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-black text-slate-800 dark:text-white">{summary.tasks.total} <span className="text-sm font-medium text-slate-500">tugas</span></div>
              <div className="text-emerald-600 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                {summary.tasks.total > 0 ? Math.round((summary.tasks.completed / summary.tasks.total) * 100) : 0}% Selesai
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${summary.tasks.total > 0 ? (summary.tasks.completed / summary.tasks.total) * 100 : 0}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-3 text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{summary.tasks.completed} Selesai</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>{summary.tasks.pending} Tertunda</span>
            </div>
            {summary.tasks.delegatedPending > 0 && (
              <div className="mt-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 flex items-center justify-between">
                <span>Dari Atasan (Tugas Khusus)</span>
                <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md">{summary.tasks.delegatedPending}</span>
              </div>
            )}
          </div>

          {/* Card 2: Saran Online */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
            <h4 className="text-slate-500 dark:text-slate-400 font-bold mb-4 text-sm flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">💡</span>
              Saran Terkirim
            </h4>
            <div className="text-3xl font-black text-slate-800 dark:text-white mb-4">{summary.saran.total} <span className="text-sm font-medium text-slate-500">saran</span></div>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-fuchsia-500 h-full transition-all duration-1000" style={{ width: `${summary.saran.total > 0 ? (summary.saran.belumDibaca / summary.saran.total) * 100 : 0}%` }} title="Belum Dibaca"></div>
                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${summary.saran.total > 0 ? ((summary.saran.total - summary.saran.belumDibaca - summary.saran.selesai) / summary.saran.total) * 100 : 0}%` }} title="Diproses"></div>
                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${summary.saran.total > 0 ? (summary.saran.selesai / summary.saran.total) * 100 : 0}%` }} title="Selesai"></div>
              </div>
            </div>
            <div className="flex justify-between text-[11px] mt-3 text-slate-500 font-medium px-1">
              <span className="flex items-center gap-1 truncate" title="Baru / Belum Dibaca"><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shrink-0"></span>{summary.saran.belumDibaca} Baru</span>
              <span className="flex items-center gap-1 truncate" title="Sedang Diproses"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>{summary.saran.total - summary.saran.belumDibaca - summary.saran.selesai} Proses</span>
              <span className="flex items-center gap-1 truncate" title="Selesai"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>{summary.saran.selesai} Selesai</span>
            </div>
          </div>

          {/* Card 3: Catatan */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 group-hover:scale-150 transition-all duration-700"></div>
            <div>
              <h4 className="text-slate-500 dark:text-slate-400 font-bold mb-4 text-sm relative z-10 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">📝</span>
                Catatan Pribadi
              </h4>
              <div className="text-3xl font-black text-slate-800 dark:text-white relative z-10">{summary.catatan.total} <span className="text-sm font-medium text-slate-500">dokumen</span></div>
            </div>
            <div className="mt-4 relative z-10">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Anda telah membuat total <strong className="text-slate-700 dark:text-slate-300">{summary.catatan.total} catatan</strong> untuk membantu mengingat tugas dan ide penting.
              </p>
            </div>
          </div>
        </div>
      )}

      {loadingSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800/50 h-40 rounded-2xl"></div>
          ))}
        </div>
      )}

      <div className="w-full">
        {/* Full Width AI Motivation Generator */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col min-h-[350px] overflow-hidden relative group">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-fuchsia-50 to-indigo-50 dark:from-fuchsia-950/20 dark:to-indigo-950/20 rounded-t-2xl z-10">
            <h3 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-indigo-600 dark:from-fuchsia-400 dark:to-indigo-400 flex items-center gap-2">
              <Sparkles size={20} className="text-fuchsia-500" />
              AI Motivasi Harian
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Dapatkan suntikan semangat segar untuk memulai aktivitas Anda hari ini.
            </p>
          </div>
          
          <div className="flex-1 p-8 flex flex-col items-center justify-center relative z-10">
            {isGeneratingMotivation ? (
              <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 relative flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-fuchsia-200 dark:border-fuchsia-900/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles size={24} className="text-fuchsia-500 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-fuchsia-600 dark:text-fuchsia-400 animate-pulse">
                  Meracik kalimat motivasi...
                </p>
              </div>
            ) : currentMotivation ? (
              <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-100 to-indigo-100 dark:from-fuchsia-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center text-2xl shadow-inner mb-2 transform transition-transform hover:scale-110 hover:rotate-12">
                  ✨
                </div>
                <blockquote className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 italic leading-relaxed relative">
                  <span className="absolute -top-4 -left-4 text-4xl text-fuchsia-200 dark:text-fuchsia-900/40 select-none">"</span>
                  {currentMotivation}
                  <span className="absolute -bottom-6 -right-4 text-4xl text-indigo-200 dark:text-indigo-900/40 select-none">"</span>
                </blockquote>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-4 opacity-70">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl shadow-sm mb-2">
                  🌱
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Klik tombol di bawah untuk mendapatkan kutipan motivasi acak hari ini!
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex justify-center">
            <button 
              onClick={generateMotivation}
              disabled={isGeneratingMotivation}
              className="w-full max-w-xs group relative py-3.5 px-6 font-bold text-white rounded-xl shadow-lg shadow-fuchsia-500/20 overflow-hidden transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-indigo-500 group-hover:from-fuchsia-600 group-hover:to-indigo-600 transition-colors"></div>
              <div className="relative flex items-center justify-center gap-2">
                <Sparkles size={18} className={isGeneratingMotivation ? "animate-spin" : ""} />
                {isGeneratingMotivation ? "Memproses..." : currentMotivation ? "Generate Ulang" : "Generate Motivasi"}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
