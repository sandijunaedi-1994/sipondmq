"use client";

import { useState, useEffect } from "react";

export default function AdminBroadcastPage() {
  const [broadcastList, setBroadcastList] = useState([]);
  const [markazList, setMarkazList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, judul: "", pesan: "", tipe: "UMUM", target: "SEMUA", markazId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      
      const [resBcast, resMarkaz] = await Promise.all([
        fetch(`${baseUrl}/api/admin/informasi/broadcast`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/admin/markaz`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resBcast.ok) setBroadcastList((await resBcast.json()).data || []);
      if (resMarkaz.ok) setMarkazList((await resMarkaz.json()).markaz || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (bcast = null) => {
    if (bcast) {
      setFormData({
        id: bcast.id,
        judul: bcast.judul,
        pesan: bcast.pesan || "",
        tipe: bcast.tipe,
        target: bcast.target,
        markazId: bcast.markazId || ""
      });
    } else {
      setFormData({ id: null, judul: "", pesan: "", tipe: "UMUM", target: "SEMUA", markazId: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id ? `${baseUrl}/api/admin/informasi/broadcast/${formData.id}` : `${baseUrl}/api/admin/informasi/broadcast`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Gagal menyimpan broadcast");
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus broadcast ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      const res = await fetch(`${baseUrl}/api/admin/informasi/broadcast/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Manajemen Broadcast</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Buat pengumuman penting untuk orang tua santri</p>
        </div>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition shadow-sm shadow-emerald-500/20 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Buat Broadcast Baru
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 transition-colors">
            <tr>
              <th className="px-6 py-4">Isi Pengumuman</th>
              <th className="px-6 py-4">Tipe & Target</th>
              <th className="px-6 py-4">Target Markaz</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {broadcastList.map(b => (
              <tr key={b.id} className="hover:bg-slate-50 dark:bg-slate-950 transition group">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{b.judul}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 transition-colors">{b.pesan}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(b.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5 items-start">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${b.tipe === 'PENTING' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                      {b.tipe === 'PENTING' ? '🚨 PENTING' : 'ℹ️ UMUM'}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold border border-slate-200 dark:border-slate-800 transition-colors">
                      TARGET: {b.target.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors">
                  {b.markaz ? (
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{b.markaz.nama}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>Semua Markaz (Global)</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleOpenModal(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {broadcastList.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 transition-colors">Belum ada pengumuman broadcast</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Broadcast */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 transition-colors">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">{formData.id ? "Edit Broadcast" : "Buat Broadcast Baru"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase transition-colors">Judul Pengumuman *</label>
                <input type="text" required value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} placeholder="Cth: Pemberitahuan Libur Idul Fitri" className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition shadow-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase transition-colors">Tipe Pengumuman</label>
                  <select value={formData.tipe} onChange={e=>setFormData({...formData, tipe: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition shadow-sm">
                    <option value="UMUM">Umum / Biasa</option>
                    <option value="PENTING">Penting (Alert Merah)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase transition-colors">Target Audiens</label>
                  <select value={formData.target} onChange={e=>setFormData({...formData, target: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition shadow-sm">
                    <option value="SEMUA">Semua Orang Tua</option>
                    <option value="PPDB">Hanya Pendaftar PPDB</option>
                    <option value="SANTRI_AKTIF">Hanya Wali Santri Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase transition-colors">Target Markaz</label>
                <select value={formData.markazId} onChange={e=>setFormData({...formData, markazId: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition shadow-sm">
                  <option value="">Semua Markaz (Global)</option>
                  {markazList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase transition-colors">Isi Pesan / Pengumuman *</label>
                <textarea required rows="4" value={formData.pesan} onChange={e=>setFormData({...formData, pesan: e.target.value})} placeholder="Tuliskan isi pengumuman secara detail..." className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition shadow-sm resize-none" />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-800 mt-2 transition-colors">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition disabled:opacity-50 shadow-sm shadow-emerald-500/20">
                  {isSubmitting ? "Menyimpan..." : "Simpan & Publikasikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
