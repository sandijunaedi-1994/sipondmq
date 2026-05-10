"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useChild } from "../../context/ChildContext";

// Data template statis 7 tahapan sebagai basis
const defaultStages = [
  { id: 1, name: "Tahsin Tajwid",           desc: "Perbaikan makharijul huruf, sifat huruf, dan hukum tajwid dasar."      },
  { id: 2, name: "Khotmul Qur'an",          desc: "Membaca Al-Qur'an 30 juz secara keseluruhan dengan tartil."              },
  { id: 3, name: "Talqin",                  desc: "Mendengar dan menirukan bacaan langsung dari guru (musyafahah)."         },
  { id: 4, name: "Dauroh Metode Menghafal", desc: "Pelatihan metode menghafal yang efektif dan sistematis."                },
  { id: 5, name: "Itqon",                   desc: "Memperkuat dan memperlancar hafalan agar benar-benar mutqin."           },
  { id: 6, name: "Tasmi' Jalsah Wahidah",   desc: "Setoran hafalan 30 juz dalam satu majelis (jalsah wahidah)."           },
  { id: 7, name: "Setoran",                 desc: "Setoran akhir kepada syaikh / dewan penguji sebagai penilaian akhir." },
];

const fmt = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" }) : "—";

export default function TahfidzPage() {
  const { selectedSantri, loading: childLoading } = useChild();
  const [selected, setSelected] = useState(null);
  
  const [academicData, setAcademicData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childLoading) {
      if (selectedSantri) {
        fetchTahfidzData();
      } else {
        setAcademicData(null);
        setLoading(false);
      }
    }
  }, [selectedSantri, childLoading]);

  const fetchTahfidzData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/academic/${selectedSantri.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAcademicData(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data tahfidz:", error);
    } finally {
      setLoading(false);
    }
  };

  if (childLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4 py-8 space-y-6">
          <div className="bg-slate-200 h-32 rounded-2xl animate-pulse"></div>
          <div className="bg-slate-200 h-64 rounded-2xl animate-pulse"></div>
        </main>
      </div>
    );
  }

  // ─── Data Mapping ──────────────────────────────────────────
  
  // 1. Pipeline 7 Tahapan
  const rawStages = academicData?.tahfidz || [];
  const stages = defaultStages.map(ds => {
    const found = rawStages.find(r => r.tahapan?.urutan === ds.id);
    return {
      id: ds.id,
      name: found ? found.tahapan.nama : ds.name,
      desc: found?.tahapan.deskripsi || ds.desc,
      done: found?.status === "SELESAI",
      targetDate: found?.targetTanggal,
      completedDate: found?.selesaiTanggal
    };
  });
  
  const currentIdx = Math.max(0, stages.findIndex(s => !s.done));

  // 2. Hafalan Harian
  const riwayatHarian = academicData?.tahfidzHarian || [];
  const todayHafalan = riwayatHarian.length > 0 ? riwayatHarian[0] : null;
  
  const hafalanHarian = {
    targetHalaman: todayHafalan ? todayHafalan.targetHal : 5,
    capaianHari: todayHafalan ? todayHafalan.capaianHal : 0,
    totalHafalan: todayHafalan && todayHafalan.totalJuz ? Number(todayHafalan.totalJuz) : 0,
    targetTotal: 30,
    riwayat: riwayatHarian.map(r => ({
      tanggal: r.tanggal,
      capaian: r.capaianHal,
      target: r.targetHal,
      ket: r.keterangan || "Tidak ada keterangan"
    }))
  };

  const pctHarian  = hafalanHarian.targetHalaman > 0 ? Math.round((hafalanHarian.capaianHari / hafalanHarian.targetHalaman) * 100) : 0;
  const pctTotal   = Math.round((hafalanHarian.totalHafalan / hafalanHarian.targetTotal) * 100);

  // 3. Catatan
  const catatan = academicData?.tahfidzCatatan || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 py-8 space-y-6">

        {/* Jika Calon Wali, berikan badge preview */}
        {!selectedSantri && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-xl">
            <p className="text-sm text-yellow-800 font-medium">Ini adalah pratinjau halaman Tahfidz. Anda belum memiliki data anak aktif.</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-emerald-600 rounded-2xl px-6 py-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h1 className="text-xl font-bold">Capaian Tahfidz</h1>
              <p className="text-white/60 text-xs mt-0.5">Program 7 Tahapan Menghafal Al-Qur'an</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{hafalanHarian.totalHafalan}<span className="text-lg text-white/60"> juz</span></p>
              <p className="text-white/60 text-xs">dari {hafalanHarian.targetTotal} juz</p>
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: `${pctTotal}%` }} />
            </div>
            <p className="text-white/60 text-xs mt-1">{pctTotal}% total hafalan tercapai</p>
          </div>
        </div>

        {/* Pipeline 7 Tahapan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-text-primary mb-5 border-b pb-3">Pipeline 7 Tahapan</h2>
          <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {stages.map((stage, idx) => {
              const isCurrent = idx === currentIdx;
              const isDone    = stage.done;
              return (
                <div key={stage.id}
                  className="flex-1 flex flex-col items-center relative min-w-[80px] cursor-pointer"
                  onClick={() => setSelected(selected?.id === stage.id ? null : stage)}>
                  {idx < stages.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${isDone ? "bg-primary" : "bg-slate-200"}`} />
                  )}
                  <div className={`z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm transition
                    ${isDone ? "bg-primary text-white" : isCurrent ? "bg-orange-400 text-white ring-2 ring-orange-300 ring-offset-1" : "bg-slate-100 text-slate-400"}`}>
                    {isDone ? "✓" : stage.id}
                  </div>
                  <p className={`mt-2 text-center text-[10px] px-1 leading-tight font-medium
                    ${isCurrent ? "text-orange-500 font-bold" : isDone ? "text-primary" : "text-slate-400"}`}>
                    {stage.name}
                  </p>
                  <p className="text-[9px] text-slate-400 text-center mt-0.5">{fmt(stage.targetDate)}</p>
                </div>
              );
            })}
          </div>

          {selected && (
            <div className={`rounded-xl border p-4 ${selected.done ? "bg-emerald-50 border-emerald-200" : selected.id === stages[currentIdx]?.id ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200"} animate-in fade-in zoom-in-95 duration-200`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500">Tahap {selected.id}</span>
                    {selected.done && <span className="text-xs text-emerald-600 font-semibold">✓ Selesai</span>}
                  </div>
                  <h3 className="font-bold text-text-primary">{selected.name}</h3>
                  <p className="text-xs text-text-secondary mt-1">{selected.desc}</p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span><span className="text-slate-400">Target: </span><strong>{fmt(selected.targetDate)}</strong></span>
                    {selected.done && <span><span className="text-slate-400">Selesai: </span><strong className="text-emerald-600">{fmt(selected.completedDate)}</strong></span>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl ml-3">×</button>
              </div>
            </div>
          )}
        </div>

        {/* Hafalan Harian */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-text-primary mb-4 border-b pb-3">Capaian Hafalan Harian</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Hari Ini</p>
              <p className="text-3xl font-bold text-primary">{hafalanHarian.capaianHari}</p>
              <p className="text-xs text-slate-400">dari {hafalanHarian.targetHalaman} halaman</p>
              <div className="w-full bg-primary/10 rounded-full h-1.5 mt-2">
                <div className={`h-1.5 rounded-full ${pctHarian>=100?"bg-primary":pctHarian>=60?"bg-orange-400":"bg-red-400"}`}
                  style={{width:`${Math.min(pctHarian,100)}%`}}/>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Total Hafalan</p>
              <p className="text-3xl font-bold text-text-primary">{hafalanHarian.totalHafalan}</p>
              <p className="text-xs text-slate-400">dari {hafalanHarian.targetTotal} juz</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div className="bg-primary h-1.5 rounded-full" style={{width:`${pctTotal}%`}}/>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-text-primary mb-2">Riwayat 5 Hari Terakhir</h3>
          {hafalanHarian.riwayat.length > 0 ? (
            <div className="space-y-2">
              {hafalanHarian.riwayat.map((r, i) => {
                const pct = Math.round((r.capaian / r.target) * 100);
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="flex-shrink-0 w-14 text-center">
                      <p className="text-xs font-bold text-text-primary">{new Date(r.tanggal).toLocaleDateString("id-ID",{day:"numeric",month:"short"})}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 truncate">{r.ket}</span>
                        <span className={`font-bold ml-2 ${pct>=100?"text-primary":pct>=60?"text-orange-500":"text-red-500"}`}>{r.capaian}/{r.target}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${pct>=100?"bg-primary":pct>=60?"bg-orange-400":"bg-red-400"}`}
                          style={{width:`${Math.min(pct,100)}%`}}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
              Belum ada riwayat hafalan harian.
            </div>
          )}
        </div>

        {/* Catatan Pengampu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-text-primary mb-4 border-b pb-3">Catatan dari Pengampu</h2>
          {catatan.length > 0 ? (
            <div className="space-y-3">
              {catatan.map(c => (
                <div key={c.id} className={`rounded-xl border p-4 ${c.jenis==="APRESIASI"?"bg-emerald-50 border-emerald-200":c.jenis==="PERBAIKAN"?"bg-amber-50 border-amber-200":"bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.jenis==="APRESIASI"?"bg-emerald-100 text-emerald-700":c.jenis==="PERBAIKAN"?"bg-amber-100 text-amber-700":"bg-slate-200 text-slate-700"}`}>
                      {c.jenis==="APRESIASI"?"✨ Apresiasi":c.jenis==="PERBAIKAN"?"📌 Perbaikan":"📝 Umum"}
                    </span>
                    <span className="text-xs text-slate-400">{fmt(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed">{c.catatan}</p>
                  <p className="text-xs text-slate-400 mt-2">— {c.namaPengampu || "Pengampu"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              Belum ada catatan dari pengampu.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
