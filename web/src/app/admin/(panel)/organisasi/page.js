"use client";

import { useState, useEffect } from "react";
import { Target, Users, GitMerge, KanbanSquare, Users2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import TabStruktur from "./components/TabStruktur";

const ALL_TABS = [
  { id: "okr", name: "OKR & KPI", icon: <Target size={18} />, permission: 'ORGANISASI_TAB_OKR' },
  { id: "struktur", name: "Struktur & Jobdesk", icon: <Users size={18} />, permission: 'ORGANISASI_TAB_STRUKTUR' },
  { id: "pivot", name: "Pivot", icon: <GitMerge size={18} />, permission: 'ORGANISASI_TAB_PIVOT' },
  { id: "project", name: "Manajemen Project", icon: <KanbanSquare size={18} />, permission: 'ORGANISASI_TAB_PROJECT' },
  { id: "rapat", name: "Rapat", icon: <Users2 size={18} />, permission: 'ORGANISASI_TAB_RAPAT' },
];

export default function OrganisasiPage() {
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
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Organisasi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sistem manajemen kelembagaan terpadu.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px custom-scrollbar mb-6">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Konten Tab */}
      <div className="mt-6">
        {activeTab === 'struktur' ? (
          <TabStruktur />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {availableTabs.find(t => t.id === activeTab)?.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Modul {availableTabs.find(t => t.id === activeTab)?.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                Fitur ini sedang dalam antrean pengembangan. Nantikan pembaruannya!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
