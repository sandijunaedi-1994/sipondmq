"use client";

import { useState, useEffect } from "react";

export default function AdminDokumenPage() {
  const [dokumenList, setDokumenList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [markazList, setMarkazList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ id: null, judul: "", deskripsi: "", fileUrl: "", tipeFile: "PDF", kategoriId: "", markazId: "", isPublik: true });
  const [kategoriData, setKategoriData] = useState({ kode: "", nama: "", ikon: "📄" });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      
      const [resDok, resKat, resMarkaz] = await Promise.all([
        fetch(`${baseUrl}/api/admin/informasi/dokumen`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/admin/informasi/kategori`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/admin/markaz`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resDok.ok) setDokumenList((await resDok.json()).data || []);
      if (resKat.ok) setKategoriList((await resKat.json()).data || []);
      if (resMarkaz.ok) setMarkazList((await resMarkaz.json()).markaz || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (doc = null) => {
    if (doc) {
      setFormData({
        id: doc.id,
        judul: doc.judul,
        deskripsi: doc.deskripsi || "",
        fileUrl: doc.fileUrl,
        tipeFile: doc.tipeFile,
        kategoriId: doc.kategoriId,
        markazId: doc.markazId || "",
        isPublik: doc.isPublik
      });
    } else {
      setFormData({ id: null, judul: "", deskripsi: "", fileUrl: "", tipeFile: "PDF", kategoriId: kategoriList[0]?.id || "", markazId: "", isPublik: true });
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
      const url = formData.id ? `${baseUrl}/api/admin/informasi/dokumen/${formData.id}` : `${baseUrl}/api/admin/informasi/dokumen`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Gagal menyimpan dokumen");
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      const res = await fetch(`${baseUrl}/api/admin/informasi/dokumen/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleKategoriSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      const res = await fetch(`${baseUrl}/api/admin/informasi/kategori`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(kategoriData)
      });
      if (!res.ok) throw new Error("Gagal menambah kategori");
      setIsKategoriModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Manajemen Dokumen</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Kelola dokumen informasi untuk wali santri</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsKategoriModalOpen(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition">
            + Kategori Baru
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition shadow-sm shadow-emerald-500/20">
            + Tambah Dokumen
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 transition-colors">
            <tr>
              <th className="px-6 py-4">Judul Dokumen</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Tipe & Status</th>
              <th className="px-6 py-4">Target Markaz</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dokumenList.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50 dark:bg-slate-950 transition">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{doc.judul}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs transition-colors">{doc.deskripsi}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
                    {doc.kategori?.nama}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold transition-colors">{doc.tipeFile}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${doc.isPublik ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'} transition-colors`}>
                      {doc.isPublik ? 'PUBLIK' : 'DRAFT'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors">
                  {doc.markaz ? doc.markaz.nama : <span className="text-slate-400">Semua Markaz</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(doc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">Edit</button>
                    <button onClick={() => handleDelete(doc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {dokumenList.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 transition-colors">Belum ada dokumen</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dokumen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 transition-colors">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">{formData.id ? "Edit Dokumen" : "Tambah Dokumen"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase transition-colors">Judul Dokumen *</label>
                <input type="text" required value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase transition-colors">Kategori *</label>
                <select required value={formData.kategoriId} onChange={e=>setFormData({...formData, kategoriId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition">
                  <option value="">Pilih Kategori</option>
                  {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase transition-colors">Target Markaz</label>
                <select value={formData.markazId} onChange={e=>setFormData({...formData, markazId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition">
                  <option value="">Semua Markaz (Global)</option>
                  {markazList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase transition-colors">URL File (PDF/Link) *</label>
                <input type="url" required value={formData.fileUrl} onChange={e=>setFormData({...formData, fileUrl: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase transition-colors">Deskripsi (Opsional)</label>
                <textarea rows="2" value={formData.deskripsi} onChange={e=>setFormData({...formData, deskripsi: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPublik" checked={formData.isPublik} onChange={e=>setFormData({...formData, isPublik: e.target.checked})} className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 border-slate-300 dark:border-slate-700 transition-colors" />
                <label htmlFor="isPublik" className="text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">Tampilkan ke Publik</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition disabled:opacity-50">
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kategori */}
      {isKategoriModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transition-colors">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 transition-colors"><h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Kategori Baru</h2></div>
            <form onSubmit={handleKategoriSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 transition-colors">Kode (Unik)</label>
                <input type="text" required placeholder="MISAL: TATA_TERTIB" value={kategoriData.kode} onChange={e=>setKategoriData({...kategoriData, kode: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm uppercase transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 transition-colors">Nama Kategori</label>
                <input type="text" required value={kategoriData.nama} onChange={e=>setKategoriData({...kategoriData, nama: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm transition-colors" />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsKategoriModalOpen(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
