"use client";

import { useState } from "react";

export default function LitbangPage() {
  const [activeTab, setActiveTab] = useState("penelitian");

  return (
    <div className="space-y-6">
      {/* Global Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Litbang & Budaya</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola penelitian dan Standar Operasional Prosedur (SOP).</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px custom-scrollbar mb-6">
        {['penelitian', 'sop'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'penelitian' ? 'Penelitian' : 'SOP & Panduan'}
          </button>
        ))}
      </div>

      {/* Konten Tab */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
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
