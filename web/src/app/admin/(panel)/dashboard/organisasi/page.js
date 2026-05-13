"use client";

import { useState } from "react";
import TabSdm from "./components/TabSdm";
import { usePermissions } from "@/hooks/usePermissions";

export default function DashboardOrganisasiPage() {
  const { hasAccess, loading } = usePermissions();
  const [activeTab, setActiveTab] = useState("sdm");

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat akses...</div>;

  return (
    <div className="space-y-6">
      {/* Header Dashboard Organisasi */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">Dashboard Organisasi</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">Statistik dan analisis struktur internal lembaga</p>
          </div>
        </div>
      </div>

      {/* Global Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px mb-6 custom-scrollbar">
        <button
          onClick={() => setActiveTab('sdm')}
          className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'sdm' 
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Manajemen SDM
        </button>
        <button
          onClick={() => setActiveTab('kinerja')}
          className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'kinerja' 
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Penilaian Kinerja
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'sdm' && <TabSdm />}
        {activeTab === 'kinerja' && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Dashboard Kinerja Pegawai</h3>
            <p className="text-slate-500 mt-2">Sedang dalam tahap pengembangan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
