"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPortalPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin");
      return;
    }

    setAdminName(localStorage.getItem("admin_name") || "Admin");
    try {
      const perms = JSON.parse(localStorage.getItem("admin_permissions") || "[]");
      setPermissions(perms);
    } catch(e) {}

    fetchApps(token);
  }, [router]);

  const fetchApps = async (token) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      const res = await fetch(`${baseUrl}/api/portal-apps`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setApps(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch apps", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_permissions");
    router.replace("/admin");
  };

  const handleAppClick = (app) => {
    const token = localStorage.getItem("admin_token");
    if (app.url.startsWith("http")) {
      // External URL - SSO
      const separator = app.url.includes("?") ? "&" : "?";
      window.open(`${app.url}${separator}sso_token=${token}`, "_blank");
    } else {
      // Internal URL
      router.push(app.url);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative flex items-center justify-center">
              <img src="/logo.png" alt="Logo MQ" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-slate-100 leading-tight transition-colors">Portal Aplikasi</h1>
              <p className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase">My Madinatul Qur'an</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight transition-colors">{adminName}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase">Admin Pusat</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 transition-colors">Selamat Datang, {adminName}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
            Pilih aplikasi atau modul yang ingin Anda akses. Semua aplikasi terhubung dengan satu sistem otentikasi.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">Belum Ada Aplikasi</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 transition-colors">Tambahkan aplikasi melalui menu Manajemen Aplikasi.</p>
            {permissions.includes("MANAJEMEN_ADMIN") && (
              <Link href="/admin/apps" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30">
                <span>Kelola Aplikasi</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                className="group relative bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 text-left overflow-hidden flex flex-col h-full"
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 group-hover:bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-3xl border border-slate-100 dark:border-slate-800 group-hover:border-emerald-100 transition-colors">
                    {app.ikon || "🚀"}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 dark:bg-emerald-500/10 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </div>
                </div>
                
                <div className="relative z-10 flex-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-emerald-600 transition-colors">{app.nama}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed transition-colors">
                    {app.deskripsi || "Akses modul " + app.nama + " untuk manajemen data."}
                  </p>
                </div>
              </button>
            ))}
            
            {/* Manage Apps Card - Only for admins with permission */}
            {permissions.includes("MANAJEMEN_ADMIN") && (
              <Link
                href="/admin/apps"
                className="group relative bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-emerald-50 dark:bg-emerald-500/10 hover:border-emerald-300 transition-all duration-300 text-left overflow-hidden flex flex-col justify-center items-center h-full min-h-[200px]"
              >
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 shadow-sm border border-slate-200 dark:border-slate-800 mb-4 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <h3 className="text-base font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 transition-colors">Kelola Aplikasi</h3>
                <p className="text-xs text-slate-400 mt-1 text-center">Tambah atau edit shortcut aplikasi</p>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
