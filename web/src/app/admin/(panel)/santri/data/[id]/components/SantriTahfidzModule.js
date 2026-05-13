"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle, Clock, Award, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function SantriTahfidzModule({ santriId }) {
  const [activeTab, setActiveTab] = useState("tahapan"); // tahapan, hafalan, sertifikat
  
  // Data States
  const [tahapan, setTahapan] = useState([]);
  const [hafalan, setHafalan] = useState([]);
  const [sertifikat, setSertifikat] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (santriId) {
      fetchTahapan();
      fetchHafalan();
      fetchSertifikat();
    }
  }, [santriId]);

  const fetchTahapan = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${apiUrl}/api/admin/tahfidz/${santriId}/tahapan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTahapan(data.tahapan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHafalan = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${apiUrl}/api/admin/tahfidz/${santriId}/hafalan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHafalan(data.hafalan);
      }
    } catch (err) {}
  };

  const fetchSertifikat = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${apiUrl}/api/admin/tahfidz/${santriId}/sertifikat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSertifikat(data.sertifikat);
      }
    } catch (err) {}
  };

  const updateTahapanStatus = async (tahapanId, status) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${apiUrl}/api/admin/tahfidz/${santriId}/tahapan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tahapanId,
          status,
          selesaiTanggal: status === 'SELESAI' ? new Date().toISOString() : null
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Status tahapan diperbarui");
        fetchTahapan();
      }
    } catch (err) {
      toast.error("Gagal update status");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="text-teal-500" size={18} />
          Modul Tahfidz Qur'an
        </h3>
        <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
          <button 
            onClick={() => setActiveTab("tahapan")}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'tahapan' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Tahapan
          </button>
          <button 
            onClick={() => setActiveTab("hafalan")}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'hafalan' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Hafalan Harian
          </button>
          <button 
            onClick={() => setActiveTab("sertifikat")}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'sertifikat' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Sertifikat
          </button>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="text-center p-8 text-slate-500 text-sm">Memuat data tahfidz...</div>
        ) : (
          <>
            {activeTab === "tahapan" && (
              <div className="space-y-4">
                {tahapan.map((t, index) => (
                  <div key={t.id} className="relative flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      t.capaian?.status === 'SELESAI' 
                        ? 'bg-teal-500 text-white' 
                        : t.capaian?.status === 'PROSES'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{t.nama}</h4>
                        <div className="flex gap-2">
                          <select 
                            value={t.capaian?.status || 'BELUM'} 
                            onChange={(e) => updateTahapanStatus(t.id, e.target.value)}
                            className={`text-[10px] font-bold rounded px-2 py-1 uppercase tracking-wider outline-none border-none ${
                              t.capaian?.status === 'SELESAI' ? 'bg-teal-100 text-teal-700' : 
                              t.capaian?.status === 'PROSES' ? 'bg-amber-100 text-amber-700' : 
                              'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <option value="BELUM">Belum</option>
                            <option value="PROSES">Proses</option>
                            <option value="SELESAI">Selesai</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.deskripsi}</p>
                      {t.capaian?.targetTanggal && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">
                          Target: {new Date(t.capaian.targetTanggal).toLocaleDateString('id-ID')}
                        </p>
                      )}
                      {t.capaian?.selesaiTanggal && (
                        <p className="text-[10px] text-teal-600 dark:text-teal-500 font-medium mt-0.5">
                          Selesai: {new Date(t.capaian.selesaiTanggal).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "hafalan" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Target (Hal)</th>
                      <th className="px-4 py-3">Capaian (Hal)</th>
                      <th className="px-4 py-3">Total Juz</th>
                      <th className="px-4 py-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {hafalan.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-xs text-slate-500">Belum ada riwayat hafalan harian.</td>
                      </tr>
                    ) : (
                      hafalan.map(h => (
                        <tr key={h.id}>
                          <td className="px-4 py-3 font-medium">{new Date(h.tanggal).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-3">{h.targetHal}</td>
                          <td className="px-4 py-3 font-bold text-teal-600 dark:text-teal-400">{h.capaianHal}</td>
                          <td className="px-4 py-3">{h.totalJuz || "-"}</td>
                          <td className="px-4 py-3 text-xs">{h.keterangan || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "sertifikat" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sertifikat.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      Belum ada sertifikat tahfidz yang diunggah.
                    </div>
                  ) : (
                    sertifikat.map(s => (
                      <a key={s.id} href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all group bg-slate-50 dark:bg-slate-900/50">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <Award size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                            {s.judul}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">{s.penerbit} • {new Date(s.tanggal).toLocaleDateString('id-ID')}</p>
                          {s.tahfidzCapaian?.tahapan && (
                            <span className="inline-block mt-2 px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-[9px] font-bold uppercase">
                              {s.tahfidzCapaian.tahapan.nama}
                            </span>
                          )}
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
