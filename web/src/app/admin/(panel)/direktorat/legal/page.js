"use client";

import { useState, useEffect } from "react";
import { Hammer, Users, Briefcase, Truck, Box } from "lucide-react";
import TabPengaturanPekerja from "./components/TabPengaturanPekerja";
import TabPengaturanVendor from "./components/TabPengaturanVendor";
import TabPengaturanMaterial from "./components/TabPengaturanMaterial";
import TabDaftarProject from "./components/TabDaftarProject";
import TabPembagianTugas from "./components/TabPembagianTugas";
import { usePermissions } from "@/hooks/usePermissions";

const ALL_TABS = [
  { id: 'inventaris', label: 'Inventaris', permission: 'LEGAL_TAB_INVENTARIS' },
  { id: 'perizinan', label: 'Perizinan Lembaga', permission: 'LEGAL_TAB_IZIN' },
  { id: 'pembangunan', label: 'Pembangunan & Maintenance', permission: 'LEGAL_TAB_PEMBANGUNAN' }
];

export default function PembangunanMaintenancePage() {
  const { hasAccess, loading } = usePermissions();
  const [activeTab, setActiveTab] = useState("");
  const [activeSubTabPembangunan, setActiveSubTabPembangunan] = useState("project");
  const [activePengaturanTab, setActivePengaturanTab] = useState("pekerja");

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
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Legal & Aset</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola inventaris, perizinan lembaga, dan pembangunan/maintenance.</p>
      </div>

      {/* Navigation Tabs (Top Level) */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px custom-scrollbar mb-6">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Konten Tab Top Level */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {activeTab === 'inventaris' && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500">Modul Inventaris</h3>
            <p className="text-slate-400 mt-2">Fitur ini sedang dalam pengembangan.</p>
          </div>
        )}

        {activeTab === 'perizinan' && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500">Modul Perizinan Lembaga</h3>
            <p className="text-slate-400 mt-2">Fitur ini sedang dalam pengembangan.</p>
          </div>
        )}

        {activeTab === 'pembangunan' && (
          <div className="space-y-6">
            <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px custom-scrollbar">
              {['project', 'tugas', 'pengaturan'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubTabPembangunan(sub)}
                  className={`px-4 py-2 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                    activeSubTabPembangunan === sub 
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  {sub === 'project' ? 'Daftar Project' : 
                   sub === 'tugas' ? 'Pembagian Tugas' : 'Pengaturan'}
                </button>
              ))}
            </div>

            {activeSubTabPembangunan === 'project' && <TabDaftarProject />}
            {activeSubTabPembangunan === 'tugas' && <TabPembagianTugas />}
            {activeSubTabPembangunan === 'pengaturan' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'pekerja', label: 'Data Pekerja', icon: <Users size={16} /> },
                    { id: 'vendor', label: 'Data Vendor', icon: <Truck size={16} /> },
                    { id: 'material', label: 'Data Material', icon: <Box size={16} /> }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActivePengaturanTab(sub.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activePengaturanTab === sub.id
                          ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      {sub.icon}
                      {sub.label}
                    </button>
                  ))}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[300px]">
                  {activePengaturanTab === 'pekerja' && <TabPengaturanPekerja />}
                  {activePengaturanTab === 'vendor' && <TabPengaturanVendor />}
                  {activePengaturanTab === 'material' && <TabPengaturanMaterial />}
                </div>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
