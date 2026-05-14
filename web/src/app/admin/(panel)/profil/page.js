"use client";

import { useState, useEffect, useRef } from "react";
import { User, Briefcase, MapPin, Phone, Mail, Award, Users, BookOpen, Clock, Building, Wallet, Receipt, Landmark, X, FileText, CheckCircle2, ChevronRight, Eye, EyeOff } from "lucide-react";
import Swal from 'sweetalert2';

export default function ProfilPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showMoney, setShowMoney] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai/me/foto`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        throw new Error("Gagal mengunggah foto profil");
      }

      const result = await res.json();
      // Update local state directly so image shows without full refresh
      setData(prev => {
        if (!prev || !prev.pegawai) return prev;
        return {
          ...prev,
          pegawai: {
            ...prev.pegawai,
            fotoUrl: result.fotoUrl
          }
        };
      });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Foto profil berhasil diunggah!',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-2xl',
          title: 'text-slate-800 dark:text-slate-100',
        }
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: err.message || 'Gagal mengunggah foto profil',
        customClass: {
          popup: 'rounded-2xl',
        }
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowSalaryModal(false);
    };
    if (showSalaryModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSalaryModal]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          throw new Error("Gagal mengambil data profil");
        }
        
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors w-full min-w-0 flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors w-full min-w-0">
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-500/20 text-center">
          {error}
        </div>
      </div>
    );
  }

  const pegawai = data?.pegawai;
  const hierarchy = data?.hierarchy;

  const supervisors = hierarchy?.supervisors || [];
  const subordinates = hierarchy?.subordinates || [];

  return (
    <div className="space-y-6 w-full min-w-0">
      
      {/* Kartu Utama Profil */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-500 relative">
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 mix-blend-overlay"></div>
        </div>
        
        <div className="px-6 pb-6 relative">
          {/* Avatar Area */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-end -mt-12 sm:-mt-16 mb-4">
            <div 
              onClick={handleAvatarClick}
              className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 z-10 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity group"
            >
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <span className="text-white text-xs font-bold">Ubah Foto</span>
              </div>
              
              {isUploadingAvatar ? (
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin z-10"></div>
              ) : pegawai?.fotoUrl ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${pegawai.fotoUrl}`} 
                  alt={pegawai.namaLengkap} 
                  className="w-full h-full object-cover"
                />
              ) : pegawai ? (
                <span className="text-3xl sm:text-4xl font-black">{pegawai.namaLengkap.charAt(0).toUpperCase()}</span>
              ) : (
                <User size={48} strokeWidth={1.5} />
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/jpeg, image/png, image/jpg" 
              className="hidden" 
            />
            
            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0">
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                {pegawai ? pegawai.namaLengkap : hierarchy?.namaLengkap || "Belum ada data Pegawai"}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  {pegawai ? pegawai.posisi : "Staff"}
                </span>
                {pegawai?.statusPegawai && (
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/50">
                    {pegawai.statusPegawai}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Details Grid */}
          {pegawai ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
                  <Award size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NIP / NIK</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{pegawai.nip} {pegawai.nik ? `/ ${pegawai.nik}` : ""}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
                  <Building size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penempatan</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {pegawai.penempatan === 'MARKAZ' ? (pegawai.markaz?.nama || 'Markaz') : 'Direktorat Pusat'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kontak</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{pegawai.noHp || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={pegawai.email}>{pegawai.email || "-"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 text-sm flex items-center justify-center text-center">
              Data profil kepegawaian Anda belum ditautkan. Hubungi admin SDM untuk menautkan akun Anda dengan data kepegawaian.
            </div>
          )}
        </div>
      </div>

      {/* Section Keuangan (Mockup) */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Wallet size={20} className="text-emerald-500" /> Informasi Keuangan
        </h3>
        <button 
          onClick={() => setShowMoney(!showMoney)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          {showMoney ? <EyeOff size={14} /> : <Eye size={14} />}
          {showMoney ? "Sembunyikan" : "Tampilkan"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        
        {/* Card Gaji */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800/30 p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl"></div>
          
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Wallet size={16} strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gaji Bulan Ini</h3>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">April 2026</span>
          </div>
          
          <div className="mt-3">
            <p className="text-2xl lg:text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
              {showMoney ? <><span className="text-lg opacity-70 mr-1">Rp</span>0</> : "••••••••"}
            </p>
          </div>
          
          <button 
            onClick={() => setShowSalaryModal(true)}
            className="mt-4 w-full flex items-center justify-between bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-emerald-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-colors group-hover:border-emerald-300 dark:group-hover:border-emerald-600"
          >
            <span>Lihat Riwayat Lengkap</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Card Kasbon */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-800/30 p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-2xl"></div>
          
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Receipt size={16} strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sisa Kasbon</h3>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-2xl lg:text-3xl font-black text-rose-700 dark:text-rose-400 tracking-tight">
              {showMoney ? <><span className="text-lg opacity-70 mr-1">Rp</span>0</> : "••••••"}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-rose-200/50 dark:border-rose-800/30 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Batas Maksimal</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{showMoney ? "Rp 0" : "••••••"}</span>
          </div>
        </div>

        {/* Card Koperasi */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800/30 p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl"></div>
          
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Landmark size={16} strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saldo Koperasi</h3>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-2xl lg:text-3xl font-black text-indigo-700 dark:text-indigo-400 tracking-tight">
              {showMoney ? <><span className="text-lg opacity-70 mr-1">Rp</span>0</> : "••••••••"}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-indigo-200/50 dark:border-indigo-800/30 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Bagi Hasil YTD</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{showMoney ? "+Rp 0" : "••••"}</span>
          </div>
        </div>

      </div>

      {/* Grid 2 Kolom untuk Hirarki & Fitur Akademik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kolom Kiri: Hirarki */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 transition-colors">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Users size={20} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Struktur & Hierarki</h3>
          </div>

          <div className="space-y-6">
            {/* Atasan */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Atasan Langsung</h4>
              {supervisors.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {supervisors.map((sup, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {sup.supervisor?.namaLengkap?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{sup.supervisor?.namaLengkap}</p>
                        <p className="text-[10px] font-medium text-slate-500">{sup.supervisor?.role?.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  Tidak ada data atasan
                </div>
              )}
            </div>

            {/* Bawahan */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Bawahan / Tim Anda</h4>
              {subordinates.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {subordinates.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {sub.subordinate?.namaLengkap?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{sub.subordinate?.namaLengkap}</p>
                        <p className="text-[10px] font-medium text-slate-500">{sub.subordinate?.role?.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  Tidak ada anggota tim
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Akademik & Penugasan (Placeholder) */}
        <div className="space-y-6">
          {/* Card Wali Kelas */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">Segera Hadir</span>
              <p className="text-xs text-slate-500 font-medium mt-2">Fitur sedang dalam pengembangan</p>
            </div>
            
            <div className="flex items-center gap-2 mb-4 opacity-70">
              <BookOpen size={20} className="text-emerald-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Data Wali Kelas</h3>
            </div>
            <div className="space-y-3 opacity-50">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Kelas Asuh</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Kelas 7 - Abu Bakar</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Jumlah Santri</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">32 Santri</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>

          {/* Card Jadwal Mengajar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 transition-colors relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">Segera Hadir</span>
              <p className="text-xs text-slate-500 font-medium mt-2">Modul Akademik sedang disiapkan</p>
            </div>
            
            <div className="flex items-center gap-2 mb-4 opacity-70">
              <Clock size={20} className="text-rose-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Jadwal Mengajar</h3>
            </div>
            
            <div className="space-y-3 opacity-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-12 text-center shrink-0">
                    <p className="text-[10px] font-bold text-slate-400">0{i + 7}:00</p>
                  </div>
                  <div className="flex-1 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Tahfidz & Tahsin</p>
                    <p className="text-[10px] text-slate-500">Kelas 7 - Halqah {i}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>

      {/* Modal Riwayat Gaji */}
      {showSalaryModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowSalaryModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Wallet size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">Riwayat Gaji</h3>
                  <p className="text-xs text-slate-500 font-medium">Tahun 2026</p>
                </div>
              </div>
              <button onClick={() => setShowSalaryModal(false)} className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-4">
                {[].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${item.isLatest ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} relative overflow-hidden group transition-all hover:shadow-md`}>
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.bulan} {item.tahun}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Diterima pada {item.date}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        <CheckCircle2 size={12} strokeWidth={3} />
                        {item.status}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        {showMoney ? (
                          <>
                            <span className="text-xs text-slate-400 font-bold mr-1">Rp</span>
                            {item.nominal}
                          </>
                        ) : (
                          "••••••••"
                        )}
                      </div>
                      <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
                        <FileText size={14} /> Slip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <button 
                onClick={() => setShowSalaryModal(false)}
                className="w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
