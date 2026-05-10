"use client";

import { useState } from "react";
import SoalTesCBT from "./components/SoalTesCBT";
import WawancaraWali from "./components/WawancaraWali";
import JadwalOffline from "./components/JadwalOffline";
import JadwalOnline from "./components/JadwalOnline";
import RubrikPenguji from "./components/RubrikPenguji";

export default function PPDBSettingsPage() {
  const [activeTab, setActiveTab] = useState("CBT");

  const tabs = [
    { id: "CBT", label: "Bank Soal CBT", icon: "📝" },
    { id: "WAWANCARA", label: "Wawancara Wali", icon: "🎙️" },
    { id: "RUBRIK", label: "Rubrik Penguji", icon: "📋" },
    { id: "OFFLINE", label: "Jadwal Offline", icon: "🏫" },
    { id: "ONLINE", label: "Jadwal Online", icon: "💻" }
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
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "CBT" && <SoalTesCBT />}
        {activeTab === "WAWANCARA" && <WawancaraWali />}
        {activeTab === "RUBRIK" && <RubrikPenguji />}
        {activeTab === "OFFLINE" && <JadwalOffline />}
        {activeTab === "ONLINE" && <JadwalOnline />}
      </div>
    </div>
  );
}
