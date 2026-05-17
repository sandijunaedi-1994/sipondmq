"use client";

import React, { useState } from "react";
import { ClipboardList, BookOpen, Clock, Users, Moon, Sun, Monitor, Activity } from "lucide-react";

export default function ManajemenAbsensiPage() {
  const [activeTab, setActiveTab] = useState("kbm");

  const tabs = [
    { id: "kbm", label: "KBM", icon: <BookOpen size={16} /> },
    { id: "shalat", label: "Shalat Berjamaah", icon: <Users size={16} /> },
    { id: "apel", label: "Apel Pagi", icon: <Sun size={16} /> },
    { id: "amal", label: "Amal Jamai", icon: <Activity size={16} /> },
    { id: "kajian", label: "Kajian Maghrib", icon: <Monitor size={16} /> },
    { id: "halaqoh", label: "Halaqoh Mutun", icon: <BookOpen size={16} /> },
    { id: "ekskul", label: "Ekskul", icon: <Activity size={16} /> },
    { id: "belajar", label: "Belajar Malam", icon: <Clock size={16} /> },
    { id: "bangun", label: "Bangun Subuh", icon: <Sun size={16} /> },
    { id: "tidur", label: "Tidur Malam", icon: <Moon size={16} /> }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <ClipboardList className="text-emerald-500" /> Absensi Santri
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Pencatatan dan pemantauan kehadiran santri di berbagai kegiatan.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
          {tabs.find(t => t.id === activeTab)?.icon}
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Absensi {tabs.find(t => t.id === activeTab)?.label}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Modul absensi untuk kegiatan ini sedang dalam tahap pengembangan. Nantinya Anda dapat mencatat kehadiran, izin, sakit, dan alpa santri di halaman ini.
        </p>
      </div>
    </div>
  );
}
