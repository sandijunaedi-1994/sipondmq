"use client";

import { useState, useEffect } from "react";

export default function AdminKalenderPage() {
  const [events, setEvents] = useState([]);
  const [markazList, setMarkazList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, tanggal: "", tanggalSelesai: "", judul: "", deskripsi: "", tipe: "KEGIATAN", isLibur: false, markazId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEvents();
    loadMarkaz();
  }, []);

  const loadMarkaz = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      const res = await fetch(`${baseUrl}/api/admin/markaz`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMarkazList(data.markaz || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/kalender` : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/kalender`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Gagal mengambil data kalender");
      }
      const data = await res.json();
      
      // Group contiguous events with same title
      const grouped = [];
      
      // Sort by markazId, then judul, then tanggal so we can group contiguous correctly
      data.sort((a,b) => {
        const mDiff = (a.markazId||0) - (b.markazId||0);
        if (mDiff !== 0) return mDiff;
        const jDiff = a.judul.localeCompare(b.judul);
        if (jDiff !== 0) return jDiff;
        return new Date(a.tanggal) - new Date(b.tanggal);
      });

      data.forEach(e => {
        const last = grouped[grouped.length - 1];
        if (last && last.judul === e.judul && last.tipe === e.tipe && last.markazId === e.markazId) {
          const lastDate = new Date(last.tanggalSelesai || last.tanggal);
          const currDate = new Date(e.tanggal);
          const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            last.tanggalSelesai = e.tanggal;
            last.ids.push(e.id);
            return;
          }
        }
        grouped.push({
          ...e,
          tanggalSelesai: null,
          ids: [e.id]
        });
      });
      
      // Sort the final grouped list chronologically for display
      grouped.sort((a,b) => new Date(a.tanggal) - new Date(b.tanggal));
      
      setEvents(grouped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (evt = null) => {
    if (evt) {
      setFormData({
        id: evt.id,
        ids: evt.ids,
        tanggal: evt.tanggal.split('T')[0],
        tanggalSelesai: evt.tanggalSelesai ? evt.tanggalSelesai.split('T')[0] : "",
        judul: evt.judul,
        deskripsi: evt.deskripsi || "",
        tipe: evt.tipe,
        isLibur: evt.isLibur,
        markazId: evt.markazId || ""
      });
    } else {
      setFormData({
        id: null,
        ids: [],
        tanggal: new Date().toISOString().split('T')[0],
        tanggalSelesai: "",
        judul: "",
        deskripsi: "",
        tipe: "KEGIATAN",
        isLibur: false,
        markazId: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      let url = `${baseUrl}/api/admin/kalender`;
      let method = "POST";
      
      if (formData.id) {
        url = `${baseUrl}/api/admin/kalender/batch`;
        method = "PUT";
      }
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Gagal menyimpan kegiatan");
      }
      
      await loadEvents();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ids) => {
    if (!confirm("Yakin ingin menghapus kegiatan ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      
      for (const id of ids) {
        const res = await fetch(`${baseUrl}/api/admin/kalender/${id}`, { 
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || "Gagal menghapus kegiatan");
        }
      }
      await loadEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const evtColor = {
    LIBUR: "bg-red-50 text-red-600 border-red-200",
    AKADEMIK: "bg-blue-50 text-blue-600 border-blue-200",
    KEGIATAN: "bg-emerald-50 text-emerald-600 border-emerald-200",
    KUNJUNGAN: "bg-orange-50 text-orange-600 border-orange-200",
    LAINNYA: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Kalender Kegiatan</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Kelola agenda kegiatan akademik, libur, dan kunjungan madrasah.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
        >
          <span>➕</span> Tambah Kegiatan
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium text-sm">{error}</div>}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold transition-colors">
                <th className="p-4 w-32">Tanggal</th>
                <th className="p-4">Kegiatan</th>
                <th className="p-4 w-32">MQBS</th>
                <th className="p-4 w-32">Tipe</th>
                <th className="p-4 w-24 text-center">Libur</th>
                <th className="p-4 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Belum ada agenda kalender.</td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50 dark:bg-slate-950/50 transition">
                    <td className="p-4 text-slate-700 dark:text-slate-200 font-semibold whitespace-nowrap transition-colors">
                      {new Date(evt.tanggal).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                      {evt.tanggalSelesai && (
                        <> - <br/>{new Date(evt.tanggalSelesai).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}</>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-slate-800 dark:text-slate-100 font-bold transition-colors">{evt.judul}</p>
                      {evt.deskripsi && <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2 transition-colors">{evt.deskripsi}</p>}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                      {evt.markaz ? evt.markaz.nama : "Semua MQBS"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded border ${evtColor[evt.tipe]}`}>
                        {evt.tipe}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {evt.isLibur ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs font-bold">L</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(evt)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(evt.ids)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 transition-colors">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">{formData.id ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 p-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 transition-colors">Mulai Tanggal</label>
                  <input required type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 transition-colors">Sampai Tanggal (Opsional)</label>
                  <input type="date" value={formData.tanggalSelesai} min={formData.tanggal} onChange={(e) => setFormData({...formData, tanggalSelesai: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 transition-colors">Judul Kegiatan</label>
                <input required type="text" value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" placeholder="Contoh: Ujian Akhir Semester" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 transition-colors">Deskripsi</label>
                <textarea rows={3} value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" placeholder="(Opsional) Detail kegiatan..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 transition-colors">MQBS (Pilih jika agenda khusus)</label>
                <select value={formData.markazId} onChange={(e) => setFormData({...formData, markazId: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition">
                  <option value="">Semua MQBS (Agenda Bersama)</option>
                  {markazList.map(m => (
                    <option key={m.id} value={m.id}>{m.nama}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 transition-colors">Tipe</label>
                  <select value={formData.tipe} onChange={(e) => setFormData({...formData, tipe: e.target.value})} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition">
                    <option value="AKADEMIK">AKADEMIK</option>
                    <option value="LIBUR">LIBUR</option>
                    <option value="KEGIATAN">KEGIATAN</option>
                    <option value="KUNJUNGAN">KUNJUNGAN</option>
                    <option value="LAINNYA">LAINNYA</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isLibur} onChange={(e) => setFormData({...formData, isLibur: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 transition-colors" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors">Tandai Hari Libur</span>
                  </label>
                </div>
              </div>
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 transition-colors">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-70 shadow-sm">
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
