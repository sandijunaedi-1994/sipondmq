"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboardUtama() {
  const [adminName, setAdminName] = useState("Admin");
  
  useEffect(() => {
    setAdminName(localStorage.getItem("admin_name") || "Admin");
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 right-32 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-3">Ahlan Wa Sahlan, {adminName}! 👋</h2>
          <p className="text-slate-400 max-w-2xl text-base leading-relaxed">
            Selamat datang di Pusat Kontrol Sistem Informasi Manajemen Madinatul Qur'an. Pilih salah satu modul di bawah ini untuk melihat ringkasan data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link href="/admin/dashboard/ppdb" className="group">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 h-full flex flex-col">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📋
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">Dashboard SPMB</h3>
            <p className="text-slate-500 dark:text-slate-400 flex-1 transition-colors">
              Pantau progres Seleksi Penerimaan Murid Baru (SPMB), statistik pendaftar, asal sekolah, dan status penerimaan calon santri secara real-time.
            </p>
            <div className="mt-6 flex items-center text-emerald-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
              Lihat Dashboard <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </div>
        </Link>

        <Link href="/admin/dashboard/keuangan" className="group">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 h-full flex flex-col">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              💳
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">Dashboard Keuangan</h3>
            <p className="text-slate-500 dark:text-slate-400 flex-1 transition-colors">
              Lihat ringkasan pemasukan, tagihan yang belum dibayar, serta rekapitulasi data keuangan SPP, uang masuk, dan donasi.
            </p>
            <div className="mt-6 flex items-center text-blue-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
              Lihat Dashboard <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
