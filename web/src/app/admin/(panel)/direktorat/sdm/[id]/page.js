"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TabPayroll from "./components/TabPayroll";
import TabKasbon from "./components/TabKasbon";
import TabKoperasi from "./components/TabKoperasi";

export default function DetailPegawaiPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pegawai, setPegawai] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profil");

  const [uploading, setUploading] = useState(false);
  const [berkasFile, setBerkasFile] = useState(null);
  const [jenisBerkas, setJenisBerkas] = useState("KTP");

  const handleUploadBerkas = async (e) => {
    e.preventDefault();
    if (!berkasFile) return alert('Pilih file terlebih dahulu');
    setUploading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();
      formData.append('file', berkasFile);
      formData.append('jenis', jenisBerkas);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai/${id}/berkas`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal mengunggah berkas');
      }
      setBerkasFile(null);
      fetchPegawaiDetail();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBerkas = async (berkasId) => {
    if (!confirm('Yakin ingin menghapus berkas ini?')) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai/${id}/berkas/${berkasId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal menghapus berkas');
      fetchPegawaiDetail();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchPegawaiDetail();
  }, [id]);

  const fetchPegawaiDetail = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengambil data pegawai");
      
      setPegawai(data.pegawai);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Memuat profil pegawai...</p>
        </div>
      </div>
    );
  }

  if (error || !pegawai) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[30vh]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <p className="text-red-600 dark:text-red-400 font-bold">{error || "Data Pegawai tidak ditemukan"}</p>
        <button onClick={() => router.push('/admin/direktorat/sdm')} className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-semibold shadow-sm transition hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">Kembali ke Daftar</button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'TETAP': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'KONTRAK': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'MAGANG': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'BERHENTI': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin/direktorat/sdm')} className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">Detail Pegawai</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">Informasi lengkap biodata dan status kepegawaian.</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-px mb-6 custom-scrollbar">
        {['profil', 'payroll', 'kasbon', 'koperasi'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'profil' ? 'Profil & Biodata' : 
             tab === 'payroll' ? 'Gaji & Payroll' : 
             tab === 'kasbon' ? 'Data Kasbon' : 'Simpanan Koperasi'}
          </button>
        ))}
      </div>

      {/* Konten Tab Aktif */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {activeTab === 'profil' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Kolom Kiri: Profil Singkat & Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 overflow-hidden relative transition-colors">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-90"></div>
            
            <div className="relative flex flex-col items-center mt-6">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-lg mb-4 text-emerald-600 text-3xl font-black uppercase">
                {pegawai.namaLengkap ? pegawai.namaLengkap.substring(0, 2) : "PG"}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center">{pegawai.namaLengkap}</h2>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3">{pegawai.posisi}</p>
              
              <span className={`px-4 py-1.5 text-xs font-bold rounded-full border ${getStatusColor(pegawai.statusPegawai)}`}>
                {pegawai.statusPegawai}
              </span>
            </div>

            <div className="mt-8 space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">NIP</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{pegawai.nip}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Penempatan</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {pegawai.penempatan === 'MARKAZ' ? (pegawai.markaz ? pegawai.markaz.nama : 'Markaz') : 'Direktorat Pusat'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mulai Bekerja</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {pegawai.tanggalMasuk ? new Date(pegawai.tanggalMasuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Kartu Status Tautan Akun */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
              Tautan Akun Sistem
            </h3>
            
            {pegawai.user ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">Terhubung ke Akun Portal</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Email: {pegawai.user.email}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Semua data log aktivitas pegawai ini akan saling tersinkronisasi otomatis.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <span className="text-2xl mb-2 block">🔗</span>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Belum Punya Akun</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Pegawai ini belum ditautkan ke akun login manapun di dalam portal admin MQBS.</p>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Rincian Data */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-colors h-full">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
              Biodata & Identitas Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Nomor Induk Kependudukan</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">{pegawai.nik || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Jenis Kelamin</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {pegawai.jenisKelamin === 'LAKI_LAKI' ? 'Laki-Laki' : 'Perempuan'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Tempat Lahir</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">{pegawai.tempatLahir || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Tanggal Lahir</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {pegawai.tanggalLahir ? new Date(pegawai.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">No Handphone / WhatsApp</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">{pegawai.noHp || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Alamat Email</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">{pegawai.email || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Alamat Lengkap (Domisili)</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed min-h-[80px]">
                  {pegawai.alamat || "-"}
                </p>
              </div>
              <div className="md:col-span-2 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">Informasi Tempat Tinggal</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Tinggal di Komplek?</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {pegawai.tinggalDiKomplek ? (
                        <span className="flex items-center gap-1.5 text-emerald-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Ya</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg> Tidak</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Markaz</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">{pegawai.domisiliMarkaz || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Jarak Rumah (Km)</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">{pegawai.jarakRumah ? `${pegawai.jarakRumah} Km` : "-"}</p>
                  </div>
                </div>
              </div>

              {/* Riwayat Pendidikan */}
              <div className="md:col-span-2 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-lg">🎓</span>
                  Riwayat Pendidikan
                </h4>
                {(!pegawai.pendidikan || pegawai.pendidikan.length === 0) ? (
                  <p className="text-sm text-slate-500 italic">Belum ada riwayat pendidikan yang ditambahkan.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pegawai.pendidikan.map((p) => (
                      <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden">
                        {p.isTerakhir && (
                          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl">Terakhir</div>
                        )}
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{p.tingkat} - {p.institusi}</p>
                        {p.jurusan && <p className="text-xs text-slate-500 mt-1">Jurusan: {p.jurusan}</p>}
                        {p.tahunLulus && <p className="text-xs text-slate-500 mt-1">Lulus Tahun: {p.tahunLulus}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Berkas */}
              <div className="md:col-span-2 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-lg">📁</span>
                  Data Berkas
                </h4>
                
                {(!pegawai.berkas || pegawai.berkas.length === 0) ? (
                  <p className="text-sm text-slate-500 italic mb-4">Belum ada data berkas yang diunggah.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {pegawai.berkas.map((b) => (
                      <div key={b.id} className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.jenis}</p>
                            <a href={process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}${b.fileUrl}` : b.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:underline truncate block">Lihat File</a>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteBerkas(b.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition" title="Hapus Berkas">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleUploadBerkas} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">Unggah Berkas Baru</h5>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select required value={jenisBerkas} onChange={(e) => setJenisBerkas(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-sm w-full sm:w-auto">
                      <option value="KTP">KTP</option>
                      <option value="KK">Kartu Keluarga (KK)</option>
                      <option value="IJAZAH">Ijazah</option>
                      <option value="SERTIFIKAT">Sertifikat</option>
                      <option value="BUKU_NIKAH">Buku Nikah</option>
                    </select>
                    <input type="file" required onChange={(e) => setBerkasFile(e.target.files[0])} className="text-sm flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-500/20 dark:file:text-blue-400" />
                    <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-500/30 transition disabled:opacity-50 whitespace-nowrap">
                      {uploading ? 'Mengunggah...' : 'Unggah'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Terakhir diupdate: {new Date(pegawai.updatedAt).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

          </div>
        )}

        {activeTab === 'payroll' && <TabPayroll />}
        {activeTab === 'kasbon' && <TabKasbon />}
        {activeTab === 'koperasi' && <TabKoperasi />}
        
      </div>
    </div>
  );
}
