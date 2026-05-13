"use client";

import { useState } from "react";
import TabSpmb from "./components/TabSpmb";
import { usePermissions } from "@/hooks/usePermissions";

export default function DashboardSantriPage() {
  const { hasAccess, loading } = usePermissions();
  const [activeTab, setActiveTab] = useState("spmb");

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat akses...</div>;

  return (
    <div className="space-y-6">
      {/* Header Dashboard Santri */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">Dashboard Santri</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">Pusat analitik dan statistik data santri</p>
          </div>
        </div>
      </div>

      {/* Global Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px mb-6 custom-scrollbar">
        <button
          onClick={() => setActiveTab('spmb')}
          className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'spmb' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          SPMB (Penerimaan Santri)
        </button>
        <button
          onClick={() => setActiveTab('aktif')}
          className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'aktif' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Santri Aktif
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'spmb' && <TabSpmb />}
        {activeTab === 'aktif' && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Dashboard Santri Aktif</h3>
            <p className="text-slate-500 mt-2">Sedang dalam tahap pengembangan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
