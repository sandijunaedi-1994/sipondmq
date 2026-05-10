"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useChild } from "../../context/ChildContext";

// Fallback preview data for Calon Wali
const mockPrestasi = [
  { id: 1, tanggal: new Date().toISOString(), kategori: "AKADEMIK", judul: "Juara 1 Musabaqah Tilawatil Qur'an (MTQ) Tingkat Kecamatan", tingkat: "KECAMATAN", poin: 30 },
  { id: 2, tanggal: new Date().toISOString(), kategori: "TAHFIDZ",  judul: "Khatam Al-Qur'an 30 Juz", tingkat: "INTERNAL", poin: 50 },
];

const mockOrganisasi = [
  { id: 1, jabatan: "Ketua OSIS", organisasi: "OSIS MQ", periode: "2025/2026", isAktif: true },
];

const mockSertifikat = [
  { id: 1, judul: "Sertifikat Khatam Al-Qur'an 30 Juz", penerbit: "Madinatul Qur'an", tanggal: new Date().toISOString(), fileUrl: "#" },
];

const katColor = {
  AKADEMIK:   "bg-blue-50 text-blue-700 border-blue-200",
  TAHFIDZ:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  OLAHRAGA:   "bg-orange-50 text-orange-700 border-orange-200",
  SENI:       "bg-purple-50 text-purple-700 border-purple-200",
  ORGANISASI: "bg-indigo-50 text-indigo-700 border-indigo-200",
  LAINNYA:    "bg-slate-50 text-slate-700 border-slate-200",
};

const tingkatColor = {
  INTERNAL:      "bg-slate-100 text-slate-600",
  KECAMATAN:     "bg-sky-100 text-sky-700",
  KABUPATEN:     "bg-blue-100 text-blue-700",
  PROVINSI:      "bg-violet-100 text-violet-700",
  NASIONAL:      "bg-amber-100 text-amber-700",
  INTERNASIONAL: "bg-rose-100 text-rose-700",
};

const tabs = ["Riwayat Prestasi", "Kepengurusan", "Sertifikat"];

const fmt = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function PrestasiPage() {
  const { selectedSantri, loading: childLoading } = useChild();
  const [tab, setTab] = useState(0);
  const [academicData, setAcademicData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childLoading) {
      if (selectedSantri) {
        fetchAcademic();
      } else {
        setAcademicData(null);
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
        setAcademicData(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data prestasi:", error);
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

  const listPrestasi = selectedSantri ? (academicData?.prestasi || []) : mockPrestasi;
  const listOrganisasi = selectedSantri ? (academicData?.kepengurusan || []) : mockOrganisasi;
  const listSertifikat = selectedSantri ? (academicData?.sertifikat || []) : mockSertifikat;

  const totalPoin = listPrestasi.reduce((s, p) => s + (p.poin || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 py-8 space-y-6 pb-20">

        {!selectedSantri && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-xl">
            <p className="text-sm text-yellow-800 font-medium">Ini adalah pratinjau halaman Prestasi. Anda belum memiliki data anak aktif.</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-emerald-600 rounded-2xl px-6 py-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h1 className="text-xl font-bold mb-0.5">Poin Prestasi</h1>
              <p className="text-white/60 text-xs">
                {listPrestasi.length} prestasi · {listOrganisasi.length} kepengurusan · {listSertifikat.length} sertifikat
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{totalPoin}</p>
              <p className="text-white/60 text-xs">total poin</p>
            </div>
          </div>
          {/* Stat chips */}
          <div className="flex flex-wrap gap-2 relative z-10">
            {Object.entries(
              listPrestasi.reduce((acc, p) => { 
                const cat = p.kategori || "LAINNYA"; 
                acc[cat] = (acc[cat] || 0) + 1; 
                return acc; 
              }, {})
            ).map(([k, v]) => (
              <span key={k} className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-semibold capitalize">
                {k.toLowerCase()}: {v}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto scrollbar-hide">
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px whitespace-nowrap
                ${tab === i ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab 0: Riwayat Prestasi */}
        {tab === 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {listPrestasi.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-surface rounded-2xl border border-dashed border-slate-300">
                Belum ada riwayat prestasi.
              </div>
            ) : listPrestasi.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${katColor[p.kategori] || katColor.LAINNYA}`}>
                        {p.kategori}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tingkatColor[p.tingkat] || tingkatColor.INTERNAL}`}>
                        {p.tingkat}
                      </span>
                      <span className="text-xs text-slate-400">{fmt(p.tanggal)}</span>
                    </div>
                    <p className="font-semibold text-text-primary text-sm leading-snug">{p.judul}</p>
                    {p.keterangan && <p className="text-xs text-text-secondary mt-1">{p.keterangan}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-primary">+{p.poin}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">poin</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 1: Kepengurusan */}
        {tab === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {listOrganisasi.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-surface rounded-2xl border border-dashed border-slate-300">
                Belum ada data kepengurusan.
              </div>
            ) : listOrganisasi.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${o.isAktif ? "bg-primary/10" : "bg-slate-100"}`}>
                  {o.isAktif ? "🏛️" : "📋"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-text-primary text-sm">{o.jabatan}</p>
                    {o.isAktif && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">Aktif</span>}
                  </div>
                  <p className="text-xs text-text-secondary">{o.organisasi}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Periode: {o.periode || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Sertifikat */}
        {tab === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {listSertifikat.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 bg-surface rounded-2xl border border-dashed border-slate-300">
                Belum ada sertifikat.
              </div>
            ) : listSertifikat.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition group">
                {/* Card top */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-b border-yellow-200 p-5 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏆</div>
                    <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mx-auto" />
                  </div>
                </div>
                {/* Card body */}
                <div className="p-4">
                  <p className="font-bold text-text-primary text-sm leading-snug mb-1 truncate">{s.judul}</p>
                  <p className="text-xs text-text-secondary mb-0.5 truncate">{s.penerbit}</p>
                  <p className="text-[10px] text-slate-400">{fmt(s.tanggal)}</p>
                  {/* Download */}
                  {s.fileUrl ? (
                    <a href={s.fileUrl} target="_blank" rel="noreferrer" className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary text-slate-600 text-xs font-bold rounded-xl transition group-hover:border-primary/30 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Unduh Sertifikat
                    </a>
                  ) : (
                    <button disabled className="mt-3 w-full py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl border border-slate-200 cursor-not-allowed">
                      Tidak ada file
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
