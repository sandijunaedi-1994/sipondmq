"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useChild } from "../../context/ChildContext";

const colorMap = {
  KBM:        { ring: "ring-blue-500",    bar: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-50"    },
  SHALAT:     { ring: "ring-purple-500",  bar: "bg-purple-500",  text: "text-purple-600",  bg: "bg-purple-50"  },
  HALAQOH:    { ring: "ring-emerald-500", bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" },
  AMAL_JAMAI: { ring: "ring-orange-400",  bar: "bg-orange-400",  text: "text-orange-500",  bg: "bg-orange-50"  },
  DEFAULT:    { ring: "ring-slate-400",   bar: "bg-slate-400",   text: "text-slate-500",   bg: "bg-slate-50"   },
};

const mockKehadiran = [
  { status: "HADIR", tanggal: new Date().toISOString(), kategori: { kode: "KBM", nama: "Kegiatan Belajar" } },
  { status: "IZIN", tanggal: new Date().toISOString(), kategori: { kode: "KBM", nama: "Kegiatan Belajar" }, keterangan: "Sakit demam" },
];

export default function KehadiranPage() {
  const { selectedSantri, loading: childLoading } = useChild();
  const [kehadiran, setKehadiran] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childLoading) {
      if (selectedSantri) {
        fetchAcademic();
      } else {
        setKehadiran([]);
        setLoading(false);
      }
    }
  }, [selectedSantri, childLoading]);

  const fetchAcademic = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/academic/${selectedSantri.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKehadiran(data.kehadiran || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data kehadiran:", error);
    } finally {
      setLoading(false);
    }
  };

  if (childLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-3xl mx-auto p-4 py-8 space-y-6">
          <div className="bg-slate-200 h-32 rounded-2xl animate-pulse"></div>
          <div className="bg-slate-200 h-64 rounded-2xl animate-pulse"></div>
        </main>
      </div>
    );
  }

  const rawKehadiran = selectedSantri ? kehadiran : mockKehadiran;

  const groupedKehadiran = rawKehadiran.reduce((acc, curr) => {
    const kode = curr.kategori?.kode || 'DEFAULT';
    if (!acc[kode]) acc[kode] = { name: curr.kategori?.nama || kode, hadir: 0, total: 0, color: colorMap[kode] || colorMap.DEFAULT, logs: [] };
    acc[kode].total += 1;
    if (curr.status === 'HADIR') acc[kode].hadir += 1;
    acc[kode].logs.push(curr);
    return acc;
  }, {});
  
  const kehadiranList = Object.values(groupedKehadiran);

  // Get all non-HADIR events for history
  const historyLogs = rawKehadiran
    .filter(k => k.status !== 'HADIR' || k.keterangan)
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 py-8 space-y-6">

        {!selectedSantri && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-xl">
            <p className="text-sm text-yellow-800 font-medium">Ini adalah pratinjau halaman Kehadiran. Anda belum memiliki data anak aktif.</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl px-6 py-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h1 className="text-xl font-bold">Kehadiran Santri</h1>
              <p className="text-white/60 text-xs mt-0.5">Ringkasan 30 hari terakhir</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Kehadiran Summary Boxes */}
        {kehadiranList.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {kehadiranList.map((k) => {
              const pct = Math.round((k.hadir / k.total) * 100);
              const c   = k.color;
              return (
                <div key={k.name} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <p className={`text-sm font-bold ${c.text}`}>{k.name}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                    <div className={`${c.bar} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-text-secondary">{k.hadir} hadir dari {k.total} sesi</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-slate-400 text-sm">Belum ada data kehadiran bulan ini.</p>
          </div>
        )}

        {/* History (Izin, Sakit, Alfa) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-text-primary mb-4 border-b pb-3">Riwayat Ketidakhadiran</h2>
          {historyLogs.length > 0 ? (
            <div className="space-y-3">
              {historyLogs.map((log, idx) => (
                <div key={idx} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex flex-col items-center justify-center w-12 flex-shrink-0 border-r pr-3 border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.tanggal).toLocaleDateString('id-ID', { month: 'short' })}</span>
                    <span className="text-lg font-bold text-text-primary leading-none">{new Date(log.tanggal).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-text-primary">{log.kategori?.nama || "Kegiatan"}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full 
                        ${log.status === 'IZIN' ? 'bg-blue-100 text-blue-700' : 
                          log.status === 'SAKIT' ? 'bg-yellow-100 text-yellow-700' : 
                          log.status === 'ALFA' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {log.status}
                      </span>
                    </div>
                    {log.sesi && <p className="text-[10px] text-slate-400 mb-0.5">Sesi: {log.sesi}</p>}
                    <p className="text-xs text-text-secondary truncate">{log.keterangan || "Tidak ada keterangan"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-2xl mb-1 block">🌟</span>
              <p className="text-sm font-bold">Alhamdulillah!</p>
              <p className="text-xs text-emerald-600/70">Tidak ada catatan ketidakhadiran dalam 30 hari terakhir.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
