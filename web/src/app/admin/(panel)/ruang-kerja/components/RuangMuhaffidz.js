"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Users, Search, ClipboardCheck, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function RuangMuhaffidz() {
  const [halaqohList, setHalaqohList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMyHalaqoh();
  }, []);

  const fetchMyHalaqoh = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${url}/api/admin/halaqoh/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHalaqohList(data.halaqoh || []);
      } else {
        setError(data.message || "Gagal mengambil data halaqoh");
      }
    } catch (err) {
      setError("Kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const allSantri = halaqohList.flatMap(h => h.santri.map(s => ({ ...s, halaqohNama: h.nama })));
  const filteredSantri = allSantri.filter(s => {
    const nama = (s.registration?.studentName || "").toLowerCase();
    const query = search.toLowerCase();
    return nama.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <BookOpen className="text-teal-500" /> Ruang Muhaffidz
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Pantau dan kelola hafalan harian santri halaqoh Anda.
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari santri..."
            className="pl-9 pr-4 py-2 w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-10 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-500 font-medium bg-white dark:bg-slate-900 rounded-2xl">{error}</div>
      ) : halaqohList.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl flex flex-col items-center">
          <BookOpen className="text-slate-400 mb-3" size={32} />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Anda belum ditugaskan sebagai Muhaffidz di halaqoh manapun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Card untuk setiap Halaqoh */}
          {halaqohList.map((halaqoh) => (
            <div key={halaqoh.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{halaqoh.nama}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{halaqoh.santri.length} Santri</p>
                  </div>
                </div>
                {/* 
                <button className="flex items-center gap-2 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                  <ClipboardCheck size={14} /> Absensi Halaqoh
                </button>
                */}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50/50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Nama Santri</th>
                      <th className="px-6 py-3">NIS</th>
                      <th className="px-6 py-3">Program</th>
                      <th className="px-6 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {halaqoh.santri.filter(s => (s.registration?.studentName || "").toLowerCase().includes(search.toLowerCase())).map((santri) => (
                      <tr key={santri.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-800 dark:text-white">{santri.registration?.studentName}</td>
                        <td className="px-6 py-3 font-mono text-xs">{santri.nis || "-"}</td>
                        <td className="px-6 py-3">{santri.registration?.program}</td>
                        <td className="px-6 py-3 text-center">
                          <Link 
                            href={`/admin/santri/data/${santri.id}`}
                            className="inline-flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors"
                            title="Input Hafalan"
                          >
                            <Eye size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {halaqoh.santri.filter(s => (s.registration?.studentName || "").toLowerCase().includes(search.toLowerCase())).length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center p-6 text-slate-500 text-xs">Tidak ada santri yang cocok.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
