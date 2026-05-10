"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useChild } from "../../context/ChildContext";

const katColor = {
  RINGAN: "bg-yellow-50 text-yellow-700 border-yellow-200",
  SEDANG: "bg-orange-50 text-orange-700 border-orange-200",
  BERAT:  "bg-red-50 text-red-700 border-red-200",
};

const spColor = {
  "SP_1": "bg-orange-50 text-orange-700 border-orange-200",
  "SP_2": "bg-red-50 text-red-700 border-red-200",
  "SP_3": "bg-rose-100 text-rose-800 border-rose-300",
};

const tabs = ["Riwayat Pelanggaran", "Surat Peringatan"];

const fmt = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

// Mock data for Calon Wali Preview
const mockPelanggaran = [
  { id: 1, tanggal: new Date().toISOString(), kategori: "RINGAN", deskripsi: "Terlambat mengikuti shalat berjamaah", poin: 5, sanksi: "Teguran lisan" },
  { id: 2, tanggal: new Date().toISOString(), kategori: "SEDANG", deskripsi: "Meninggalkan halaqoh tanpa izin", poin: 15, sanksi: "Surat peringatan" },
];

const mockSP = [
  { id: 1, nomorSurat: "SP-001/MQ/2026", tanggal: new Date().toISOString(), perihal: "Meninggalkan Halaqoh Tanpa Izin", tingkat: "SP_1", fileUrl: "#" }
];

export default function PelanggaranPage() {
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
      console.error("Gagal mengambil data pelanggaran:", error);
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

  const listPelanggaran = selectedSantri ? (academicData?.pelanggaran || []) : mockPelanggaran;
  const listSP = selectedSantri ? (academicData?.suratPeringatan || []) : mockSP;
  const total = listPelanggaran.reduce((s, p) => s + (p.poin || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 py-8 space-y-6 pb-20">

        {!selectedSantri && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-xl">
            <p className="text-sm text-yellow-800 font-medium">Ini adalah pratinjau halaman Pelanggaran. Anda belum memiliki data anak aktif.</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl px-6 py-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h1 className="text-xl font-bold mb-0.5">Poin Pelanggaran</h1>
              <p className="text-white/60 text-xs">{listPelanggaran.length} catatan · {listSP.length} surat peringatan</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{total}</p>
              <p className="text-white/60 text-xs">total poin</p>
            </div>
          </div>
          {/* Poin bar */}
          <div className="mt-4 relative z-10">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>Akumulasi poin</span><span>{total}/100 maks</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-700 ${total < 30 ? "bg-yellow-300" : total < 70 ? "bg-orange-300" : "bg-red-300"}`}
                style={{ width: `${Math.min(total, 100)}%` }} />
            </div>
            <p className="text-white/50 text-[10px] mt-1 font-medium">
              {total < 30 ? "Status: Baik" : total < 70 ? "Status: Perlu Perhatian" : "Status: Kritis — hubungi wali kelas"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px
                ${tab === i ? "border-red-500 text-red-600" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab: Riwayat Pelanggaran */}
        {tab === 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {listPelanggaran.length === 0 ? (
              <div className="text-center py-16 text-emerald-600 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-4xl mb-3 block">✨</span>
                <p className="font-bold text-lg">Alhamdulillah!</p>
                <p className="text-sm text-emerald-600/70 mt-1">Santri tidak memiliki riwayat pelanggaran.</p>
              </div>
            ) : listPelanggaran.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${katColor[p.kategori] || "bg-slate-100 text-slate-700"}`}>
                        {p.kategori}
                      </span>
                      <span className="text-xs text-text-secondary">{fmt(p.tanggal)}</span>
                    </div>
                    <p className="font-semibold text-text-primary text-sm leading-snug">{p.deskripsi}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-red-500">{p.poin}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">poin</p>
                  </div>
                </div>
                {p.sanksi && (
                  <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-600 border border-slate-100">
                    <span className="font-bold text-slate-700">Sanksi:</span> {p.sanksi}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Surat Peringatan */}
        {tab === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {listSP.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-surface rounded-2xl border border-dashed border-slate-300">
                <p className="text-4xl mb-3">📄</p>
                <p className="font-medium text-sm">Belum ada surat peringatan</p>
              </div>
            ) : listSP.map((sp) => (
              <div key={sp.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="flex">
                  <div className={`w-1 flex-shrink-0 ${sp.tingkat === 'SP_3' ? 'bg-rose-500' : sp.tingkat === 'SP_2' ? 'bg-red-500' : 'bg-orange-400'}`} />
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${spColor[sp.tingkat] || spColor['SP_1']}`}>
                            {sp.tingkat.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400">{fmt(sp.tanggal)}</span>
                        </div>
                        <p className="font-bold text-text-primary text-sm mb-0.5">{sp.perihal}</p>
                        <p className="text-xs text-slate-400">No: {sp.nomorSurat}</p>
                      </div>
                    </div>
                    {/* Download */}
                    {sp.fileUrl && (
                      <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">Surat_Peringatan.pdf</p>
                            <p className="text-[10px] text-slate-400">Dokumen PDF resmi</p>
                          </div>
                        </div>
                        <a href={sp.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition shadow-sm shadow-primary/20">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Unduh
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
