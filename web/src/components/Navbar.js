"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useChild } from "../context/ChildContext";

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { santriList, selectedSantri, setSelectedSantri } = useChild();

  const [childDropOpen, setChildDropOpen] = useState(false);
  const [userDropOpen,  setUserDropOpen]  = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const childDropRef = useRef(null);
  const userDropRef  = useRef(null);
  const mobileMenuRef = useRef(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (childDropRef.current && !childDropRef.current.contains(e.target)) setChildDropOpen(false);
      if (userDropRef.current  && !userDropRef.current.contains(e.target))  setUserDropOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("selected_santri_id");
    router.push("/login");
  };

  // Navigasi utama
  const navItems = [
    { name: "Beranda",   path: "/beranda",   icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { name: "SPMB",      path: "/dashboard", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
    { name: "Keuangan",  path: "/keuangan",  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { name: "Informasi", path: "/informasi", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { name: "Perizinan", path: "/perizinan", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  ];

  // Menu user (dropdown avatar)
  const userMenuItems = [
    { name: "Profil Akun",      path: "/profile",  icon: "👤" },
    { name: "Riwayat Kesehatan",path: "/kesehatan",icon: "🏥" },
    { name: "Setting Password", path: "/settings", icon: "🔑" },
  ];

  const initials = (name) => name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      {/* ── Top Navbar (Desktop & Mobile Header) ── */}
      <nav className="bg-primary text-white shadow-md sticky top-0 z-50 border-b border-primary-dark">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-4">
            {/* ── Logo ── */}
            <Link href="/beranda" className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-90 transition-opacity">
              <img src="/logo.png" alt="Logo MQ" className="w-9 h-9 rounded-full bg-white object-cover border-2 border-white/50" />
              <span className="font-bold text-base hidden lg:block leading-tight tracking-tight">Portal<br /><span className="text-white/70 text-[10px] uppercase font-bold tracking-widest">Wali Santri</span></span>
            </Link>

            {/* ── Child Selector ── */}
            {santriList.length > 0 && (
              <div className="relative flex-shrink-0" ref={childDropRef}>
                <button
                  id="child-selector-btn"
                  onClick={() => setChildDropOpen((p) => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl transition text-sm max-w-[140px] sm:max-w-[200px] shadow-sm"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {initials(selectedSantri?.name)}
                  </div>
                  <span className="font-bold truncate leading-tight tracking-tight">{selectedSantri?.name || "Pilih Anak"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 flex-shrink-0 opacity-70 transition-transform ${childDropOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {childDropOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 pt-4 pb-2 border-b border-slate-50">Pilih Data Santri</p>
                    {santriList.map((s) => {
                      const active = selectedSantri?.id === s.id;
                      return (
                        <button key={s.id}
                          onClick={() => { setSelectedSantri(s); setChildDropOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition
                            ${active ? "bg-primary/5 text-primary-dark" : "hover:bg-slate-50 text-slate-700"}`}>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                            ${active ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-slate-100 text-slate-500"}`}>
                            {initials(s.name)}
                          </div>
                          <div className="overflow-hidden">
                            <p className={`font-bold text-sm truncate leading-snug ${active ? "text-primary-dark" : "text-slate-800"}`}>{s.name}</p>
                            <p className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-wider">{s.grade || "Kelas"} • {s.asrama || "Asrama"}</p>
                          </div>
                          {active && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Desktop Nav Links ── (Hanya tampil di tablet/desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2
                  ${isActive(item.path) ? "bg-white text-primary shadow-sm" : "hover:bg-white/10 text-white/90"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon}
                </svg>
                {item.name}
              </Link>
            ))}
          </div>

          {/* ── Icon Buttons & Desktop Profile ── */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            
            {/* Chat icon */}
            <Link href="/chat" aria-label="Chat"
              className={`relative p-2 rounded-xl transition ${isActive("/chat") ? "bg-white text-primary shadow-sm" : "hover:bg-white/15 text-white/90"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 border border-primary rounded-full animate-pulse"></span>
            </Link>

            {/* Notification icon */}
            <Link href="/notifications" aria-label="Notifikasi"
              className={`relative p-2 rounded-xl transition ${isActive("/notifications") ? "bg-white text-primary shadow-sm" : "hover:bg-white/15 text-white/90"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>

            {/* Desktop Profile Dropdown */}
            <div className="relative hidden md:block ml-1" ref={userDropRef}>
              <button
                onClick={() => setUserDropOpen((p) => !p)}
                className={`p-1 rounded-xl transition ${userDropOpen ? "bg-white/20" : "hover:bg-white/15"} flex items-center justify-center`}
                aria-label="Menu Akun"
              >
                <div className="w-8 h-8 bg-white text-primary rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                  {initials(selectedSantri?.name)}
                </div>
              </button>

              {userDropOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-4 bg-slate-50 border-b border-slate-100">
                    <p className="font-bold text-slate-800 text-sm truncate">{selectedSantri?.name || "Akun Wali"}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-widest mt-0.5">{selectedSantri?.markaz || "My MQ"}</p>
                  </div>
                  <div className="py-2">
                    {userMenuItems.map((item) => (
                      <Link key={item.path} href={item.path}
                        onClick={() => setUserDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 p-2">
                    <button onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Keluar Akun
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Navigation (Web View Mode) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] z-50 flex justify-between px-2 pb-safe">
        {navItems.slice(0, 4).map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} href={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-1 gap-1 transition-colors
                ${active ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}>
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ? "bg-primary/10" : ""}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon}
                </svg>
              </div>
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{item.name}</span>
            </Link>
          );
        })}
        
        {/* Menu "Lainnya" untuk mobile */}
        <div className="flex-1 relative flex flex-col items-center justify-center" ref={mobileMenuRef}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-full flex flex-col items-center justify-center py-3 px-1 gap-1 transition-colors
              ${mobileMenuOpen ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${mobileMenuOpen ? "bg-primary/10" : ""}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <span className={`text-[10px] ${mobileMenuOpen ? "font-bold" : "font-medium"}`}>Lainnya</span>
          </button>

          {/* Popup Menu Lainnya */}
          {mobileMenuOpen && (
            <div className="absolute bottom-[calc(100%+10px)] right-2 w-48 bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                 <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                  {initials(selectedSantri?.name)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-800 text-xs truncate">Menu Wali</p>
                </div>
              </div>
              <div className="py-2">
                <Link href="/perizinan" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition" onClick={() => setMobileMenuOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Perizinan Santri
                </Link>
                {userMenuItems.map((item) => (
                  <Link key={item.path} href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
              <div className="border-t border-slate-100 p-2">
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Keluar Akun
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
