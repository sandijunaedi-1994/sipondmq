'use client';
import { useState, useEffect } from 'react';
import AbsensiKBMTab from './AbsensiKBMTab';
import AbsensiShalatTab from './AbsensiShalatTab';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const TABS = [
  { key: 'kbm',     label: 'KBM',              icon: '🏫', aktif: true },
  { key: 'shalat',  label: 'Shalat Berjamaah', icon: '🕌', aktif: true },
  { key: 'apel',    label: 'Apel Pagi',        icon: '🚩', aktif: false },
  { key: 'amal',    label: 'Amal Jamai',       icon: '🌿', aktif: false },
  { key: 'kajian',  label: 'Kajian Maghrib',   icon: '📚', aktif: false },
  { key: 'halaqoh', label: 'Halaqoh Mutun',    icon: '📖', aktif: false },
  { key: 'ekskul',  label: 'Ekskul',           icon: '⚽', aktif: false },
  { key: 'malam',   label: 'Belajar Malam',    icon: '🌙', aktif: false },
  { key: 'subuh',   label: 'Bangun Subuh',     icon: '🌅', aktif: false },
  { key: 'tidur',   label: 'Tidur Malam',      icon: '😴', aktif: false },
];

export default function AbsensiPage() {
  const [activeTab, setActiveTab] = useState('kbm');
  const [pegawaiId, setPegawaiId] = useState(null);

  // Cari pegawaiId dari token user yang login
  useEffect(() => {
    const fetchPegawai = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) return;
        const res = await fetch(`${API}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.pegawai?.id) setPegawaiId(data.pegawai.id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPegawai();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Absensi Santri</h1>
        <p className="text-slate-500 text-sm">Rekam ketidakhadiran santri pada setiap kegiatan</p>
      </div>

      {/* Tab Navigation — scrollable horizontal */}
      <div className="relative">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-slate-200">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => tab.aktif && setActiveTab(tab.key)}
              title={!tab.aktif ? 'Segera hadir' : undefined}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-all shrink-0 relative
                ${activeTab === tab.key
                  ? 'bg-white border border-b-white border-slate-200 text-emerald-700 -mb-px z-10'
                  : tab.aktif
                    ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {!tab.aktif && (
                <span className="text-[9px] bg-slate-100 text-slate-400 px-1 rounded">soon</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 min-h-[400px]">
        {activeTab === 'kbm' && (
          <AbsensiKBMTab pegawaiId={pegawaiId} />
        )}
        {activeTab === 'shalat' && (
          <AbsensiShalatTab pegawaiId={pegawaiId} />
        )}

        {/* Placeholder untuk tab yang belum aktif */}
        {activeTab !== 'kbm' && activeTab !== 'shalat' && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="text-5xl mb-4">
              {TABS.find(t => t.key === activeTab)?.icon}
            </div>
            <p className="font-semibold text-lg text-slate-500">
              {TABS.find(t => t.key === activeTab)?.label}
            </p>
            <p className="text-sm mt-1">Fitur ini sedang dalam pengembangan</p>
          </div>
        )}
      </div>
    </div>
  );
}
