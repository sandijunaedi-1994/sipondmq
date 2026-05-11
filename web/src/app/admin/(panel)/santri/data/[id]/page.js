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
  }, [id]);

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
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-800 dark:text-slate-100">Detail Santri Aktif</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Profil lengkap, rekam jejak, dan administrasi.</p>
        </div>
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
        </div>

        {/* ── KOLOM KANAN (Aktivitas / Modul) ── */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 text-center min-h-[300px] flex flex-col items-center justify-center">
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
    </div>
  );
}
