"use client";

import { useEffect, useState } from "react";
import PermissionSelector from "./PermissionSelector";

export default function ManajemenGrup() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    permissions: []
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      } else {
        setError("Gagal mengambil data grup admin.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (group = null) => {
    if (group) {
      setEditingId(group.id);
      setFormData({
        nama: group.nama,
        deskripsi: group.deskripsi || "",
        permissions: group.permissions || []
      });
    } else {
      setEditingId(null);
      setFormData({ nama: "", deskripsi: "", permissions: [] });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (perm) => {
    setFormData(prev => {
      const perms = prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: perms };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("admin_token");
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/groups/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/groups`;
      
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan data");
      
      setSuccess(`Grup berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}.`);
      setIsModalOpen(false);
      fetchGroups();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus grup ini? User di dalam grup tidak akan terhapus, tetapi hak akses dari grup ini akan dicabut.")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/groups/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus grup");
      
      setSuccess("Grup berhasil dihapus.");
      fetchGroups();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Daftar Grup Admin</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Kelola peran dan grup yang dapat diberikan kepada banyak admin sekaligus.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Tambah Grup
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm border border-red-200">{error}</div>}
      {success && <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl font-medium text-sm border border-emerald-200 transition-colors">{success}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] transition-colors">
              <tr>
                <th className="px-6 py-4">Nama Grup</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4 text-center">Jml Anggota</th>
                <th className="px-6 py-4">Hak Akses (Permissions)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {groups.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-500 dark:text-slate-400 transition-colors">Belum ada grup yang dibuat</td></tr>
              ) : groups.map(group => (
                <tr key={group.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 transition-colors">{group.nama}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 transition-colors">{group.deskripsi || "-"}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 transition-colors">
                      {group._count?.users || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {group.permissions && group.permissions.length > 0 ? (
                        group.permissions.map(p => (
                          <span key={p} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold transition-colors">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tidak ada hak akses</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(group)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition" title="Edit Grup">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(group.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition" title="Hapus Grup">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Form ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">{editingId ? 'Edit Grup' : 'Tambah Grup Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Nama Grup</label>
                  <input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="bg-white dark:bg-slate-900 w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors text-slate-800 dark:text-slate-100" placeholder="Contoh: Tim Keuangan" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Deskripsi Singkat</label>
                  <input type="text" value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} className="bg-white dark:bg-slate-900 w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors text-slate-800 dark:text-slate-100" placeholder="Mengatur segala tagihan..." />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 transition-colors">Hak Akses (Permissions) Detail</label>
                <PermissionSelector 
                  selectedPermissions={formData.permissions} 
                  onChange={(newPerms) => setFormData({...formData, permissions: newPerms})} 
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 transition-colors">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-md shadow-emerald-500/20">Simpan Grup</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
