"use client";

import { useState } from "react";

export default function SekretariatPage() {
  const [activeTab, setActiveTab] = useState("surat");

  return (
    <div className="space-y-6">
      {/* Global Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Sekretariat</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola surat menyurat dan arsip digital lembaga.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px custom-scrollbar mb-6">
        {['surat', 'arsip'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'surat' ? 'Surat Menyurat' : 'Arsip Digital'}
          </button>
        ))}
      </div>

      {/* Konten Tab */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'surat' && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500">Modul Surat Menyurat</h3>
            <p className="text-slate-400 mt-2">Fitur ini sedang dalam pengembangan.</p>
          </div>
        )}

        {activeTab === 'arsip' && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500">Modul Arsip Digital</h3>
            <p className="text-slate-400 mt-2">Fitur ini sedang dalam pengembangan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
