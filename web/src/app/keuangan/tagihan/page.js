"use client";

import { useState, useEffect } from "react";
import { useChild } from "@/context/ChildContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const BULAN = ["Juli","Agustus","September","Oktober","November","Desember",
               "Januari","Februari","Maret","April","Mei","Juni"];

// Helper to generate 12 months template
function buildSPPTemplate(startYear = 2024, tarifPerBulan = 750000) {
  return BULAN.map((bln, idx) => {
    const tahun = idx < 6 ? startYear : startYear + 1;
    const bulanNum = idx < 6 ? idx + 7 : idx - 5;
    const dueDate = new Date(tahun, bulanNum - 1, 15);
    return { 
      id: `template-${idx}`, 
      bulan: bln, 
      tahun, 
      bulanNum, 
      jatuhTempo: dueDate, 
      status: "BELUM", 
      nominal: tarifPerBulan,
      isTemplate: true
    };
  });
}

// ─── Reusable components ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return status === "LUNAS"
    ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">LUNAS</span>
    : <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">BELUM BAYAR</span>;
}

function SummaryBar({ data }) {
  const totalBelum = data.filter(d => d.status !== "LUNAS").reduce((s, d) => s + Number(d.nominal), 0);
  const totalLunas = data.filter(d => d.status === "LUNAS").reduce((s, d) => s + Number(d.nominal), 0);
  const total = totalBelum + totalLunas;
  const pct = total > 0 ? Math.round((totalLunas / total) * 100) : 0;
  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="bg-red-50 border border-red-100 rounded-xl p-3">
        <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wide mb-0.5">Belum Lunas</p>
        <p className="font-bold text-red-600 text-base">{fmtRp(totalBelum)}</p>
      </div>
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
        <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide mb-0.5">Lunas</p>
        <p className="font-bold text-emerald-700 text-base">{fmtRp(totalLunas)}</p>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-0.5">Total Progress</p>
        <p className="font-bold text-text-primary text-base">{pct}%</p>
      </div>
    </div>
  );
}

