"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, Bell } from "lucide-react";
import FloatingChat from "./components/FloatingChat";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [adminProfile, setAdminProfile] = useState({ name: "Admin", email: "admin@mqbs.com", initial: "AD" });
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Verifikasi admin_token
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin");
    } else {
      const perms = JSON.parse(localStorage.getItem("admin_permissions") || "[]");
      const name = localStorage.getItem("admin_name") || "Administrator";
      const email = localStorage.getItem("admin_email") || "admin@mqbs.com";
      const initial = name.substring(0, 2).toUpperCase();
      
      setAdminProfile({ name, email, initial });
      setPermissions(perms);
      setLoading(false);
    }
  }, [router]);

  // Close sidebar when clicking a link on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_permissions");
    router.replace("/admin");
  };

  const toggleSubmenu = (menuName) => {
    setExpandedMenus(prev => ({
      // Mode accordion: tutup yang lain saat membuka menu baru
      [menuName]: !prev[menuName]
    }));
  };

  const allMenuItems = [
    { 
      name: "Dashboard", icon: "📊", permission: null,
      subItems: [
        { name: "Dashboard Organisasi", path: "/admin/dashboard/organisasi", permission: "DASHBOARD_ORGANISASI_VIEW" },
        { name: "Dashboard Santri", path: "/admin/dashboard/santri", permission: "DASHBOARD_SANTRI_VIEW" }
      ]
    },
    { name: "Ruang Kerja Saya", path: "/admin/ruang-kerja", icon: "💼", permission: null },
    { name: "Organisasi", path: "/admin/organisasi", icon: "🏢", permission: "ORGANISASI_VIEW" },
    { 
      name: "Direktorat Pusat", icon: "🏛️", permission: null,
      subItems: [
        { name: "Sekretariat", path: "/admin/direktorat/sekretariat", permission: "SEKRETARIAT_VIEW" },
        { name: "Manajemen SDM", path: "/admin/direktorat/sdm", permission: "SDM_VIEW" },
        { name: "Litbang & Budaya", path: "/admin/direktorat/litbang", permission: "LITBANG_VIEW" },
        { name: "Pengelolaan Keuangan", path: "/admin/direktorat/keuangan", permission: "KEUANGAN_ANGGARAN_VIEW" },
        { name: "Legal & Aset", path: "/admin/direktorat/legal", permission: "LEGAL_VIEW" }
      ]
    },
    { 
      name: "Administrasi Pembelajaran", icon: "📖", permission: null,
      subItems: [
        { name: "Kurikulum", path: "/admin/pembelajaran/kurikulum", permission: "AKADEMIK_ADMIN_VIEW" },
        { name: "Jadwal Pelajaran", path: "/admin/pembelajaran/jadwal", permission: "AKADEMIK_ADMIN_VIEW" }
      ]
    },
    { 
      name: "Manajemen SPMB", icon: "📋", permission: null,
      subItems: [
        { name: "Data Peserta", path: "/admin/ppdb/peserta", permission: "SPMB_PESERTA_VIEW" },
        { name: "Data Survey", path: "/admin/ppdb/survey", permission: "SPMB_SURVEY_VIEW" },
        { name: "Pengaturan SPMB", path: "/admin/ppdb/settings", permission: "SPMB_SETTINGS_VIEW" }
      ]
    },
    { 
      name: "Santri Aktif", icon: "🎓", permission: null,
      subItems: [
        { name: "Data Santri", path: "/admin/santri/data", permission: "SANTRI_VIEW" },
        { name: "Kelengkapan Berkas", path: "/admin/santri/berkas", permission: "SANTRI_BERKAS_VIEW" },
        { name: "Pengaturan", path: "/admin/santri/pengaturan", permission: "SANTRI_SETTINGS_VIEW" }
      ] 
    },
    { 
      name: "Akademik", icon: "📚", permission: null,
      subItems: [
        { name: "Hafalan Qur'an", path: "/admin/akademik/tahfidz", permission: "QURAN_VIEW" },
        { name: "Hafalan Matan", path: "/admin/matan", permission: "MATAN_VIEW" },
        { name: "Pelanggaran", path: "/admin/pelanggaran", permission: "PELANGGARAN_VIEW" },
        { name: "Prestasi", path: "/admin/prestasi", permission: "PRESTASI_VIEW" }
      ]
    },
    { 
      name: "Keuangan", icon: "💳", permission: null,
      subItems: [
        { name: "Setting Tagihan", path: "/admin/keuangan/setting-tagihan", permission: "KEUANGAN_SETTING_VIEW" },
        { name: "Ringkasan Tagihan", path: "/admin/keuangan/ringkasan", permission: "KEUANGAN_RINGKASAN_VIEW" },
        { name: "Tagihan Khusus", path: "/admin/keuangan/tagihan-khusus", permission: "KEUANGAN_KHUSUS_VIEW" },
        { name: "Manajemen Donasi", path: "/admin/keuangan/donasi", permission: "KEUANGAN_DONASI_VIEW" }
      ]
    },
    { 
      name: "Layanan Umum", icon: "🏥", permission: null,
      subItems: [
        { name: "Kesehatan (UKS)", path: "/admin/kesehatan", permission: "KESEHATAN_VIEW" },
        { name: "Perizinan", path: "/admin/perizinan", permission: "PERIZINAN_VIEW" },
        { name: "Chat / Pesan", path: "/admin/chat", permission: "CHAT_VIEW" }
      ]
    },
    { name: "Pusat Informasi", icon: "📢", permission: null,
      subItems: [
        { name: "Dokumen", path: "/admin/informasi/dokumen", permission: "INFO_DOKUMEN_VIEW" },
        { name: "Kalender Kegiatan", path: "/admin/kalender", permission: "INFO_KALENDER_VIEW" },
        { name: "Broadcast", path: "/admin/informasi/broadcast", permission: "INFO_BROADCAST_VIEW" }
      ] 
    },
    { name: "Halaman Admin", path: "/admin/admins", icon: "🛡️", permission: "MANAJEMEN_ADMIN" },
    { name: "Tentang", path: "/admin/tentang", icon: "ℹ️", permission: null }
  ];

  const hasAccess = (perm) => {
    if (!perm) return true;
    if (permissions.includes("MANAJEMEN_ADMIN")) return true;
    if (Array.isArray(perm)) {
      return perm.some(p => permissions.includes(p));
    }
    return permissions.includes(perm);
  };

  const menuItems = allMenuItems.map(item => {
    if (item.subItems) {
      return { ...item, subItems: item.subItems.filter(sub => hasAccess(sub.permission)) };
    }
    return item;
  }).filter(item => {
    if (item.subItems) return item.subItems.length > 0;
    return hasAccess(item.permission);
  });

  const getPageTitle = () => {
    if (pathname === '/admin/ruang-kerja') return 'Dashboard Pribadi';
    return pathname.split("/").pop().replace(/-/g, " ");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      
      {/* ── Overlay Sidebar Mobile ── */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto custom-scrollbar transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-950 z-10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative flex items-center justify-center p-1 bg-slate-100 dark:bg-white dark:bg-slate-900 rounded-xl transition-colors">
              <img src="/logo.png" alt="Logo MQ" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-tight text-slate-800 dark:text-slate-100">Superadmin</h2>
              <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold tracking-widest uppercase mt-0.5">Control Panel</p>
            </div>
          </div>
          <button className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1.5">
          {menuItems.map((item, index) => {
            const hasSubmenu = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedMenus[item.name];
            
            // Check if any subitem is active
            const isSubItemActive = hasSubmenu && item.subItems.some(sub => pathname.startsWith(sub.path));
            const active = !hasSubmenu && item.path && pathname.startsWith(item.path);
            
            const isMenuSayaFirst = item.name === "Dashboard" && index === menuItems.findIndex(i => i.name === "Dashboard");
            const isMenuUtamaFirst = item.name === "Manajemen SPMB" && index === menuItems.findIndex(i => i.name === "Manajemen SPMB");
            const isLainnyaFirst = (item.name === "Halaman Admin" || item.name === "Tentang") && index === menuItems.findIndex(i => i.name === "Halaman Admin" || i.name === "Tentang");

            return (
              <div key={item.name}>
                {isMenuSayaFirst && (
                  <p className={`px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ${index === 0 ? 'mb-3' : 'mt-6 mb-3'} transition-colors`}>Menu Utama</p>
                )}
                {isMenuUtamaFirst && (
                  <p className={`px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ${index === 0 ? 'mb-3' : 'mt-6 mb-3'} transition-colors`}>Menu Santri</p>
                )}
                {isLainnyaFirst && (
                  <p className={`px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ${index === 0 ? 'mb-3' : 'mt-6 mb-3'} transition-colors`}>Lainnya</p>
                )}
                {hasSubmenu ? (
                  <button 
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                      ${isSubItemActive ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"}`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <span className="leading-snug">{item.name}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                ) : (
                  <Link href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                      ${active 
                        ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"}`}>
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <span className="text-left leading-snug">{item.name}</span>
                  </Link>
                )}

                {/* Render Subitems */}
                {hasSubmenu && isExpanded && (
                  <div className="mt-1 mb-2 ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-1">
                    {item.subItems.map(sub => {
                      const subActive = sub.path === "/admin/dashboard" 
                        ? pathname === "/admin/dashboard" 
                        : pathname.startsWith(sub.path);
                      return (
                        <Link key={sub.path} href={sub.path}
                          className={`block px-4 py-2 rounded-lg text-sm transition-colors duration-200
                            ${subActive ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-500 hover:text-slate-800 dark:text-slate-100 dark:hover:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800/50"}`}>
                          {sub.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 transition-colors">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition">
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 transition-colors">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-slate-800 dark:text-slate-100 capitalize hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/admin/portal" className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <span>App Launcher</span>
            </Link>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            
            {/* Theme Toggle */}
            {mounted && (
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{adminProfile.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{adminProfile.email}</p>
              </div>
              <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-500/30">
                {adminProfile.initial}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
      <FloatingChat />
    </div>
  );
}
