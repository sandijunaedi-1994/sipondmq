"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useChild } from "../../context/ChildContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDateTime = (d) =>
  new Date(d).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const formatDateInput = (d) => new Date(d).toISOString().slice(0, 16);

/** Hitung keterlambatan dari tanggal kembali yang seharusnya hingga sekarang */
function overtimeDuration(tanggalKembali) {
  const diffMs = Date.now() - new Date(tanggalKembali).getTime();
  if (diffMs <= 0) return null;
  const totalMenit = Math.floor(diffMs / 60000);
  const hari  = Math.floor(totalMenit / (60 * 24));
  const jam   = Math.floor((totalMenit % (60 * 24)) / 60);
  if (hari === 0) return `${jam} jam`;
  return jam > 0 ? `${hari} hari ${jam} jam` : `${hari} hari`;
}

// ─── Mock data for Preview ───────────────────────────────────────────────────
const mockIzin = [
  {
    id: "mock1",
    jenis: "PULANG",
    alasan: "Acara keluarga",
    tanggalMulai: new Date(Date.now() - 24 * 3600000).toISOString(),
    tanggalKembali: new Date(Date.now() + 24 * 3600000).toISOString(),
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
];

const jenisOptions = ["PULANG", "BEROBAT", "ZIARAH", "LAINNYA"];

// ─── Status config ─────────────────────────────────────────────────────────────
const statusConfig = {
  TINJAUAN: { label: "Dalam Tinjauan", color: "bg-blue-50 text-blue-700 border-blue-200",   dot: "bg-blue-500"   },
  AKTIF:    { label: "Aktif",          color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  WARNING:  { label: "Terlambat",      color: "bg-red-50 text-red-700 border-red-200",       dot: "bg-red-500"    },
  SELESAI:  { label: "Selesai",        color: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400"  },
  DITOLAK:  { label: "Ditolak",        color: "bg-rose-50 text-rose-700 border-rose-200",    dot: "bg-rose-500"   },
};

const filterTabs = [
  { id: "SEMUA",    label: "Semua"    },
  { id: "TINJAUAN", label: "Tinjauan" },
  { id: "AKTIF",    label: "Aktif"    },
  { id: "WARNING",  label: "Terlambat"},
  { id: "SELESAI",  label: "Selesai"  },
  { id: "DITOLAK",  label: "Ditolak"  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status, tanggalKembali }) {
  const cfg = statusConfig[status] || statusConfig.TINJAUAN;
  const overtime = status === "WARNING" ? overtimeDuration(tanggalKembali) : null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "AKTIF" ? "animate-pulse" : ""}`} />
      {cfg.label}
      {overtime && <span className="font-normal opacity-80">· {overtime}</span>}
    </span>
  );
}

function IzinCard({ izin }) {
  const cfg = statusConfig[izin.status] || statusConfig.TINJAUAN;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 ${
      izin.status === "WARNING" ? "border-red-200" :
      izin.status === "AKTIF"   ? "border-emerald-200" : "border-slate-200"
    }`}>
      <div className="flex">
        <div className={`w-1 flex-shrink-0 ${cfg.dot}`} />
        <div className="flex-1 p-4">
          {/* Header row */}
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wide text-text-secondary">{izin.jenis}</span>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] text-text-secondary whitespace-nowrap">{formatDateTime(izin.createdAt)}</span>
              </div>
              <p className="font-semibold text-text-primary text-sm leading-snug line-clamp-2">{izin.alasan}</p>
            </div>
            <StatusBadge status={izin.status} tanggalKembali={izin.tanggalKembali} />
          </div>

          {/* Waktu */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-text-secondary">
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Mulai: <strong>{formatDateTime(izin.tanggalMulai)}</strong></span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Kembali: <strong>{formatDateTime(izin.tanggalKembali)}</strong></span>
            </div>
          </div>

          {/* Catatan admin jika ditolak */}
          {izin.status === "DITOLAK" && izin.catatanAdmin && (
            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700">
              <span className="font-bold">Catatan Admin:</span> {izin.catatanAdmin}
            </div>
          )}

          {/* Tanggal kembali aktual jika selesai */}
          {izin.status === "SELESAI" && izin.tanggalKembaliAktual && (
            <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700">
              ✓ Kembali pada: <strong>{formatDateTime(izin.tanggalKembaliAktual)}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function FormModal({ onClose, onSubmit, selectedSantri }) {
  const now = new Date();
  const nowStr = formatDateInput(now);

  const [form, setForm] = useState({
    jenis: "PULANG",
    alasan: "",
    tanggalMulai: nowStr,
    tanggalKembali: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedSantri) {
      setError("Data santri belum aktif. Tidak dapat mengajukan izin.");
      return;
    }

    if (!form.tanggalKembali) { setError("Tanggal kembali wajib diisi."); return; }
    if (new Date(form.tanggalKembali) <= new Date(form.tanggalMulai)) {
      setError("Tanggal kembali harus setelah tanggal mulai."); return;
    }
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/permissions/${selectedSantri.id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        onSubmit(data.perizinan);
      } else {
        setError(data.message || "Gagal mengajukan izin");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Ajukan Perizinan</h2>
              <p className="text-white/70 text-xs mt-0.5">Isi form di bawah dan tunggu persetujuan admin</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm p-3 rounded-xl">{error}</div>
          )}

          {/* Jenis */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Jenis Izin</label>
            <div className="grid grid-cols-2 gap-2">
              {jenisOptions.map((j) => (
                <button
                  key={j} type="button"
                  onClick={() => setForm((p) => ({ ...p, jenis: j }))}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition uppercase
                    ${form.jenis === j ? "bg-primary text-white border-primary shadow-sm" : "bg-slate-50 text-text-secondary border-slate-200 hover:border-primary/50 hover:bg-white"}`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>

          {/* Alasan */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Keperluan / Alasan</label>
            <textarea
              name="alasan"
              value={form.alasan}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Jelaskan keperluan izin secara singkat…"
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
            />
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Tanggal &amp; Jam Mulai</label>
            <input
              type="datetime-local"
              name="tanggalMulai"
              value={form.tanggalMulai}
              onChange={handleChange}
              required
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* Tanggal Kembali */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Tanggal &amp; Jam Kembali</label>
            <input
              type="datetime-local"
              name="tanggalKembali"
              value={form.tanggalKembali}
              onChange={handleChange}
              required
              min={form.tanggalMulai}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition disabled:opacity-60 shadow-lg shadow-primary/30 text-sm"
          >
            {submitting ? "Mengirim Pengajuan…" : "Kirim Pengajuan Izin"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PerizinanPage() {
  const { selectedSantri, loading: childLoading } = useChild();
  const [izinList, setIzinList]   = useState([]);
  const [activeFilter, setFilter] = useState("SEMUA");
  const [showForm, setShowForm]   = useState(false);
  const [toast, setToast]         = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!childLoading) {
      if (selectedSantri) {
        fetchPermissions();
      } else {
        setIzinList(mockIzin);
        setLoading(false);
      }
    }
  }, [selectedSantri, childLoading]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/permissions/${selectedSantri.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIzinList(data.permissions || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data perizinan:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeFilter === "SEMUA"
    ? izinList
    : izinList.filter((i) => i.status === activeFilter);

  const counts = Object.fromEntries(
    filterTabs.map((t) => [
      t.id,
      t.id === "SEMUA" ? izinList.length : izinList.filter((i) => i.status === t.id).length,
    ])
  );

  const handleSubmit = (newIzin) => {
    setIzinList((prev) => [newIzin, ...prev]);
    setShowForm(false);
    setToast("Pengajuan izin berhasil dikirim! Menunggu persetujuan admin.");
    setTimeout(() => setToast(""), 4000);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto p-4 py-8 space-y-6 pb-20">
        
        {!selectedSantri && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-xl">
            <p className="text-sm text-yellow-800 font-medium">Ini adalah pratinjau halaman Perizinan. Anda belum memiliki data anak aktif.</p>
          </div>
        )}

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl px-6 py-5 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-xl font-bold">Perizinan Santri</h1>
            </div>
            <p className="text-white/60 text-xs">Ajukan dan pantau status perizinan keluar santri.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={!selectedSantri}
            className="relative z-10 flex items-center gap-2 px-4 py-2.5 bg-white text-primary font-bold rounded-xl text-sm shadow hover:shadow-md transition hover:bg-slate-50 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Ajukan Izin
          </button>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all
                  ${isActive
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-text-secondary border-slate-200 hover:border-primary/40 hover:bg-slate-50"}`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                    ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── List ── */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface rounded-2xl border border-dashed border-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-semibold text-slate-500">Tidak ada data perizinan</p>
              <p className="text-sm text-slate-400 mt-1">Pengajuan izin akan muncul di sini.</p>
            </div>
          ) : (
            filtered.map((izin) => <IzinCard key={izin.id} izin={izin} />)
          )}
        </div>
      </main>

      {/* ── Form Modal ── */}
      {showForm && <FormModal onClose={() => setShowForm(false)} onSubmit={handleSubmit} selectedSantri={selectedSantri} />}

      {/* ── Toast Notification ── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
