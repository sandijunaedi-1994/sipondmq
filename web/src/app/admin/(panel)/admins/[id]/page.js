"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PERMISSIONS_SCHEMA } from "../components/PermissionSelector";

export default function AdminDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminDetail();
  }, [id]);

  const fetchAdminDetail = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengambil data admin");
      
      setAdmin(data.admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to find permission label from schema
  const getPermissionLabel = (permId) => {
    for (const category of PERMISSIONS_SCHEMA) {
      for (const menu of category.menus) {
        const action = menu.actions.find(a => a.id === permId);
        if (action) return { category: category.kategori, label: action.label, icon: category.icon };
      }
    }
    return { category: "Lainnya", label: permId, icon: "🛡️" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[30vh]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <p className="text-red-600 dark:text-red-400 font-bold">{error || "Admin tidak ditemukan"}</p>
        <button onClick={() => router.push('/admin/admins')} className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-semibold shadow-sm transition hover:bg-slate-50 border border-slate-200 dark:border-slate-700">Kembali ke Daftar</button>
      </div>
    );
  }

  // Combine direct permissions with group permissions
  const directPermissions = admin.permissions || [];
  let groupPermissions = [];
  if (admin.adminGroups) {
    admin.adminGroups.forEach(group => {
      if (group.permissions) groupPermissions = [...groupPermissions, ...group.permissions];
    });
  }
  const allUniquePermissions = [...new Set([...directPermissions, ...groupPermissions])];

  // Group permissions for visual rendering
  const renderPermissionsByCategory = () => {
    if (allUniquePermissions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <span className="text-4xl mb-2">🔒</span>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pengguna ini belum memiliki hak akses apapun.</p>
        </div>
      );
    }

    // Grouping
    const grouped = {};
    allUniquePermissions.forEach(permId => {
      const info = getPermissionLabel(permId);
      if (!grouped[info.category]) {
        grouped[info.category] = { icon: info.icon, items: [] };
      }
      // Identify if it's direct or from group
      const isDirect = directPermissions.includes(permId);
      const isFromGroup = groupPermissions.includes(permId);
      
      grouped[info.category].items.push({
        id: permId,
        label: info.label,
        source: isDirect && isFromGroup ? "Keduanya" : isDirect ? "Individu" : "Grup"
      });
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(grouped).map(([category, data]) => (
          <div key={category} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xl">{data.icon}</span>
              {category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.items.map(item => (
                <div key={item.id} className="group relative inline-block">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex flex-col items-center text-center
                    ${item.source === "Grup" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20" : 
                      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"}`}>
                    <span className="truncate max-w-[150px]">{item.label}</span>
                  </span>
                  
                  {/* Tooltip for source */}
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[9px] rounded whitespace-nowrap pointer-events-none z-10">
                    Akses dari: {item.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <button onClick={() => router.push('/admin/admins')} className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">Detail Profil Admin</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">Lihat detail biodata dan peta hak akses user ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Biodata Singkat */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 overflow-hidden relative transition-colors">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 dark:opacity-10"></div>
            
            <div className="relative flex flex-col items-center mt-6">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 rounded-full flex items-center justify-center shadow-lg mb-4 text-emerald-500 text-3xl font-black uppercase">
                {admin.namaLengkap ? admin.namaLengkap.substring(0, 2) : "AD"}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{admin.namaLengkap || "Administrator"}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">{admin.email}</p>
              
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-500/20">AKTIF</span>
            </div>

            <div className="mt-8 space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Nomor Telepon</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{admin.phone || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Terdaftar Sejak</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{new Date(admin.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Grup Afiliasi</p>
                {admin.adminGroups && admin.adminGroups.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {admin.adminGroups.map(g => (
                      <span key={g.id} className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">🏢 {g.nama}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-500 italic">-</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Peta Hak Akses */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Peta Hak Akses Sistem
            </h3>
            
            {allUniquePermissions.includes("MANAJEMEN_ADMIN") ? (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-black mb-1">Akses Superadmin (Penuh)</h4>
                    <p className="text-emerald-50 text-sm">Pengguna ini memiliki hak prerogatif penuh atas sistem (Super Administrator Bypass). Semua modul dapat diakses dan diubah tanpa batas.</p>
                  </div>
                </div>
              </div>
            ) : (
              renderPermissionsByCategory()
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
