"use client";

import { useState } from "react";
import { Target, Users, GitMerge, KanbanSquare, Users2 } from "lucide-react";

export default function OrganisasiPage() {
  const [activeTab, setActiveTab] = useState("okr");

  const tabs = [
    { id: "okr", name: "OKR & KPI", icon: <Target size={18} /> },
    { id: "struktur", name: "Struktur & Jobdesk", icon: <Users size={18} /> },
    { id: "pivot", name: "Pivot", icon: <GitMerge size={18} /> },
    { id: "project", name: "Manajemen Project", icon: <KanbanSquare size={18} /> },
    { id: "rapat", name: "Rapat", icon: <Users2 size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Global Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Organisasi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sistem manajemen kelembagaan terpadu.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px custom-scrollbar mb-6">
        {tabs.map((tab) => (
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
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {tabs.find(t => t.id === activeTab)?.icon}
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Modul {tabs.find(t => t.id === activeTab)?.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            Fitur ini sedang dalam antrean pengembangan. Nantikan pembaruannya!
          </p>
        </div>
      </div>
    </div>
  );
}
