"use strict";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, BookOpen, MapPin, BadgeInfo, Eye } from "lucide-react";

export default function RuangWaliKelas() {
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSantri();
  }, []);

  const fetchSantri = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${url}/api/admin/santri/wali-kelas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSantriList(data.santri || []);
      } else {
        setError(data.message || "Gagal mengambil data santri.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi jaringan.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSantri = santriList.filter((santri) => {
    const nama = (santri.registration?.studentName || "").toLowerCase();
    const nis = (santri.nis || "").toLowerCase();
    const query = search.toLowerCase();
    return nama.includes(query) || nis.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <Users className="text-teal-500" /> Daftar Santri Perwalian
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Sebagai Wali Kelas, Anda dapat memantau daftar santri di bawah bimbingan Anda.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama / NIS..."
                className="pl-9 pr-4 py-2 w-full md:w-64 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : filteredSantri.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex justify-center items-center mb-3">
              <Users className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada data santri perwalian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">NIS / Nama Santri</th>
                  <th className="px-6 py-4">Program / Gender</th>
                  <th className="px-6 py-4">Kelas & Asrama</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSantri.map((santri, index) => (
                  <tr key={santri.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-white text-[13px] uppercase">
                        {santri.registration?.studentName || "-"}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {santri.nis || "Belum ada NIS"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <BookOpen size={14} className="text-slate-400" />
                        {santri.registration?.program || "-"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {santri.registration?.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <BadgeInfo size={14} className="text-teal-500" />
                        {santri.kelasRef?.nama || santri.kelas || "-"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                        <MapPin size={12} /> {santri.asramaRef?.nama || santri.asrama || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        {santri.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/admin/santri/data/${santri.id}`}
                        className="inline-flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
