"use client";

import { useEffect, useState } from "react";
import PermissionSelector from "./PermissionSelector";

export default function ManajemenUser() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [portalApps, setPortalApps] = useState([]);
  const [markazList, setMarkazList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    namaLengkap: "",
    password: "",
    permissions: [],
    portalAppsAccess: [],
    markazAccess: [],
    groupIds: []
  });

  useEffect(() => {
    fetchAdmins();
    fetchPortalApps();
    fetchMarkazList();
    fetchGroupList();
  }, []);

  const fetchPortalApps = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/portal-apps?isAdmin=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPortalApps(data.data || []);
      }
    } catch (err) { console.error(err); }
  };

  const fetchMarkazList = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/markaz`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMarkazList(data.markaz || []);
      }
    } catch (err) { console.error(err); }
  };

  const fetchGroupList = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroupList(data.groups || []);
      }
    } catch (err) { console.error(err); }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      } else {
        setError("Gagal mengambil data admin.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setEditingId(admin.id);
      setFormData({
        email: admin.email,
        namaLengkap: admin.namaLengkap || "",
        password: "", // Leave blank for edit unless they want to change it
        permissions: admin.permissions || [],
        portalAppsAccess: admin.portalAppsAccess || [],
        markazAccess: admin.markazAccess || [],
        groupIds: admin.adminGroups ? admin.adminGroups.map(g => g.id) : []
      });
    } else {
      setEditingId(null);
      setFormData({ email: "", namaLengkap: "", password: "", permissions: [], portalAppsAccess: [], markazAccess: [], groupIds: [] });
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

  const handleToggleGroup = (groupId) => {
    setFormData(prev => {
      const groups = prev.groupIds.includes(groupId)
        ? prev.groupIds.filter(id => id !== groupId)
        : [...prev.groupIds, groupId];
      return { ...prev, groupIds: groups };
    });
  };

  const handleToggleApp = (appId) => {
    setFormData(prev => {
      const apps = prev.portalAppsAccess.includes(appId)
        ? prev.portalAppsAccess.filter(id => id !== appId)
        : [...prev.portalAppsAccess, appId];
      return { ...prev, portalAppsAccess: apps };
    });
  };

  const handleToggleMarkaz = (markazId) => {
    setFormData(prev => {
      const markaz = prev.markazAccess.includes(markazId)
        ? prev.markazAccess.filter(id => id !== markazId)
        : [...prev.markazAccess, markazId];
      return { ...prev, markazAccess: markaz };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("admin_token");
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/users/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/users`;
      
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan data");
      
      setSuccess(`Admin berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}.`);
      setIsModalOpen(false);
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus admin ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus admin");
      
      setSuccess("Admin berhasil dihapus.");
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendResetLink = async (id, namaLengkap) => {
    if (!confirm(`Kirim link reset password ke email ${namaLengkap || 'Admin ini'}?`)) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/users/${id}/send-reset-link`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim link reset password");
      
      setSuccess("Link reset password berhasil dikirim ke email admin.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Daftar Admin Pusat</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Kelola akun dan atur hak akses (permissions) untuk setiap admin.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Tambah Admin
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm border border-red-200">{error}</div>}
      {success && <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl font-medium text-sm border border-emerald-200 transition-colors">{success}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] transition-colors">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Grup & Hak Akses</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {admins.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-slate-500 dark:text-slate-400 transition-colors">Tidak ada admin lain</td></tr>
              ) : admins.map(admin => (
                <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 transition-colors">{admin.namaLengkap || "-"}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 transition-colors">{admin.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {admin.adminGroups && admin.adminGroups.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {admin.adminGroups.map(g => (
                            <span key={g.id} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded text-[10px] font-bold transition-colors">
                              🏢 {g.nama}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions && admin.permissions.length > 0 ? (
                          admin.permissions.map(p => (
                            <span key={p} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold transition-colors">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Tidak ada akses spesifik (hanya dari grup)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(admin)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition" title="Edit Admin">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(admin.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition" title="Hapus Admin">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                      <button onClick={() => handleSendResetLink(admin.id, admin.namaLengkap)} className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition" title="Kirim Link Reset Password">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
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
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">{editingId ? 'Edit Admin' : 'Tambah Admin Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Nama Lengkap</label>
                  <input type="text" required value={formData.namaLengkap} onChange={e => setFormData({...formData, namaLengkap: e.target.value})} className="bg-white dark:bg-slate-900 w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors text-slate-800 dark:text-slate-100" placeholder="Contoh: Budi Santoso" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white dark:bg-slate-900 w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors text-slate-800 dark:text-slate-100" placeholder="admin@domain.com" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">
                  Password {editingId && <span className="text-slate-400 font-normal lowercase">(Kosongkan jika tidak ingin mengubah)</span>}
                </label>
                <input type="password" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-white dark:bg-slate-900 w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors text-slate-800 dark:text-slate-100" placeholder="••••••••" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 transition-colors">Grup Akses (Role)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupList.map(group => (
                    <label key={group.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.groupIds.includes(group.id) ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.groupIds.includes(group.id)}
                        onChange={() => handleToggleGroup(group.id)} 
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${formData.groupIds.includes(group.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-700'} transition-colors`}>
                        {formData.groupIds.includes(group.id) && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight transition-colors">{group.nama}</p>
                        {group.deskripsi && <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{group.deskripsi}</p>}
                      </div>
                    </label>
                  ))}
                  {groupList.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 italic transition-colors">Belum ada grup yang dibuat.</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 transition-colors">Hak Akses Spesifik (Permissions Tambahan)</label>
                <PermissionSelector 
                  selectedPermissions={formData.permissions} 
                  onChange={(newPerms) => setFormData({...formData, permissions: newPerms})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 transition-colors">Akses Aplikasi Portal</label>
                <div className="grid grid-cols-2 gap-3">
                  {portalApps.map(app => (
                    <label key={app.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.portalAppsAccess.includes(app.id) ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.portalAppsAccess.includes(app.id)}
                        onChange={() => handleToggleApp(app.id)} 
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${formData.portalAppsAccess.includes(app.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'} transition-colors`}>
                        {formData.portalAppsAccess.includes(app.id) && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight transition-colors">{app.nama}</span>
                    </label>
                  ))}
                  {portalApps.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 italic transition-colors">Belum ada aplikasi portal.</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 transition-colors">Akses Markaz (Cabang)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {markazList.map(markaz => (
                    <label key={markaz.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.markazAccess.includes(markaz.id) ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.markazAccess.includes(markaz.id)}
                        onChange={() => handleToggleMarkaz(markaz.id)} 
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${formData.markazAccess.includes(markaz.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'} transition-colors`}>
                        {formData.markazAccess.includes(markaz.id) && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight transition-colors">{markaz.nama}</span>
                    </label>
                  ))}
                  {markazList.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 italic transition-colors">Belum ada data Markaz.</p>}
                </div>
                <p className="text-xs text-slate-400 mt-2 italic">Kosongkan jika admin dapat mengakses data semua Markaz.</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 transition-colors">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-md shadow-emerald-500/20">Simpan Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
