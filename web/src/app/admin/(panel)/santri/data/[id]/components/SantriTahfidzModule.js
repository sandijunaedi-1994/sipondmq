"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle, Clock, Award, Upload, Plus } from "lucide-react";

export default function SantriTahfidzModule({ santriId, isEditable = false }) {
  const [activeTab, setActiveTab] = useState("tahapan"); // tahapan, hafalan, sertifikat
  
  // Data States
  const [tahapan, setTahapan] = useState([]);
  const [hafalan, setHafalan] = useState([]);
  const [sertifikat, setSertifikat] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showHafalanModal, setShowHafalanModal] = useState(false);
  const [showSertifikatModal, setShowSertifikatModal] = useState(false);

  // Forms
  const [hafalanForm, setHafalanForm] = useState({ tanggal: "", targetHal: "", capaianHal: "", totalJuz: "", keterangan: "" });
  const [sertifikatForm, setSertifikatForm] = useState({ judul: "", penerbit: "", tanggal: "", tahfidzCapaianId: "", file: null });

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

  // ── Handlers ──

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
        alert("Status tahapan diperbarui");
        fetchTahapan();
      }
    } catch (err) {
      alert("Gagal update status");
    }
  };

  const submitHafalan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${apiUrl}/api/admin/tahfidz/${santriId}/hafalan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(hafalanForm)
      });
      const data = await res.json();
      if (data.success) {
        alert("Hafalan harian berhasil ditambahkan");
        setShowHafalanModal(false);
        setHafalanForm({ tanggal: "", targetHal: "", capaianHal: "", totalJuz: "", keterangan: "" });
        fetchHafalan();
      } else {
        alert(data.message || "Gagal menyimpan hafalan");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  const submitSertifikat = async (e) => {
    e.preventDefault();
    if (!sertifikatForm.file) return alert("Pilih file sertifikat terlebih dahulu");

    const formData = new FormData();
    formData.append("file", sertifikatForm.file);
    formData.append("judul", sertifikatForm.judul);
    formData.append("penerbit", sertifikatForm.penerbit);
    formData.append("tanggal", sertifikatForm.tanggal);
    if (sertifikatForm.tahfidzCapaianId) {
      formData.append("tahfidzCapaianId", sertifikatForm.tahfidzCapaianId);
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${apiUrl}/api/admin/tahfidz/${santriId}/sertifikat`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert("Sertifikat berhasil diunggah");
        setShowSertifikatModal(false);
        setSertifikatForm({ judul: "", penerbit: "", tanggal: "", tahfidzCapaianId: "", file: null });
        fetchSertifikat();
      } else {
        alert(data.message || "Gagal upload sertifikat");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
      {/* ── Tabs Header ── */}
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
            Hafalan
          </button>
          <button 
            onClick={() => setActiveTab("sertifikat")}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'sertifikat' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Sertifikat
          </button>
        </div>
      </div>

      <div className="p-5 relative min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* ── TAHAPAN TAB ── */}
            {activeTab === "tahapan" && (
              <div className="space-y-4">
                {tahapan.map((t, index) => (
                  <div key={t.id} className="relative flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      t.capaian?.status === 'SELESAI' ? 'bg-teal-500 text-white' : 
                      t.capaian?.status === 'PROSES' ? 'bg-amber-500 text-white' : 
                      'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{t.nama}</h4>
                        
                        {isEditable ? (
                          <select 
                            value={t.capaian?.status || 'BELUM'} 
                            onChange={(e) => updateTahapanStatus(t.id, e.target.value)}
                            className={`text-[10px] font-bold rounded px-2 py-1 uppercase tracking-wider outline-none border-none cursor-pointer ${
                              t.capaian?.status === 'SELESAI' ? 'bg-teal-100 text-teal-700' : 
                              t.capaian?.status === 'PROSES' ? 'bg-amber-100 text-amber-700' : 
                              'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <option value="BELUM">Belum</option>
                            <option value="PROSES">Proses</option>
                            <option value="SELESAI">Selesai</option>
                          </select>
                        ) : (
                          <span className={`text-[10px] font-bold rounded px-2 py-1 uppercase tracking-wider ${
                            t.capaian?.status === 'SELESAI' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400' : 
                            t.capaian?.status === 'PROSES' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 
                            'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {t.capaian?.status || 'BELUM'}
                          </span>
                        )}

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

            {/* ── HAFALAN TAB ── */}
            {activeTab === "hafalan" && (
              <div className="space-y-4">
                {isEditable && (
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setShowHafalanModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      <Plus size={14} /> Tambah Hafalan
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
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
                          <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
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
              </div>
            )}

            {/* ── SERTIFIKAT TAB ── */}
            {activeTab === "sertifikat" && (
              <div className="space-y-4">
                {isEditable && (
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setShowSertifikatModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      <Upload size={14} /> Upload Sertifikat
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sertifikat.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      Belum ada sertifikat tahfidz yang diunggah.
                    </div>
                  ) : (
                    sertifikat.map(s => (
                      <a key={s.id} href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all group bg-slate-50 dark:bg-slate-900/50 shadow-sm hover:shadow-md">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <Award size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                            {s.judul}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">{s.penerbit} • {new Date(s.tanggal).toLocaleDateString('id-ID')}</p>
                          {s.tahfidzCapaian?.tahapan && (
                            <span className="inline-block mt-2 px-1.5 py-0.5 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded text-[9px] font-bold uppercase border border-teal-200 dark:border-teal-800/50">
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

      {/* ── Modal Input Hafalan ── */}
      {isEditable && showHafalanModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 dark:text-white">Input Hafalan</h3>
              <button onClick={() => setShowHafalanModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={submitHafalan} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                <input type="date" required value={hafalanForm.tanggal} onChange={e => setHafalanForm({...hafalanForm, tanggal: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Target (Halaman)</label>
                  <input type="number" required value={hafalanForm.targetHal} onChange={e => setHafalanForm({...hafalanForm, targetHal: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Capaian (Halaman)</label>
                  <input type="number" required value={hafalanForm.capaianHal} onChange={e => setHafalanForm({...hafalanForm, capaianHal: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Total Juz Hafalan (Opsional)</label>
                <input type="number" step="0.1" value={hafalanForm.totalJuz} onChange={e => setHafalanForm({...hafalanForm, totalJuz: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="Misal: 5.5" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan (Opsional)</label>
                <textarea rows="2" value={hafalanForm.keterangan} onChange={e => setHafalanForm({...hafalanForm, keterangan: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors">
                  Simpan Hafalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Upload Sertifikat ── */}
      {isEditable && showSertifikatModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 dark:text-white">Upload Sertifikat</h3>
              <button onClick={() => setShowSertifikatModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={submitSertifikat} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Judul Sertifikat</label>
                <input type="text" required value={sertifikatForm.judul} onChange={e => setSertifikatForm({...sertifikatForm, judul: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="Misal: Sertifikat Khatam 30 Juz" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Penerbit</label>
                <input type="text" value={sertifikatForm.penerbit} onChange={e => setSertifikatForm({...sertifikatForm, penerbit: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="Misal: Pesantren My MQ" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal Terbit</label>
                <input type="date" required value={sertifikatForm.tanggal} onChange={e => setSertifikatForm({...sertifikatForm, tanggal: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Terkait Tahapan (Opsional)</label>
                <select value={sertifikatForm.tahfidzCapaianId} onChange={e => setSertifikatForm({...sertifikatForm, tahfidzCapaianId: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                  <option value="">-- Pilih Capaian Tahapan --</option>
                  {tahapan.map(t => (
                    t.capaian && t.capaian.id && (
                      <option key={t.id} value={t.capaian.id}>{t.nama}</option>
                    )
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">File Sertifikat (Gambar / PDF)</label>
                <input type="file" required accept=".pdf,image/*" onChange={e => setSertifikatForm({...sertifikatForm, file: e.target.files[0]})} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors">
                  Upload Sertifikat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
