"use client";

import { useEffect, useState } from "react";

export default function SettingJadwalOnlinePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Format date for input type="date"
  const getTodayString = () => new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    date: getTodayString(),
    timeStart: "08:00",
    timeEnd: "12:00",
    quota: 10,
    isActive: true
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/online-schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSchedules(data.schedules || []);
      } else {
        setError(data.message || "Gagal mengambil data jadwal.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (s = null) => {
    if (s) {
      setEditingId(s.id);
      setFormData({
        date: new Date(s.date).toISOString().split('T')[0],
        timeStart: s.timeStart,
        timeEnd: s.timeEnd,
        quota: s.quota,
        isActive: s.isActive
      });
    } else {
      setEditingId(null);
      setFormData({ date: getTodayString(), timeStart: "08:00", timeEnd: "12:00", quota: 10, isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.timeStart >= formData.timeEnd) {
      setError("Waktu selesai harus lebih besar dari waktu mulai.");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/online-schedule/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/online-schedule`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan jadwal");
      
      setSuccess(`Jadwal berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}.`);
      setIsModalOpen(false);
      fetchSchedules();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus jadwal online ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/online-schedule/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal menghapus jadwal");
      setSuccess("Jadwal berhasil dihapus.");
      fetchSchedules();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatus = (s) => {
    const scheduleDate = new Date(s.date);
    const todayDate = new Date();
    // Normalize to midnight for fair comparison
    scheduleDate.setHours(0,0,0,0);
    todayDate.setHours(0,0,0,0);

    if (scheduleDate < todayDate) {
      return { label: 'Selesai', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
    if (!s.isActive) {
      return { label: 'Non-aktif', color: 'bg-red-50 text-red-600 border-red-200' };
    }
    // TODO: if participants >= quota, return { label: 'Penuh', color: 'bg-orange-50 text-orange-600 border-orange-200' }
    return { label: 'Aktif', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
  };

  if (loading) return <div className="animate-pulse h-64 bg-slate-200 rounded-2xl w-full"></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Setting Jadwal Online</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Atur ketersediaan slot tanggal dan waktu untuk pendaftar yang memilih tes secara online (CBT & Zoom).</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Tambah Jadwal
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm border border-red-200">{error}</div>}
      {success && <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl font-medium text-sm border border-emerald-200 transition-colors">{success}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] transition-colors">
              <tr>
                <th className="px-6 py-4">Tanggal Pelaksanaan</th>
                <th className="px-6 py-4 text-center">Waktu</th>
                <th className="px-6 py-4 text-center">Kuota Maksimal</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-500 dark:text-slate-400 transition-colors">Belum ada jadwal online</td></tr>
              ) : schedules.map(s => {
                const status = getStatus(s);
                return (
                <tr key={s.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 transition-colors">
                    {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-300 transition-colors">
                    {s.timeStart} - {s.timeEnd}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-200 transition-colors">
                    {s.quota} <span className="text-xs font-normal text-slate-400">orang</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-lg border ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(s)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Form ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">{editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Tanggal Pelaksanaan</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors" />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Waktu Mulai</label>
                  <input type="time" required value={formData.timeStart} onChange={e => setFormData({...formData, timeStart: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Waktu Selesai</label>
                  <input type="time" required value={formData.timeEnd} onChange={e => setFormData({...formData, timeEnd: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Kuota Peserta</label>
                  <input type="number" min="1" required value={formData.quota} onChange={e => setFormData({...formData, quota: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors" placeholder="Contoh: 10" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Status Jadwal</label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-emerald-500 rounded" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors">Terbuka (Aktif)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 transition-colors">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-md shadow-emerald-500/20">Simpan Jadwal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
