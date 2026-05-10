"use client";

import { useState } from "react";
import PengaturanKelas from "./components/PengaturanKelas";
import PengaturanAsrama from "./components/PengaturanAsrama";
import PengaturanKartu from "./components/PengaturanKartu";

export default function PengaturanSantriPage() {
  const [activeTab, setActiveTab] = useState("KELAS");

  const tabs = [
    { id: "KELAS", label: "Pengaturan Kelas", icon: "🏫" },
    { id: "ASRAMA", label: "Pengaturan Asrama", icon: "🏢" },
    { id: "KARTU", label: "Pengaturan Kartu", icon: "💳" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "KELAS" && <PengaturanKelas />}
        {activeTab === "ASRAMA" && <PengaturanAsrama />}
        {activeTab === "KARTU" && <PengaturanKartu />}
      </div>
    </div>
  );
}
