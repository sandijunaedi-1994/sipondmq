"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Award, Upload, X } from "lucide-react";
import Swal from 'sweetalert2';

export default function SantriTahfidzModule({ santriId, isEditable = false }) {
  const [tahapan, setTahapan] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showSertifikatModal, setShowSertifikatModal] = useState(false);
  const [sertifikatForm, setSertifikatForm] = useState({ judul: "", penerbit: "", tanggal: "", tahfidzCapaianId: "", tahapanNama: "", file: null });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (santriId) {
      fetchTahapan();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowSertifikatModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        Swal.fire({ icon: 'success', title: 'Berhasil', text: "Status tahapan diperbarui", timer: 1500, showConfirmButton: false });
        fetchTahapan();
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.message || "Gagal update status" });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: "Gagal update status" });
    }
  };

  const submitSertifikat = async (e) => {
    e.preventDefault();
    if (!sertifikatForm.file) return Swal.fire({ icon: 'warning', title: 'Peringatan', text: "Pilih file sertifikat terlebih dahulu" });

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
        Swal.fire({ icon: 'success', title: 'Berhasil', text: "Sertifikat berhasil diunggah", timer: 1500, showConfirmButton: false });
        setShowSertifikatModal(false);
        setSertifikatForm({ judul: "", penerbit: "", tanggal: "", tahfidzCapaianId: "", tahapanNama: "", file: null });
        fetchTahapan();
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.message || "Gagal upload sertifikat" });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: "Terjadi kesalahan jaringan" });
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300 animate-[fadeIn_0.2s_ease-out]" onClick={() => setShowSertifikatModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
            
            <div className="relative p-6 bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-800 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-10 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white mb-3 shadow-inner border border-white/20">
                    <Upload size={20} />
                  </div>
                  <h3 className="font-black text-xl text-white tracking-tight">Upload Sertifikat</h3>
                  <p className="text-indigo-100 text-xs mt-1">Sertifikat untuk {sertifikatForm.tahapanNama}</p>
                </div>
                <button onClick={() => setShowSertifikatModal(false)} className="text-white/70 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full backdrop-blur-sm transition-all duration-200">
                  <X size={16} />
                </button>
              </div>
            </div>

            <form onSubmit={submitSertifikat} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Judul Sertifikat <span className="text-red-500">*</span></label>
                <input type="text" required value={sertifikatForm.judul} onChange={e => setSertifikatForm({...sertifikatForm, judul: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" placeholder="Misal: Sertifikat Tahapan" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Penerbit</label>
                <input type="text" value={sertifikatForm.penerbit} onChange={e => setSertifikatForm({...sertifikatForm, penerbit: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" placeholder="Misal: Pesantren My MQ" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tanggal Terbit <span className="text-red-500">*</span></label>
                <input type="date" required value={sertifikatForm.tanggal} onChange={e => setSertifikatForm({...sertifikatForm, tanggal: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">File (Gambar / PDF) <span className="text-red-500">*</span></label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-4 flex flex-col items-center justify-center cursor-pointer group">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                    <Upload size={18} />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 text-center">
                    {sertifikatForm.file ? sertifikatForm.file.name : "Klik untuk memilih file"}
                  </span>
                  <input type="file" required accept=".pdf,image/*" onChange={e => setSertifikatForm({...sertifikatForm, file: e.target.files[0]})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="pt-3">
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex justify-center items-center gap-2">
                  <Upload size={18} />
                  Upload Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
