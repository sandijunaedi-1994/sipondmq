"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useChild } from "../../context/ChildContext";

// ─── Format helpers ───────────────────────────────────────────────────────────
const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ─── Attendance color map ─────────────────────────────────────────────────────
const colorMap = {
  KBM:        { ring: "ring-blue-500",    bar: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-50"    },
  SHALAT:     { ring: "ring-purple-500",  bar: "bg-purple-500",  text: "text-purple-600",  bg: "bg-purple-50"  },
  HALAQOH:    { ring: "ring-emerald-500", bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" },
  AMAL_JAMAI: { ring: "ring-orange-400",  bar: "bg-orange-400",  text: "text-orange-500",  bg: "bg-orange-50"  },
  DEFAULT:    { ring: "ring-slate-400",   bar: "bg-slate-400",   text: "text-slate-500",   bg: "bg-slate-50"   },
};

// ─── Reusable card wrapper ─────────────────────────────────────────────────────
function ClickCard({ onClick, children, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer group ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Section heading inside a card ────────────────────────────────────────────
function CardHeader({ title, subtitle, arrowColor = "text-primary" }) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="font-bold text-text-primary text-base">{title}</h2>
        {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mt-0.5 ${arrowColor} opacity-0 group-hover:opacity-100 transition-opacity`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

// ─── Info badge ───────────────────────────────────────────────────────────────
function InfoBadge({ icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-white/50">{icon}</span>
      <span className="text-white/60 text-xs">{label}:</span>
      <span className="text-white text-xs font-semibold">{value || "—"}</span>
    </div>
  );
}

// ─── Icon komponen ────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BerandaPage() {
  const router = useRouter();
  const { selectedSantri, loading: childLoading } = useChild();

  const [financeData, setFinanceData] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (!selectedSantri) {
      setFinanceData(null);
      setAcademicData(null);
      setDataLoading(false);
      return;
    }

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const headers = { Authorization: `Bearer ${token}` };

        const [resFinance, resAcademic] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/finance/${selectedSantri.id}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/academic/${selectedSantri.id}`, { headers })
        ]);

        if (resFinance.ok) setFinanceData(await resFinance.json());
        if (resAcademic.ok) setAcademicData(await resAcademic.json());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [selectedSantri]);

  if (childLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-5xl mx-auto p-4 py-8 space-y-5">
          <div className="bg-slate-200 h-32 rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-200 h-32 rounded-2xl animate-pulse"></div>
            <div className="bg-slate-200 h-32 rounded-2xl animate-pulse"></div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Data Mapping ──────────────────────────────────────────
  // Gunakan fallback object kosong jika tidak ada santri (Calon Wali)
  const activeSantri = selectedSantri || {};
  
  // Finance
  const tagihanAktif = financeData?.tagihan?.filter(t => t.status !== "LUNAS") || [];
  const totalTagihan = tagihanAktif.reduce((acc, curr) => acc + Number(curr.nominal), 0);
  const saldoUangSaku = financeData?.uangSaku?.saldo || 0;

  // Tahfidz
  const rawStages = academicData?.tahfidz || [];
  // Ensure 7 stages even if missing from DB
  const defaultStages = [
    { urutan: 1, name: "Tahsin Tajwid" },
    { urutan: 2, name: "Khotmul Qur'an" },
    { urutan: 3, name: "Talqin" },
    { urutan: 4, name: "Dauroh Metode Menghafal" },
    { urutan: 5, name: "Itqon" },
    { urutan: 6, name: "Tasmi' Jalsah Wahidah" },
    { urutan: 7, name: "Setoran" },
  ];
  const stages = defaultStages.map(ds => {
    const found = rawStages.find(r => r.tahapan?.urutan === ds.urutan);
    return {
      id: ds.urutan,
      name: found ? found.tahapan.nama : ds.name,
      done: found?.status === "SELESAI",
      targetDate: found?.targetTanggal
    };
  });
  
  const currentStageIdx = Math.max(0, stages.findIndex((s) => !s.done));
  
  // We don't have hafalanHarian fetched yet in the API, mock it for now or fallback to 0
  const hafalanHarianTarget = 5;
  const hafalanHarianCapaian = 0; 
  const hafalanPct = Math.round((hafalanHarianCapaian / hafalanHarianTarget) * 100);

  // Kehadiran Processing
  const rawKehadiran = academicData?.kehadiran || [];
  const groupedKehadiran = rawKehadiran.reduce((acc, curr) => {
    const kode = curr.kategori?.kode || 'DEFAULT';
    if (!acc[kode]) acc[kode] = { name: curr.kategori?.nama, hadir: 0, total: 0, color: colorMap[kode] || colorMap.DEFAULT };
    acc[kode].total += 1;
    if (curr.status === 'HADIR') acc[kode].hadir += 1;
    return acc;
  }, {});
  // Fallback to empty if no data in last 30 days
  const kehadiranList = Object.values(groupedKehadiran);

  // Pelanggaran & Prestasi
  const pelanggaranList = academicData?.pelanggaran || [];
  const totalPoinPelanggaran = pelanggaranList.reduce((acc, curr) => acc + Number(curr.poin), 0);

  const prestasiList = academicData?.prestasi || [];
  const totalPoinPrestasi = prestasiList.reduce((acc, curr) => acc + Number(curr.poin), 0);

  // Matan
  const matanList = academicData?.matan || [];
  const matanSelesai = matanList.filter(m => m.status === 'SELESAI').length;
  const matanTotal = Math.max(matanList.length, 4); // assume at least 4 main matan
  const matanItems = matanList.slice(0, 4).map(m => ({
    name: m.matan?.judul || "Matan",
    done: m.status === 'SELESAI'
  }));

  const masked = "Rp ••••••";
  const initials = activeSantri.nama
    ? activeSantri.nama.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto p-4 py-8 space-y-5">
        {/* ── Greeting banner ── */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl px-6 py-5 text-white shadow-lg relative overflow-hidden">
          {!selectedSantri && (
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
              MODE PREVIEW CALON WALI
            </div>
          )}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm mb-0.5">
                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h1 className="text-2xl font-bold tracking-tight truncate">
                {activeSantri.nama || "Santri Fulan"}
              </h1>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                <InfoBadge icon="🏫" label="Markaz" value={activeSantri.markaz || "—"} />
                <InfoBadge icon="📚" label="Kelas"  value={activeSantri.kelas || "—"}  />
                <InfoBadge icon="🏠" label="Asrama" value={activeSantri.asrama || "—"} />
              </div>
            </div>

            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
          </div>
        </div>

        {/* ── Row 1: Tagihan + Uang Saku ── */}
        <div className="grid grid-cols-2 gap-4">
          <ClickCard onClick={() => router.push("/keuangan?tab=tagihan")} className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-bold text-text-primary text-base">Total Tagihan</h2>
                <p className="text-xs text-text-secondary mt-0.5">{tagihanAktif.length} tagihan aktif</p>
              </div>
              <button
                id="toggle-balance-btn"
                onClick={(e) => { e.stopPropagation(); setShowBalance((v) => !v); }}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 transition"
              >
                <EyeIcon open={showBalance} />
              </button>
            </div>
            <p className={`text-2xl font-bold text-error transition-all ${!showBalance ? "blur-sm select-none" : ""}`}>
              {showBalance ? formatRupiah(totalTagihan) : masked}
            </p>
            <p className="text-xs text-text-secondary mt-1">Belum Lunas</p>
          </ClickCard>

          <ClickCard onClick={() => router.push("/keuangan?tab=uang-saku")} className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-bold text-text-primary text-base">Uang Saku</h2>
                <p className="text-xs text-text-secondary mt-0.5">Saldo aktif</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowBalance((v) => !v); }}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 transition"
              >
                <EyeIcon open={showBalance} />
              </button>
            </div>
            <p className={`text-2xl font-bold text-primary transition-all ${!showBalance ? "blur-sm select-none" : ""}`}>
              {showBalance ? formatRupiah(saldoUangSaku) : masked}
            </p>
            <p className="text-xs text-text-secondary mt-1">Saldo tersedia</p>
          </ClickCard>
        </div>

        {/* ── Capaian Tahfidz ── */}
        <ClickCard onClick={() => router.push("/tahfidz")} className="p-5">
          <CardHeader title="Capaian Tahfidz" subtitle="7 tahapan program menghafal Al-Qur'an" />

          <div className="flex items-start gap-0 overflow-x-auto pb-2 mb-5">
            {stages.map((stage, idx) => {
              const isCurrent = idx === currentStageIdx;
              const isDone    = stage.done;
              return (
                <div key={stage.id} className="flex-1 flex flex-col items-center relative min-w-[80px]">
                  {idx < stages.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${isDone ? "bg-primary" : "bg-slate-200"}`} />
                  )}
                  <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-surface shadow-sm
                    ${isDone ? "bg-primary text-white" : isCurrent ? "bg-orange-400 text-white ring-2 ring-orange-300 ring-offset-1" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                    {isDone ? "✓" : stage.id}
                  </div>
                  <p className={`mt-2 text-center leading-tight px-1
                    ${isCurrent ? "font-bold text-orange-500" : isDone ? "font-semibold text-primary" : "text-text-secondary"}
                    text-[10px] md:text-xs`}>
                    {stage.name}
                  </p>
                  <p className="text-[9px] text-slate-400 text-center mt-0.5">{formatDate(stage.targetDate)}</p>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-text-primary">Hafalan Harian (Mock)</p>
              <span className="text-xs font-bold text-primary">{hafalanHarianCapaian} / {hafalanHarianTarget} hal</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-primary to-emerald-400 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${hafalanPct}%` }}
              />
            </div>
          </div>
        </ClickCard>

        {/* ── Kehadiran 2x2 ── */}
        <div>
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wide mb-3">Kehadiran (30 Hari Terakhir)</h2>
          {kehadiranList.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {kehadiranList.map((k) => {
                const pct = Math.round((k.hadir / k.total) * 100);
                const c   = k.color;
                return (
                  <ClickCard key={k.name} onClick={() => router.push(`/kehadiran`)} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <p className={`text-sm font-bold ${c.text}`}>{k.name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                      <div className={`${c.bar} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-text-secondary">{k.hadir} hadir dari {k.total} pertemuan</p>
                  </ClickCard>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-surface rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              Belum ada data kehadiran bulan ini
            </div>
          )}
        </div>

        {/* ── Row: Poin Pelanggaran + Poin Prestasi ── */}
        <div className="grid grid-cols-2 gap-4">
          <ClickCard onClick={() => router.push("/pelanggaran")} className="p-5">
            <CardHeader title="Poin Pelanggaran" subtitle={`${pelanggaranList.length} kasus tercatat`} arrowColor="text-error" />
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-error">{totalPoinPelanggaran}</p>
              <p className="text-sm text-text-secondary mb-1">poin</p>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className={`h-2 rounded-full ${totalPoinPelanggaran < 30 ? "bg-primary" : totalPoinPelanggaran < 70 ? "bg-orange-400" : "bg-error"}`}
                style={{ width: `${Math.min(totalPoinPelanggaran, 100)}%` }} />
              <span className="text-[10px] text-text-secondary">/ 100</span>
            </div>
          </ClickCard>

          <ClickCard onClick={() => router.push("/prestasi")} className="p-5">
            <CardHeader title="Poin Prestasi" subtitle={`${prestasiList.length} prestasi`} />
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-primary">{totalPoinPrestasi}</p>
              <p className="text-sm text-text-secondary mb-1">poin</p>
            </div>
            <div className="mt-3 flex gap-1 flex-wrap">
              {Array.from({ length: Math.min(prestasiList.length, 5) }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-sm">★</span>
              ))}
            </div>
          </ClickCard>
        </div>

        {/* ── Hafalan Matan ── */}
        <ClickCard onClick={() => router.push("/hafalan-matan")} className="p-5">
          <CardHeader
            title="Hafalan Matan"
            subtitle={`${matanSelesai} dari ${matanTotal} matan selesai`}
          />

          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-primary to-emerald-400 h-2 rounded-full"
              style={{ width: `${(matanSelesai / matanTotal) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {matanItems.length > 0 ? matanItems.map((m, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm
                ${m.done ? "bg-primary/5 border-primary/20 text-primary-dark font-semibold" : "bg-slate-50 border-slate-200 text-text-secondary"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                  ${m.done ? "bg-primary text-white" : "bg-slate-200 text-slate-400"}`}>
                  {m.done ? "✓" : "○"}
                </span>
                <span className="leading-tight truncate">{m.name}</span>
              </div>
            )) : (
              <div className="col-span-2 text-center text-xs text-slate-400 py-2">Belum ada data hafalan matan</div>
            )}
          </div>
        </ClickCard>
      </main>
    </div>
  );
}
