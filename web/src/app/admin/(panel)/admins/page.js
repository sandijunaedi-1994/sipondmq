"use client";

import { useState } from "react";
import ManajemenUser from "./components/ManajemenUser";
import ManajemenGrup from "./components/ManajemenGrup";
import ManajemenAplikasi from "./components/ManajemenAplikasi";
import ManajemenHirarki from "./components/ManajemenHirarki";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("USER");

  const tabs = [
    { id: "USER", label: "Manajemen User", icon: "👤" },
    { id: "GRUP", label: "Manajemen Grup", icon: "👥" },
    { id: "APLIKASI", label: "Manajemen Aplikasi", icon: "🚀" },
    { id: "HIRARKI", label: "Manajemen Hirarki", icon: "🔰" }
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
                : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "USER" && <ManajemenUser />}
        {activeTab === "GRUP" && <ManajemenGrup />}
        {activeTab === "APLIKASI" && <ManajemenAplikasi />}
        {activeTab === "HIRARKI" && <ManajemenHirarki />}
      </div>
    </div>
  );
}
