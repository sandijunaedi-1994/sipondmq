"use client";

import { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";

import JadwalTab from "./JadwalTab";

const ALL_TABS = [
  { id: 'jadwal', label: 'Jadwal Pelajaran', permission: 'LITBANG_VIEW' },
  { id: 'penelitian', label: 'Penelitian', permission: 'LITBANG_TAB_PENELITIAN' },
  { id: 'sop', label: 'SOP & Panduan', permission: 'LITBANG_TAB_SOP' }
];

export default function LitbangPage() {
  const { hasAccess, loading } = usePermissions();
  const [activeTab, setActiveTab] = useState("");

  const availableTabs = ALL_TABS.filter(tab => hasAccess(tab.permission));

  useEffect(() => {
    if (!loading && availableTabs.length > 0 && !activeTab) {
      setActiveTab(availableTabs[0].id);
    }
  }, [loading, availableTabs, activeTab]);

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat akses...</div>;

  if (availableTabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 text-2xl">🚫</div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Akses Ditolak</h2>
        <p className="text-slate-500 max-w-md">Anda tidak memiliki hak akses untuk membuka tab manapun di modul ini. Silakan hubungi Superadmin jika ini adalah sebuah kesalahan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Litbang & Budaya</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola penelitian dan Standar Operasional Prosedur (SOP).</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px custom-scrollbar mb-6">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Konten Tab */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'jadwal' && (
          <JadwalTab />
        )}

        {activeTab === 'penelitian' && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500">Modul Penelitian</h3>
            <p className="text-slate-400 mt-2">Fitur ini sedang dalam pengembangan.</p>
          </div>
        )}

        {activeTab === 'sop' && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500">Modul SOP & Panduan</h3>
            <p className="text-slate-400 mt-2">Fitur ini sedang dalam pengembangan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
