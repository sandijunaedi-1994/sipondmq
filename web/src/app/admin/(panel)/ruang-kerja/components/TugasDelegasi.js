"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Briefcase, Inbox, Send, Plus, CheckCircle2, Circle, Clock, Tag, User, Trash2 } from "lucide-react";

export default function TugasDelegasi() {
  const [activeView, setActiveView] = useState("inbox"); // inbox, outbox
  const [tugasMasuk, setTugasMasuk] = useState([]);
  const [tugasKeluar, setTugasKeluar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAtasan, setIsAtasan] = useState(false);
  const [subordinates, setSubordinates] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    assigneeId: ""
  });

  useEffect(() => {
    checkHierarchy();
    fetchTugas();
  }, []);

  const checkHierarchy = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/hierarchy/subordinates`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubordinates(data);
        if (data.length > 0) setIsAtasan(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTugas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const [resInbox, resOutbox] = await Promise.all([
        fetch(`${url}/api/admin/tugas/inbox`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${url}/api/admin/tugas/outbox`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (resInbox.ok) setTugasMasuk(await resInbox.json());
      if (resOutbox.ok) setTugasKeluar(await resOutbox.json());
    } catch (e) {
      toast.error("Gagal mengambil data tugas");
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/tugas/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success("Status tugas diperbarui");
        fetchTugas();
      } else {
        toast.error("Gagal update status");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus tugas ini?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/tugas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (res.ok) {
        toast.success("Tugas dihapus");
        fetchTugas();
      }
    } catch (e) {
      toast.error("Gagal menghapus");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/tugas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Tugas berhasil diberikan");
        setShowModal(false);
        setFormData({ title: "", description: "", dueDate: "", priority: "MEDIUM", assigneeId: "" });
        fetchTugas();
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal membuat tugas");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan");
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'URGENT': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200';
      case 'LOW': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'SELESAI': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'REVIEW': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ON_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data tugas...</div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 shadow-sm min-h-[400px]">
      
      {/* Header & View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Briefcase className="text-indigo-500" /> Tugas & Delegasi
          </h2>
          <p className="text-sm text-slate-500 mt-1">Kelola tugas masuk dan delegasikan pekerjaan ke tim Anda.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveView("inbox")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeView === "inbox" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Inbox size={16} /> Kotak Masuk
              {tugasMasuk.filter(t => t.status !== 'SELESAI').length > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{tugasMasuk.filter(t => t.status !== 'SELESAI').length}</span>
              )}
            </button>
            
            {isAtasan && (
              <button
                onClick={() => setActiveView("outbox")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeView === "outbox" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Send size={16} /> Ditugaskan
              </button>
            )}
          </div>
          
          {isAtasan && activeView === "outbox" && (
            <button onClick={() => setShowModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
              <Plus size={16} /> Buat Tugas Baru
            </button>
          )}
        </div>
      </div>

      {/* TUGAS MASUK (INBOX) */}
      {activeView === "inbox" && (
        <div className="space-y-4">
          {tugasMasuk.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Tidak ada tugas yang perlu dikerjakan saat ini. ✨</div>
          ) : (
            tugasMasuk.map(task => (
              <div key={task.id} className={`p-4 md:p-5 rounded-2xl border ${task.status === 'SELESAI' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'} shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center transition-all hover:shadow-md`}>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 bg-slate-100 text-slate-600 uppercase tracking-wider">
                      {task.sourceType === 'MANUAL_DELEGATION' ? 'DARI ATASAN' : task.sourceType.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className={`font-bold text-lg ${task.status === 'SELESAI' ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.title}</h3>
                  {task.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <User size={14} /> Dari: {task.assigner?.namaLengkap || 'Sistem'}
                    </div>
                    {task.dueDate && (
                      <div className={`flex items-center gap-1.5 ${new Date(task.dueDate) < new Date() && task.status !== 'SELESAI' ? 'text-red-500' : ''}`}>
                        <Clock size={14} /> Tenggat: {new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {task.status === 'PENDING' && (
                    <button onClick={() => updateStatus(task.id, 'ON_PROGRESS')} className="flex-1 md:flex-none text-center px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-sm font-bold transition-colors border border-amber-200">
                      Mulai Kerjakan
                    </button>
                  )}
                  {task.status === 'ON_PROGRESS' && (
                    <button onClick={() => updateStatus(task.id, 'REVIEW')} className="flex-1 md:flex-none text-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-colors border border-indigo-200 flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Minta Review Atasan
                    </button>
                  )}
                  {task.status === 'REVIEW' && (
                    <div className="text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 flex items-center gap-2 w-full md:w-auto justify-center">
                      <Clock size={16} /> Menunggu Review
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TUGAS KELUAR (OUTBOX) */}
      {isAtasan && activeView === "outbox" && (
        <div className="space-y-4">
          {tugasKeluar.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Anda belum mendelegasikan tugas apapun.</div>
          ) : (
            tugasKeluar.map(task => (
              <div key={task.id} className="p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{task.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                      <User size={14} /> Kpd: {task.assignee?.namaLengkap}
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} /> Tenggat: {new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto items-center">
                  {task.status === 'REVIEW' && (
                    <button onClick={() => updateStatus(task.id, 'SELESAI')} className="flex-1 md:flex-none text-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Approve (Selesai)
                    </button>
                  )}
                  {task.status === 'REVIEW' && (
                    <button onClick={() => updateStatus(task.id, 'ON_PROGRESS')} className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-sm font-bold transition-colors border border-rose-200">
                      Tolak
                    </button>
                  )}
                  {task.status === 'PENDING' && (
                    <button onClick={() => handleDelete(task.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Buat Tugas */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Delegasikan Tugas Baru</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tugaskan Kepada <span className="text-red-500">*</span></label>
                <select required value={formData.assigneeId} onChange={e => setFormData({...formData, assigneeId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Pilih Bawahan --</option>
                  {subordinates.map(sub => (
                    <option key={sub.subordinate.id} value={sub.subordinate.id}>
                      {sub.subordinate.namaLengkap || sub.subordinate.email} ({sub.subordinate.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Tugas <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Misal: Siapkan Laporan Evaluasi Bulanan" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi & Instruksi</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Berikan detail instruksi atau lampiran yang dibutuhkan..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tenggat Waktu</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500">
                    <option value="LOW">Rendah (Low)</option>
                    <option value="MEDIUM">Sedang (Medium)</option>
                    <option value="HIGH">Tinggi (High)</option>
                    <option value="URGENT">Mendesak (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2">
                  <Send size={16} /> Kirim Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