// ─── SPP View — 12 bulan grid ──────────────────────────────────────────────────
function SPPView({ sppData, startYear }) {
  const lunas = sppData.filter(d => d.status === "LUNAS").length;
  const progPct = sppData.length > 0 ? Math.round((lunas / 12) * 100) : 0;
  const thnAjaran = `${startYear}/${startYear+1}`;

  return (
    <div className="space-y-4">
      <SummaryBar data={sppData} />

      {/* Progress bulan */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold text-text-primary">Tahun Ajaran {thnAjaran}</p>
          <span className="text-xs font-bold text-primary">{lunas}/12 bulan</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className="bg-gradient-to-r from-primary to-emerald-400 h-2 rounded-full" style={{ width: `${progPct}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-1">{progPct}% telah dilunasi</p>
      </div>

      {/* 12 bulan grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sppData.map((spp, idx) => {
          const isCurrent = new Date() >= new Date(spp.tahun, spp.bulanNum - 1, 1) &&
                            new Date() <= new Date(spp.tahun, spp.bulanNum - 1, 31);
          return (
            <div key={spp.id}
              className={`rounded-xl border p-3 transition
                ${spp.status === "LUNAS" ? "bg-emerald-50 border-emerald-200" : isCurrent ? "bg-orange-50 border-orange-300" : "bg-white border-slate-200"}`}>
              <div className="flex justify-between items-start mb-1">
                <p className={`text-xs font-bold ${spp.status === "LUNAS" ? "text-emerald-700" : isCurrent ? "text-orange-600" : "text-text-primary"}`}>
                  {spp.bulan}
                </p>
                {spp.status === "LUNAS"
                  ? <span className="text-emerald-500 text-sm">✓</span>
                  : isCurrent
                  ? <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse mt-0.5" />
                  : <span className="w-2 h-2 bg-slate-200 rounded-full mt-0.5" />
                }
              </div>
              <p className={`text-sm font-bold ${spp.status === "LUNAS" ? "text-emerald-700" : "text-text-primary"}`}>
                {fmtRp(spp.nominal)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {spp.status === "LUNAS" ? "Lunas" : `Jatuh tempo: ${new Date(spp.jatuhTempo).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}`}
              </p>
              {spp.status !== "LUNAS" && !spp.isTemplate && (
                <button className="mt-2 w-full py-1.5 bg-primary hover:bg-primary-dark text-white text-[10px] font-bold rounded-lg transition">
                  Bayar
                </button>
              )}
              {spp.isTemplate && (
                <div className="mt-2 w-full py-1.5 text-center text-[10px] text-slate-400 font-medium">
                  Belum Ditagihkan
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Generic list view ──────────────────────────────────────────────────────────
function ListTagihan({ data, emptyMsg = "Tidak ada data" }) {
  return (
    <div className="space-y-3">
      <SummaryBar data={data} />
      {data.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-surface rounded-2xl border border-dashed border-slate-300">
          <p className="text-3xl mb-2">📄</p><p>{emptyMsg}</p>
        </div>
      ) : data.map((item) => (
        <div key={item.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${item.status !== "LUNAS" ? "border-red-200" : "border-slate-200"}`}>
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <p className="font-bold text-text-primary text-sm">{item.keterangan || item.jenis?.nama}</p>
              <p className="text-xs text-slate-400 mt-1">
                {item.status === "LUNAS"
                  ? `Dibayar: ${item.paidAt ? new Date(item.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : '-'}`
                  : `Jatuh tempo: ${new Date(item.jatuhTempo).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${item.status !== "LUNAS" ? "text-red-500" : "text-emerald-600"}`}>
                {fmtRp(item.nominal)}
              </p>
              <StatusBadge status={item.status} />
            </div>
          </div>
          {item.status !== "LUNAS" && (
            <button className="mt-3 w-full py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition shadow-sm shadow-primary/20">
              BAYAR SEKARANG
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Tagihan Page ──────────────────────────────────────────────────────────
const subTabs = [
  { id: "spp",          label: "SPP"                },
  { id: "daftar-ulang", label: "Daftar Ulang Tahunan"},
  { id: "uang-masuk",   label: "Uang Masuk"         },
  { id: "lainnya",      label: "Lainnya"             },
];

export default function TagihanPage() {
  const { selectedSantri, loading: childLoading } = useChild();
  const [tab, setTab] = useState("spp");
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childLoading) {
      if (selectedSantri) {
        fetchTagihan();
      } else {
        setTagihan([]);
        setLoading(false);
      }
    }
  }, [selectedSantri, childLoading]);

  const fetchTagihan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/finance/${selectedSantri.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTagihan(data.tagihan || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data tagihan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (childLoading || loading) {
    return <div className="p-6 text-center text-slate-500 animate-pulse">Memuat data tagihan...</div>;
  }

  // Pengelompokan Data
  // SPP dikelompokkan ke template 12 bulan (Asumsi Tahun Ajaran Aktif 2024 atau 2025)
  // Untuk demo, kita pakai tahun berjalan
  const currentYear = new Date().getFullYear();
  const startYear = new Date().getMonth() >= 6 ? currentYear : currentYear - 1; // Tahun ajaran mulai Juli

  const sppDB = tagihan.filter(t => t.jenis?.nama === "SPP");
  let sppMerged = buildSPPTemplate(startYear, 750000); // base template
  
  if (selectedSantri) {
    // Jika ada santri, timpa template dengan data real dari DB jika jatuh temponya cocok
    sppMerged = sppMerged.map(tmpl => {
      // Cari data SPP di DB dengan bulan dan tahun yang sama
      const found = sppDB.find(db => {
        const dbDate = new Date(db.jatuhTempo);
        return dbDate.getMonth() + 1 === tmpl.bulanNum && dbDate.getFullYear() === tmpl.tahun;
      });
      if (found) {
        return {
          ...tmpl,
          id: found.id,
          status: found.status,
          nominal: found.nominal,
          isTemplate: false
        };
      }
      return tmpl;
    });
  }

  const daftarUlangData = tagihan.filter(t => t.jenis?.nama === "DAFTAR_ULANG");
  const uangMasukData = tagihan.filter(t => t.jenis?.nama === "UANG_MASUK");
  const lainnyaData = tagihan.filter(t => t.jenis?.nama === "LAINNYA" || !["SPP", "DAFTAR_ULANG", "UANG_MASUK"].includes(t.jenis?.nama));

  // Hitung total semua tagihan belum lunas dari tagihan yang benar-benar ada di DB
  const grandBelum = tagihan.filter(d => d.status !== "LUNAS").reduce((s, d) => s + Number(d.nominal), 0);

  return (
    <div className="space-y-5 pb-20">
      {/* Jika Calon Wali, berikan badge preview */}
      {!selectedSantri && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-xl">
          <p className="text-sm text-yellow-800 font-medium">Ini adalah pratinjau halaman Tagihan. Anda belum memiliki data anak aktif.</p>
        </div>
      )}

      {/* Grand summary */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden shadow-sm">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-100 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Total Belum Lunas</p>
          <p className="text-3xl font-extrabold text-red-600 mt-1">{fmtRp(grandBelum)}</p>
        </div>
        <div className="p-3 bg-white/60 border border-red-100 rounded-2xl relative z-10 shadow-sm backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {subTabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border-2 transition-all
              ${tab === t.id
                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                : "bg-surface text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {tab === "spp"          && <SPPView sppData={sppMerged} startYear={startYear} />}
        {tab === "daftar-ulang" && <ListTagihan data={daftarUlangData} emptyMsg="Tidak ada tagihan daftar ulang" />}
        {tab === "uang-masuk"   && <ListTagihan data={uangMasukData}   emptyMsg="Tidak ada tagihan uang masuk" />}
        {tab === "lainnya"      && <ListTagihan data={lainnyaData}      emptyMsg="Tidak ada tagihan lainnya" />}
      </div>
    </div>
  );
}
