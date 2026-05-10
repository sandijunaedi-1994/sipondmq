"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManajemenAplikasi() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    url: "",
    ikon: "🚀",
    urutan: 0,
    isAktif: true
  });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`;
      const res = await fetch(`${baseUrl}/api/portal-apps?isAdmin=true`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setApps(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data aplikasi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (app = null) => {
    if (app) {
      setEditingApp(app);
      setFormData({
        nama: app.nama,
        deskripsi: app.deskripsi || "",
        url: app.url,
        ikon: app.ikon || "🚀",
        urutan: app.urutan,
        isAktif: app.isAktif
      });
    } else {
      setEditingApp(null);
      setFormData({
        nama: "",
        deskripsi: "",
        url: "",
        ikon: "🚀",
        urutan: apps.length,
        isAktif: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingApp(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`;
      const method = editingApp ? "PUT" : "POST";
      const url = editingApp 
        ? `${baseUrl}/api/portal-apps/${editingApp.id}` 
        : `${baseUrl}/api/portal-apps`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        fetchApps();
        handleCloseModal();
      } else {
        alert(data.message || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Terjadi kesalahan sistem");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus aplikasi ini?")) return;
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`;
      const res = await fetch(`${baseUrl}/api/portal-apps/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchApps();
      } else {
        alert(data.message || "Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Daftar Aplikasi Portal</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Kelola aplikasi yang muncul di Halaman Utama / App Launcher</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Tambah Aplikasi
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl transition-colors">
            <p className="text-slate-500 dark:text-slate-400 transition-colors">Belum ada aplikasi yang ditambahkan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                  <th className="py-3 px-4">Urutan</th>
                  <th className="py-3 px-4">Aplikasi</th>
                  <th className="py-3 px-4">URL Target</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium transition-colors">{app.urutan}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-xl transition-colors">
                          {app.ikon}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{app.nama}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px] transition-colors">{app.deskripsi}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 break-all transition-colors">{app.url}</code>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${app.isAktif ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {app.isAktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(app)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900/95 backdrop-blur z-10 transition-colors">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">
                {editingApp ? "Edit Aplikasi" : "Tambah Aplikasi"}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Nama Aplikasi</label>
                <input 
                  type="text" required
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  placeholder="Contoh: Mandor MQ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 transition-colors">URL Target</label>
                <input 
                  type="text" required
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  placeholder="https://const-mq.zamzami.or.id"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Gunakan URL lengkap (https://...) untuk eksternal, atau awalan / untuk internal (contoh: /admin/dashboard).</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Deskripsi Singkat</label>
                <textarea 
                  rows="2"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  placeholder="Deskripsi fungsi aplikasi..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Ikon (Emoji/Teks)</label>
                  <input 
                    type="text" 
                    value={formData.ikon}
                    onChange={(e) => setFormData({...formData, ikon: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-xl transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Urutan Tampil</label>
                  <input 
                    type="number" 
                    value={formData.urutan}
                    onChange={(e) => setFormData({...formData, urutan: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.isAktif}
                    onChange={(e) => setFormData({...formData, isAktif: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">Aplikasi Aktif (Ditampilkan)</span>
                </label>
              </div>

              <div className="pt-6 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800 mt-4 transition-colors">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
