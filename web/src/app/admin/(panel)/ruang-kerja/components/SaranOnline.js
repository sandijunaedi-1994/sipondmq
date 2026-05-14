"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Send, Inbox, History, CheckCircle, RefreshCw } from "lucide-react";

export default function SaranOnline() {
  const [activeSubTab, setActiveSubTab] = useState("kirim");
  const [units, setUnits] = useState([]);
  const [saranMasuk, setSaranMasuk] = useState([]);
  const [saranTerkirim, setSaranTerkirim] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    targetType: "UMUM",
    targetUnitId: "",
    subjek: "",
    isiSaran: ""
  });

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/saran/units", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnits(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSaranMasuk = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/saran/inbox", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSaranMasuk(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSaranTerkirim = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/saran/sent", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSaranTerkirim(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    if (activeSubTab === "masuk") fetchSaranMasuk();
    if (activeSubTab === "terkirim") fetchSaranTerkirim();
  }, [activeSubTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/saran", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Saran Anda telah berhasil dikirim",
          confirmButtonColor: "#10b981"
        });
        setFormData({ targetType: "UMUM", targetUnitId: "", subjek: "", isiSaran: "" });
      } else {
        const err = await res.json();
        throw new Error(err.message || "Gagal mengirim saran");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/saran/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        fetchSaranMasuk();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <button
          onClick={() => setActiveSubTab("kirim")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${activeSubTab === "kirim" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
        >
          <Send size={16} /> Kirim Saran
        </button>
        <button
          onClick={() => setActiveSubTab("masuk")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${activeSubTab === "masuk" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
        >
          <Inbox size={16} /> Kotak Masuk
        </button>
        <button
          onClick={() => setActiveSubTab("terkirim")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${activeSubTab === "terkirim" ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
        >
          <History size={16} /> Riwayat Terkirim
        </button>
      </div>

      {activeSubTab === "kirim" && (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Tujuan *</label>
            <select
              required
              value={formData.targetType}
              onChange={e => setFormData({ ...formData, targetType: e.target.value, targetUnitId: "" })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
            >
              <option value="UMUM">Umum (Manajemen Tertinggi)</option>
              <option value="SUPERADMIN">Superadmin (Teknis/Sistem)</option>
              <option value="KEPALA_UNIT">Kepala Unit Tertentu</option>
            </select>
          </div>

          {formData.targetType === "KEPALA_UNIT" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Pilih Unit *</label>
              <select
                required
                value={formData.targetUnitId}
                onChange={e => setFormData({ ...formData, targetUnitId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
              >
                <option value="">-- Pilih Unit --</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.nama}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subjek / Topik *</label>
            <input
              type="text"
              required
              value={formData.subjek}
              onChange={e => setFormData({ ...formData, subjek: e.target.value })}
              placeholder="Contoh: Usulan Perbaikan Fasilitas"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Isi Saran / Keluhan *</label>
            <textarea
              required
              rows={5}
              value={formData.isiSaran}
              onChange={e => setFormData({ ...formData, isiSaran: e.target.value })}
              placeholder="Tuliskan saran atau keluhan Anda secara detail..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
            Kirim Saran
          </button>
        </form>
      )}

      {activeSubTab === "masuk" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500">Memuat data...</div>
          ) : saranMasuk.length === 0 ? (
            <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              Belum ada saran yang masuk untuk Anda.
            </div>
          ) : (
            saranMasuk.map(s => (
              <div key={s.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{s.subjek}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Dari: <span className="font-semibold text-slate-700 dark:text-slate-300">{s.pengirim.namaLengkap}</span> • {new Date(s.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${s.status === 'TERKIRIM' ? 'bg-amber-100 text-amber-700' : s.status === 'DIBACA' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {s.status}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 mt-3 whitespace-pre-wrap">
                  {s.isiSaran}
                </div>
                <div className="mt-4 flex gap-2">
                  {s.status === 'TERKIRIM' && (
                    <button onClick={() => handleUpdateStatus(s.id, 'DIBACA')} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">
                      Tandai Dibaca
                    </button>
                  )}
                  {s.status !== 'DITINDAKLANJUTI' && (
                    <button onClick={() => handleUpdateStatus(s.id, 'DITINDAKLANJUTI')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors">
                      Tandai Selesai / Ditindaklanjuti
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeSubTab === "terkirim" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500">Memuat data...</div>
          ) : saranTerkirim.length === 0 ? (
            <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              Anda belum pernah mengirim saran.
            </div>
          ) : (
            saranTerkirim.map(s => (
              <div key={s.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{s.subjek}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Tujuan: <span className="font-semibold text-slate-700 dark:text-slate-300">{s.targetType === 'KEPALA_UNIT' ? s.targetUnit?.nama : s.targetType}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(s.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border ${s.status === 'TERKIRIM' ? 'bg-amber-50 text-amber-600 border-amber-200' : s.status === 'DIBACA' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    {s.status === 'DITINDAKLANJUTI' && <CheckCircle size={12} />}
                    {s.status}
                  </span>
                </div>
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                  {s.isiSaran}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
