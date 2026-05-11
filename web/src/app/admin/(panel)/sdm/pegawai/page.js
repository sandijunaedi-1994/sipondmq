"use client";

import { useState } from "react";
import TabDataPegawai from "./components/TabDataPegawai";
import TabPenggajianGlobal from "./components/TabPenggajianGlobal";
import TabKasbonGlobal from "./components/TabKasbonGlobal";

export default function ManajemenPegawaiPage() {
  const [activeTab, setActiveTab] = useState("data-pegawai");

  return (
    <div className="space-y-6">
      {/* Global Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Manajemen SDM</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola data seluruh pegawai, proses penggajian, dan pengajuan kasbon.</p>
      </div>

      {/* Global Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px mb-6 custom-scrollbar">
        {['data-pegawai', 'penggajian', 'kasbon'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'data-pegawai' ? 'Data Pegawai' : 
             tab === 'penggajian' ? 'Penggajian / Payroll' : 'Manajemen Kasbon'}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'data-pegawai' && <TabDataPegawai />}
        {activeTab === 'penggajian' && <TabPenggajianGlobal />}
        {activeTab === 'kasbon' && <TabKasbonGlobal />}
      </div>
    </div>
  );
}
