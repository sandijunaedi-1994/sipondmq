"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Award, Upload } from "lucide-react";

export default function SantriTahfidzModule({ santriId, isEditable = false }) {
  const [tahapan, setTahapan] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showSertifikatModal, setShowSertifikatModal] = useState(false);
  const [sertifikatForm, setSertifikatForm] = useState({ judul: "", penerbit: "", tanggal: "", tahfidzCapaianId: "", file: null });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (santriId) {
      fetchTahapan();
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
        fetchTahapan(); // Refresh tahapan to show the new certificate
      } else {
        alert(data.message || "Gagal upload sertifikat");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  const openUploadModal = (capaianId, tahapanNama) => {
    setSertifikatForm({
      judul: `Sertifikat ${tahapanNama}`,
      penerbit: "Pesantren My MQ",
      tanggal: new Date().toISOString().split('T')[0],
      tahfidzCapaianId: capaianId,
      file: null
    });
    setShowSertifikatModal(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
      {/* ── Header ── */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2">
        <BookOpen className="text-teal-500" size={18} />
        <h3 className="text-sm font-black text-slate-800 dark:text-white">Modul Tahfidz Qur'an (Progress Tahapan)</h3>
      </div>

      <div className="p-5 relative min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {tahapan.map((t, index) => {
              const hasSertifikat = t.capaian?.sertifikat && t.capaian.sertifikat.length > 0;
              return (
                <div key={t.id} className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    t.capaian?.status === 'SELESAI' ? 'bg-teal-500 text-white' : 
                    t.capaian?.status === 'PROSES' ? 'bg-amber-500 text-white' : 
                    'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 w-full">
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
                    
                    <div className="flex flex-wrap items-center gap-4">
                      {t.capaian?.targetTanggal && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">
                          Target: {new Date(t.capaian.targetTanggal).toLocaleDateString('id-ID')}
                        </p>
                      )}
                      {t.capaian?.selesaiTanggal && (
                        <p className="text-[10px] text-teal-600 dark:text-teal-500 font-medium">
                          Selesai: {new Date(t.capaian.selesaiTanggal).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sertifikat Section */}
                  <div className="w-full sm:w-auto mt-2 sm:mt-0 flex justify-end shrink-0">
                    {hasSertifikat ? (
                      <a 
                        href={t.capaian.sertifikat[0].fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        <Award size={14} /> Lihat Sertifikat
                      </a>
                    ) : (
                      isEditable && t.capaian?.id && t.capaian?.status === 'SELESAI' ? (
                        <button 
                          onClick={() => openUploadModal(t.capaian.id, t.nama)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors border border-emerald-200 dark:border-emerald-800"
                        >
                          <Upload size={14} /> Upload Sertifikat
                        </button>
                      ) : null
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                <input type="text" required value={sertifikatForm.judul} onChange={e => setSertifikatForm({...sertifikatForm, judul: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="Misal: Sertifikat Tahapan" />
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
