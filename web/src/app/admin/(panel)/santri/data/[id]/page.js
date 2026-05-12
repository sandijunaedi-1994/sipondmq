"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SantriDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [santri, setSantri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [canEdit, setCanEdit] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const perms = JSON.parse(localStorage.getItem("admin_permissions") || "[]");
      setCanEdit(perms.includes("MANAJEMEN_ADMIN") || perms.includes("SANTRI_VIEW"));
    } catch (e) {}
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setSantri(data.santri);
          setEditForm({
            studentName: data.santri.registration?.studentName || "",
            nis: data.santri.nis || "",
            program: data.santri.registration?.program || "SMP",
            gender: data.santri.registration?.gender || "LAKI_LAKI",
            kelas: data.santri.kelas || "",
            asrama: data.santri.asrama || "",
            status: data.santri.status || "AKTIF",
            nik: data.santri.registration?.registrationData?.nik || "",
            nisn: data.santri.registration?.registrationData?.nisn || "",
            birthPlace: data.santri.registration?.registrationData?.birthPlace || "",
            birthDate: data.santri.registration?.registrationData?.birthDate ? data.santri.registration.registrationData.birthDate.split('T')[0] : ""
          });
        } else {
          setError(data.message || "Data tidak ditemukan");
        }
      } catch (err) {
        setError("Kesalahan jaringan saat memuat data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetail();
  }, [id, editModalOpen]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditModalOpen(false);
        // data will be re-fetched because we added editModalOpen to useEffect dependencies
      } else {
        alert(data.message || "Gagal menyimpan data.");
      }
    } catch (err) {
      alert("Kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Memuat profil santri...</p>
        </div>
      </div>
    );
  }

  if (error || !santri) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-8 rounded-3xl text-center max-w-md border border-red-100 dark:border-red-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-black mb-2">Oops!</h2>
          <p className="text-sm mb-6">{error || "Data santri tidak ditemukan."}</p>
          <button onClick={() => router.back()} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const { registration, markaz, waliSantri, registrationData } = santri;
  const regData = registration?.registrationData || {};

  return (
    <div className="space-y-4 w-full pb-8">
      
      {/* ── HEADER NAVIGATION ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-slate-100">{registration?.studentName || "Detail Santri"}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Profil lengkap, rekam jejak, dan administrasi.</p>
          </div>
        </div>
        
        {canEdit && (
          <button onClick={() => setEditModalOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Data
          </button>
        )}
      </div>

      {/* ── PROFIL UTAMA CARD ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
        <div className="px-5 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end -mt-10 mb-4">
            <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center relative">
              {santri.fotoUrl ? (
                <Image src={santri.fotoUrl} alt={registration?.studentName} fill className="object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              )}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                  {registration?.studentName}
                </h2>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] rounded border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wider">
                  {santri.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">NIS: <span className="text-slate-700 dark:text-slate-300 font-bold">{santri.nis || "Belum ada"}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Program</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{registration?.program || "-"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Kelas</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{santri.kelas || "-"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Markaz</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{markaz?.kode || registration?.markaz?.kode || markaz?.nama || "-"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Asrama</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{santri.asrama || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* ── KOLOM KIRI (Info Pribadi & Wali) ── */}
        <div className="md:col-span-1 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Biodata Diri</h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Jenis Kelamin</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{registration?.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">TTL</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{regData?.birthPlace || "-"}, {regData?.birthDate ? new Date(regData.birthDate).toLocaleDateString('id-ID') : "-"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">NIK</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{regData?.nik || "-"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">NISN</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{regData?.nisn || "-"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Tahun Masuk</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{santri.tahunMasuk || registration?.academicYear || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Wali Santri</h3>
            {waliSantri && waliSantri.length > 0 ? (
              <div className="space-y-3">
                {waliSantri.map(wali => (
                  <div key={wali.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{wali.user?.namaLengkap || wali.user?.email || "Tanpa Nama"}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${wali.hubungan === 'AYAH' ? 'bg-blue-100 text-blue-700' : wali.hubungan === 'IBU' ? 'bg-pink-100 text-pink-700' : 'bg-slate-200 text-slate-700'}`}>
                        {wali.hubungan}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {wali.user?.phone || "-"}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {wali.user?.email || "-"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
                Belum ada data wali santri yang terhubung.
              </div>
            )}
          </div>

          {/* Data Saudara */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Data Saudara</h3>
            
            {(regData?.mqSiblings && regData.mqSiblings.length > 0) || (regData?.siblings && regData.siblings.length > 0) ? (
              <div className="space-y-3">
                {regData?.mqSiblings?.map(sib => (
                  <div key={sib.id} className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{sib.name}</p>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                        Santri MQ
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{sib.program} - {sib.class || "Tanpa Kelas"}</p>
                  </div>
                ))}
                
                {regData?.siblings?.map(sib => (
                  <div key={sib.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-100 mb-1">{sib.name}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{sib.age ? `${sib.age} thn` : "-"}</span> • 
                      <span>{sib.education || "-"}</span> • 
                      <span>{sib.occupation || "-"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
                Tidak ada data saudara.
              </div>
            )}
          </div>
        </div>

        {/* ── KOLOM KANAN (Aktivitas / Modul / Berkas) ── */}
        <div className="md:col-span-3 space-y-4">

          {/* Data Berkas */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Berkas Santri
            </h3>
            
            {registration?.documents && registration.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {registration.documents.map(doc => (
                  <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all group bg-slate-50 dark:bg-slate-900/50">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-600 transition-colors">
                        {doc.type.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                          doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' :
                          doc.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500">
                Tidak ada berkas yang dilampirkan.
              </div>
            )}
          </div>

          {/* Modul Placeholder */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 text-center min-h-[200px] flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">Modul Sedang Dikembangkan</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-xs">
              Fitur riwayat tagihan, tahfidz, kehadiran, poin pelanggaran, dan aktivitas santri akan ditampilkan di area ini pada update mendatang.
            </p>
          </div>
        </div>

      </div>

      {/* ── EDIT MODAL ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 rounded-t-2xl">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Edit Data Santri</h3>
              <button onClick={() => !saving && setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSaveEdit} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Santri</label>
                    <input type="text" required value={editForm.studentName} onChange={(e) => setEditForm({...editForm, studentName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NIS</label>
                    <input type="text" value={editForm.nis} onChange={(e) => setEditForm({...editForm, nis: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Jenis Kelamin</label>
                    <select value={editForm.gender} onChange={(e) => setEditForm({...editForm, gender: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="LAKI_LAKI">Laki-laki</option>
                      <option value="PEREMPUAN">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Program</label>
                    <select value={editForm.program} onChange={(e) => setEditForm({...editForm, program: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="MAHAD_ALY">Mahad Aly</option>
                      <option value="SD">SD</option>
                      <option value="TK">TK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kelas</label>
                    <input type="text" value={editForm.kelas} onChange={(e) => setEditForm({...editForm, kelas: e.target.value})} placeholder="Contoh: 7A, 10 MIPA 1" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Asrama</label>
                    <input type="text" value={editForm.asrama} onChange={(e) => setEditForm({...editForm, asrama: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status Aktif</label>
                    <select value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="AKTIF">Aktif</option>
                      <option value="LULUS">Lulus</option>
                      <option value="KELUAR">Keluar</option>
                      <option value="CUTI">Cuti</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Biodata Pribadi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NIK</label>
                      <input type="text" value={editForm.nik} onChange={(e) => setEditForm({...editForm, nik: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NISN</label>
                      <input type="text" value={editForm.nisn} onChange={(e) => setEditForm({...editForm, nisn: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tempat Lahir</label>
                      <input type="text" value={editForm.birthPlace} onChange={(e) => setEditForm({...editForm, birthPlace: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Lahir</label>
                      <input type="date" value={editForm.birthDate} onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-2">
                  <button type="button" onClick={() => setEditModalOpen(false)} disabled={saving} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition disabled:opacity-50">
                    Batal
                  </button>
                  <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50 flex items-center gap-2">
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
