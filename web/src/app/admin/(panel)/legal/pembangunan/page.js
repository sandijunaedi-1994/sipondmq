"use client";

import { useState } from "react";
import { Hammer, Users, Briefcase, Truck, Box } from "lucide-react";
import TabPengaturanPekerja from "./components/TabPengaturanPekerja";
import TabPengaturanVendor from "./components/TabPengaturanVendor";
import TabPengaturanMaterial from "./components/TabPengaturanMaterial";
import TabDaftarProject from "./components/TabDaftarProject";
import TabPembagianTugas from "./components/TabPembagianTugas";

export default function PembangunanMaintenancePage() {
  const [activeTab, setActiveTab] = useState("project");
  const [activeSubTab, setActiveSubTab] = useState("pekerja");

  return (
    <div className="space-y-6">
      {/* Navigation Tabs (tanpa header judul agar hemat space) */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px custom-scrollbar">
        {['project', 'tugas', 'pengaturan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'project' ? 'Daftar Project' : 
             tab === 'tugas' ? 'Pembagian Tugas' : 'Pengaturan'}
          </button>
        ))}
      </div>

      {/* Konten Tab */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Tab 1: Daftar Project */}
        {activeTab === 'project' && <TabDaftarProject />}

        {/* Tab 2: Pembagian Tugas */}
        {activeTab === 'tugas' && (
          <TabPembagianTugas />
        )}

        {/* Tab 3: Pengaturan */}
        {activeTab === 'pengaturan' && (
          <div className="space-y-6">
            {/* Sub-Tabs Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'pekerja', label: 'Data Pekerja', icon: <Users size={16} /> },
                { id: 'vendor', label: 'Data Vendor', icon: <Truck size={16} /> },
                { id: 'material', label: 'Data Material', icon: <Box size={16} /> }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTab(sub.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeSubTab === sub.id
                      ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {sub.icon}
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub-Tab Konten */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[300px]">
              {activeSubTab === 'pekerja' && <TabPengaturanPekerja />}
              {activeSubTab === 'vendor' && <TabPengaturanVendor />}
              {activeSubTab === 'material' && <TabPengaturanMaterial />}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
