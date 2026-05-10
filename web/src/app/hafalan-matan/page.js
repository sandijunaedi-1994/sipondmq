"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useChild } from "../../context/ChildContext";

const statusCfg = {
  SELESAI: { label: "Selesai",  color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: "✓" },
  PROSES:  { label: "Proses",   color: "bg-blue-50 text-blue-700 border-blue-200",          dot: "bg-blue-500",    icon: "…" },
  BELUM:   { label: "Belum",    color: "bg-slate-50 text-slate-500 border-slate-200",       dot: "bg-slate-300",   icon: "○" },
};

// Fallback preview data for Calon Wali
const mockMatanUtama = [
  { id: 1, judul: "Al-Baiquniyyah", bidang: "Musthalah Hadits", jumlahBait: 34, status: "BELUM", nilaiUjian: null, catatan: null },
  { id: 2, judul: "Ushul Tsalatsah", bidang: "Aqidah", jumlahBait: null, status: "BELUM", nilaiUjian: null, catatan: null },
  { id: 3, judul: "Al-Ajurumiyyah", bidang: "Nahwu", jumlahBait: 46, status: "BELUM", nilaiUjian: null, catatan: null },
  { id: 4, judul: "Arba'in Nawawi", bidang: "Hadits", jumlahBait: null, status: "BELUM", nilaiUjian: null, catatan: null },
];

const mockMatanTambahan = [
  { id: 1, judul: "Surat-surat Pilihan", bidang: "Qur'an", status: "BELUM", catatan: null },
  { id: 2, judul: "Do'a-do'a Harian", bidang: "Ibadah", status: "BELUM", catatan: null },
];

export default function HafalanMatanPage() {
  const { selectedSantri, loading: childLoading } = useChild();
  const [tab, setTab] = useState("utama");
  const [matanData, setMatanData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childLoading) {
      if (selectedSantri) {
        fetchMatan();
      } else {
        setMatanData([]);
        setLoading(false);
      }
    }
  }, [selectedSantri, childLoading]);

  const fetchMatan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/academic/${selectedSantri.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMatanData(data.matan || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data matan:", error);
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

  // Data processing
  let matanUtama = [];
  let matanTambahan = [];

  if (!selectedSantri) {
    matanUtama = mockMatanUtama;
    matanTambahan = mockMatanTambahan;
  } else {
    matanUtama = matanData
      .filter(m => m.matan?.tipe === "UTAMA")
      .map(m => ({
        id: m.id,
        judul: m.matan?.judul || "Matan",
        bidang: m.matan?.bidang || "Umum",
        jumlahBait: m.matan?.jumlahBait,
        status: m.status,
        nilaiUjian: m.nilaiUjian,
        catatan: m.catatan
      }));
    
    matanTambahan = matanData
      .filter(m => m.matan?.tipe === "TAMBAHAN")
      .map(m => ({
        id: m.id,
        judul: m.matan?.judul || "Matan",
        bidang: m.matan?.bidang || "Umum",
        jumlahBait: m.matan?.jumlahBait,
        status: m.status,
        nilaiUjian: m.nilaiUjian,
        catatan: m.catatan
      }));

    // If DB is totally empty for this santri but they are active, provide placeholder empty
    if (matanUtama.length === 0) {
      matanUtama = mockMatanUtama;
    }
  }

  const selesaiUtama = matanUtama.filter(m => m.status === "SELESAI").length;
  const selesaiTambahan = matanTambahan.filter(m => m.status === "SELESAI").length;

  const renderList = (list) => (
    <div className="space-y-3">
      {list.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-surface rounded-2xl border border-dashed border-slate-300">
          Belum ada data matan.
        </div>
      ) : (
        list.map((m) => {
          const s = statusCfg[m.status] || statusCfg.BELUM;
          return (
            <div key={m.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex">
                <div className={`w-1 flex-shrink-0 ${s.dot}`} />
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-text-primary text-sm">{m.judul}</h3>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{m.bidang}</span>
                      </div>
                      {m.jumlahBait && <p className="text-xs text-slate-400">{m.jumlahBait} bait</p>}
                      {m.catatan && (
                        <p className={`text-xs mt-1 italic ${m.status === "PROSES" ? "text-blue-600" : "text-slate-500"}`}>
                          {m.catatan}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${s.color}`}>
                        <span>{s.icon}</span> {s.label}
                      </span>
                      {m.nilaiUjian && (
                        <p className="text-xs text-slate-400 mt-1">Nilai: <span className="font-bold text-primary">{m.nilaiUjian}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 py-8 space-y-6">

        {!selectedSantri && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-xl">
            <p className="text-sm text-yellow-800 font-medium">Ini adalah pratinjau halaman Hafalan Matan. Anda belum memiliki data anak aktif.</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl px-6 py-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div>
              <h1 className="text-xl font-bold">Hafalan Matan</h1>
              <p className="text-white/60 text-xs mt-0.5">Matan ilmu syar'i yang wajib dihafal</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{selesaiUtama}<span className="text-lg text-white/60">/{matanUtama.length}</span></p>
              <p className="text-white/60 text-xs">matan utama</p>
            </div>
          </div>
          {/* Summary chips */}
          <div className="flex gap-2 flex-wrap relative z-10">
            {["SELESAI","PROSES","BELUM"].map(s => {
              const jumlah = matanUtama.filter(m => m.status === s).length;
              return (
                <span key={s} className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-semibold">
                  {statusCfg[s].label}: {jumlah}
                </span>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {[
            { id: "utama",    label: `Matan Utama (${matanUtama.length})`              },
            { id: "tambahan", label: `Matan Tambahan (${matanTambahan.length})`        },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px whitespace-nowrap
                ${tab === t.id ? "border-violet-500 text-violet-700" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        {tab === "utama" && matanUtama.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-text-primary">Progress Matan Utama</span>
              <span className="text-primary font-bold">{selesaiUtama}/{matanUtama.length}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-2.5 rounded-full"
                style={{ width: `${(selesaiUtama/matanUtama.length)*100}%` }} />
            </div>
            <div className="flex gap-4 mt-2">
              {["SELESAI","PROSES","BELUM"].map(s => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${statusCfg[s].dot}`}/>
                  {statusCfg[s].label}: {matanUtama.filter(m=>m.status===s).length}
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "tambahan" && matanTambahan.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-text-primary">Progress Matan Tambahan</span>
              <span className="text-violet-600 font-bold">{selesaiTambahan}/{matanTambahan.length}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-violet-400 to-purple-500 h-2.5 rounded-full"
                style={{ width: `${(selesaiTambahan/matanTambahan.length)*100}%` }} />
            </div>
          </div>
        )}

        {/* Lists */}
        {tab === "utama"    && renderList(matanUtama)}
        {tab === "tambahan" && renderList(matanTambahan)}

      </main>
    </div>
  );
}
