"use client";

import { useEffect, useState, useRef } from "react";
import { Clock, CheckCircle2, Circle, Plus, Sparkles, Trash2 } from "lucide-react";
import AddActivityModal from "./AddActivityModal";

export default function RingkasanPribadi() {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);

  const [currentUserId, setCurrentUserId] = useState("");

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

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/dashboard/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTasks(false);
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

  const toggleTaskStatus = async (taskId, currentStatus, isUserTask) => {
    // Optimistic UI
    const newStatus = isUserTask 
      ? (currentStatus === "SELESAI" ? "PENDING" : "SELESAI")
      : (currentStatus === "COMPLETED" || currentStatus === "SELESAI" ? "PENDING" : "COMPLETED");
      
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const token = localStorage.getItem("admin_token");
      let url = `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/schedules/${taskId}/status`;
      
      if (isUserTask) {
        url = `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/initiative/${taskId}/status`;
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }
    } catch (error) {
      // Revert on error
      console.error(error);
      alert("Gagal mengupdate status: " + error.message);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: currentStatus } : t));
    }
  };

  const deleteTask = async (taskId, isUserTask, e) => {
    e.stopPropagation(); // Prevent toggling the task
    
    if (!confirm("Apakah Anda yakin ingin menghapus aktivitas ini?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/routines/schedules/${taskId}`;
      
      if (isUserTask) {
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/routines/initiative/${taskId}`;
      }

      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete task");
      }

      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus tugas: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Daftar Tugas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[400px] md:h-[500px]">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-t-2xl flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock className="text-emerald-500" size={20} />
                Daftar Tugas Anda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tugas yang tertunda dan harus diselesaikan hari ini.
              </p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-800/60 rounded-lg transition-colors flex shrink-0"
              title="Tambah Aktivitas"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-3">
            {loadingTasks ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>)}
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-4xl mb-3">🎉</span>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Luar biasa! Tidak ada tugas yang tertunda.</p>
              </div>
            ) : (
              tasks.map(task => {
                const isDone = task.status === 'SELESAI' || task.status === 'COMPLETED';
                // Gunakan date lokal (timezone WIB) untuk menghindari bug UTC shift
                const getLocalDateString = (d) => {
                  const date = new Date(d);
                  // Ambil tanggal berdasarkan local time (bukan UTC) supaya tidak geser 1 hari
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  return `${y}-${m}-${day}`;
                };
                const todayStr = getLocalDateString(new Date());
                const taskDateStr = getLocalDateString(task.taskDate);
                const isOverdue = taskDateStr < todayStr;
                
                return (
                  <div 
                    key={task.id} 
                    onClick={() => {
                      if (isOverdue) {
                        alert("Aktivitas yang sudah lewat tanggalnya tidak dapat diubah.");
                        return;
                      }
                      toggleTaskStatus(task.id, task.status, task.isUserTask);
                    }}
                    className={`p-4 rounded-xl border transition-all flex items-start gap-3 group ${
                      isOverdue ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                    } ${
                      isDone 
                        ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 opacity-60' 
                        : isOverdue
                          ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                          : 'bg-white border-emerald-100 hover:border-emerald-300 dark:bg-slate-900 dark:border-emerald-900'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Circle size={18} className={`transition-colors ${isOverdue ? 'text-red-400' : 'text-slate-300 group-hover:text-emerald-400'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-bold transition-colors ${isDone ? 'text-slate-500 line-through' : isOverdue ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {task.McRoutineTask?.aktivitas || task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isDone 
                            ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700' 
                            : isOverdue
                              ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-800/30 dark:text-red-400 dark:border-red-700'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        }`}>
                          {task.isUserTask ? 'Tugas / Inisiatif' : 'Rutinitas'}
                        </span>
                        {isOverdue && !isDone && (
                          <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                            Terlewat! ({new Date(task.taskDate).toLocaleDateString('id-ID')})
                          </span>
                        )}
                      </div>
                    </div>
                    {!isOverdue && (
                      <button 
                        onClick={(e) => deleteTask(task.id, task.isUserTask, e)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Hapus Tugas"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: AI Motivation Generator */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[400px] md:h-[500px] overflow-hidden relative group">
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
      
      {showAddModal && (
        <AddActivityModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTasks(); // Refresh list after adding
          }}
        />
      )}
    </div>
  );
}
