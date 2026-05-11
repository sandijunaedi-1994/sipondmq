"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export default function AdminPPDBPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("SEMUA");
  const [filterMarkaz, setFilterMarkaz] = useState("SEMUA");
  const [markazList, setMarkazList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // For the input field
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalData: 0, limit: 20 });
  const [permissions, setPermissions] = useState([]);

  // Check-in modal states
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [offlineCode, setOfflineCode] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);

  // Offline Register states
  const [offlineRegModalOpen, setOfflineRegModalOpen] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [offlineRegForm, setOfflineRegForm] = useState({
    studentName: "", whatsapp: "", email: "", program: "", 
    academicYear: "", gender: "Laki-laki", source: "Facebook",
    previousSchool: "", motivation: "", sudahBayarRegistrasi: false, isLanjutan: false
  });
  const [offlineRegLoading, setOfflineRegLoading] = useState(false);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", 20);
      url.searchParams.append("status", filterStatus);
      if (filterMarkaz !== "SEMUA") url.searchParams.append("markazId", filterMarkaz);
      if (searchQuery) url.searchParams.append("search", searchQuery);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Error fetching list", err);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterMarkaz, searchQuery]);

  useEffect(() => {
    const fetchMarkaz = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/markaz`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMarkazList(data.markaz || []);
        }
      } catch (err) {
        console.error("Error fetching markaz", err);
      }
    };
    fetchMarkaz();
  }, []);

  useEffect(() => {
    setPermissions(JSON.parse(localStorage.getItem("admin_permissions") || "[]"));
    fetchList();
    
    // Fetch academic years
    const fetchAcademicYears = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/academic-years`);
        if (res.ok) {
          const data = await res.json();
          setAcademicYears(data);
          if (data.length > 0) {
            setOfflineRegForm(prev => ({ ...prev, academicYear: data[0].nama }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch academic years", err);
        setAcademicYears([{ nama: "2026/2027" }]); // Fallback
        setOfflineRegForm(prev => ({ ...prev, academicYear: "2026/2027" }));
      }
    };
    fetchAcademicYears();
  }, [fetchList]);

  const handleResetPassword = async (id, studentName) => {
    if (!confirm(`Apakah Anda yakin ingin mereset password untuk peserta ${studentName} menjadi mqbs2026?`)) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}/reset-password`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Password berhasil direset menjadi mqbs2026");
      } else {
        const data = await res.json();
        alert(`Gagal: ${data.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      alert("Kesalahan jaringan");
    }
  };

  const handleDeleteRegistration = (id, studentName) => {
    setDeleteTarget({ id, studentName });
    setDeleteModalOpen(true);
  };

  const confirmDeleteRegistration = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/ppdb/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setDeleteSuccessModalOpen(true);
        fetchList();
      } else {
        const data = await res.json();
        alert(`Gagal: ${data.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      alert("Kesalahan jaringan");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!offlineCode.trim()) return;
    setCheckInLoading(true);
    setCheckInResult(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ offlineCode })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckInResult({ type: "success", message: data.message, studentName: data.studentName, time: data.time });
        setOfflineCode("");
        fetchList(); // Refresh list to reflect attendance changes
      } else {
        setCheckInResult({ type: "error", message: data.message });
      }
    } catch (err) {
      console.error(err);
      setCheckInResult({ type: "error", message: "Terjadi kesalahan saat memproses check-in" });
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleOfflineRegister = async (e) => {
    e.preventDefault();
    setOfflineRegLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const payload = { ...offlineRegForm };
      if (payload.program === 'SMA' && payload.isLanjutan) {
        payload.previousSchool = "SMP Madinatul Qur'an (Lanjutan Internal)";
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/offline-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setOfflineRegModalOpen(false);
        setOfflineRegForm({ studentName: "", whatsapp: "", email: "", program: "", academicYear: academicYears.length > 0 ? academicYears[0].nama : "2026/2027", gender: "Laki-laki", source: "Facebook", previousSchool: "", motivation: "", sudahBayarRegistrasi: false, isLanjutan: false });
        fetchList();
      } else {
        const data = await res.json();
        alert(`Gagal: ${data.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setOfflineRegLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    setSearchQuery(searchInput);
  };

  // Reset page to 1 when changing status filter
  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDAFTARAN': return "bg-slate-100 text-slate-600 border-slate-200";
      case 'PEMBAYARAN_REGISTRASI': return "bg-orange-50 text-orange-600 border-orange-200";
      case 'KELENGKAPAN_DATA': return "bg-amber-50 text-amber-600 border-amber-200";
      case 'TES_WAWANCARA': return "bg-purple-50 text-purple-600 border-purple-200";
      case 'PENGUMUMAN': return "bg-blue-50 text-blue-600 border-blue-200";
      case 'DAFTAR_ULANG': return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case 'SELESAI': return "bg-emerald-500 text-white border-emerald-600";
      case 'DITOLAK': return "bg-red-50 text-red-600 border-red-200";
      case 'TIDAK_LANJUT_BAYAR_REGISTRASI': 
      case 'TIDAK_LANJUT_TES':
      case 'TIDAK_LANJUT_DAFTAR_ULANG':
      case 'TIDAK_LANJUT_JADI_SANTRI':
      case 'NO_LEAD_DOUBLE':
        return "bg-slate-100 text-slate-500 border-slate-300";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Header & Filters */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-950/50 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Daftar Pendaftar SPMB</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Total {pagination.totalData} pendaftaran ditemukan.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {permissions.includes("PPDB") && (
            <>
              <button onClick={() => setOfflineRegModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 border border-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Tambah Pendaftar
              </button>
              <button onClick={() => { setCheckInModalOpen(true); setCheckInResult(null); setOfflineCode(""); }} className="w-full sm:w-auto px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 border border-emerald-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" /><path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" /></svg>
                Check-in Tes
              </button>
            </>
          )}

          <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Cari nama atau no. HP..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button type="submit" className="hidden"></button>
          </form>

          <select 
            value={filterMarkaz}
            onChange={(e) => { setFilterMarkaz(e.target.value); setPage(1); }}
            className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          >
            <option value="SEMUA">Semua Markaz</option>
            {markazList.map(m => (
              <option key={m.id} value={m.id}>{m.nama} ({m.kode})</option>
            ))}
          </select>

          <select 
            value={filterStatus}
            onChange={handleStatusChange}
            className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="PENDAFTARAN">Pendaftaran</option>
            <option value="PEMBAYARAN_REGISTRASI">Pembayaran Registrasi</option>
            <option value="KELENGKAPAN_DATA">Kelengkapan Data</option>
            <option value="TES_WAWANCARA">Tes & Wawancara</option>
            <option value="PENGUMUMAN">Pengumuman</option>
            <option value="DAFTAR_ULANG">Daftar Ulang</option>
            <option value="SELESAI">Lulus (Selesai)</option>
            <option value="DITOLAK">Ditolak</option>
            <optgroup label="Pengunduran Diri">
              <option value="TIDAK_LANJUT_BAYAR_REGISTRASI">Batal - Bayar Registrasi</option>
              <option value="TIDAK_LANJUT_TES">Batal - Tes & Wawancara</option>
              <option value="TIDAK_LANJUT_DAFTAR_ULANG">Batal - Daftar Ulang</option>
              <option value="TIDAK_LANJUT_JADI_SANTRI">Batal - Jadi Santri</option>
              <option value="NO_LEAD_DOUBLE">Batal - No Lead / Double</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center transition-colors">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] shadow-sm transition-colors">
            <tr>
              <th className="px-6 py-4">Pendaftar</th>
              <th className="px-6 py-4">Markaz</th>
              <th className="px-6 py-4">Kontak Wali</th>
              <th className="px-6 py-4">Program</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Tanggal Daftar</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrations.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-slate-500 dark:text-slate-400 transition-colors">
                  <div className="flex flex-col items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p>Tidak ada data ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs transition-colors">
                        {(reg.studentName || reg.registrationData?.nickname || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{reg.studentName || "Belum diisi"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{reg.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] rounded border border-slate-200 dark:border-slate-800 transition-colors">
                      {reg.markaz?.kode || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 transition-colors">{reg.user?.phone || '-'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{reg.user?.email || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700 dark:text-slate-200 transition-colors">{reg.program}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase transition-colors">{reg.academicYear}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusBadge(reg.status)}`}>
                      {reg.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors">
                    {new Date(reg.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/ppdb/peserta/${reg.id}`} className="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 text-slate-600 dark:text-slate-300 hover:text-white transition-colors p-2 rounded-lg" title="Lihat Detail">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </Link>
                      <button onClick={() => handleResetPassword(reg.id, reg.studentName || 'Peserta')} className="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 text-slate-600 dark:text-slate-300 hover:text-white transition-colors p-2 rounded-lg" title="Reset Password">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-5.257A4.01 4.01 0 014.743 14l5.514-5.514A6 6 0 0115 5z" /></svg>
                      </button>
                      {permissions.includes("MANAJEMEN_ADMIN") && (
                        <button onClick={() => handleDeleteRegistration(reg.id, reg.studentName || 'Peserta')} className="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-red-500 text-slate-600 dark:text-slate-300 hover:text-white transition-colors p-2 rounded-lg" title="Hapus Permanen">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
            Halaman {page} dari {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                // Show sliding window of pages
                let pageNum = page;
                if (page <= 3) pageNum = i + 1;
                else if (page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                else pageNum = page - 2 + i;
                
                if (pageNum < 1 || pageNum > pagination.totalPages) return null;

                return (
                  <button 
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${page === pageNum ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      {checkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-100 transition-transform">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">Check-in Tes Offline</h3>
              <button onClick={() => setCheckInModalOpen(false)} className="text-slate-400 hover:text-red-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              {checkInResult && (
                <div className={`mb-6 p-4 rounded-xl text-sm border flex flex-col gap-1 ${
                  checkInResult.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                } transition-colors`}>
                  <p className="font-bold text-base">{checkInResult.message}</p>
                  {checkInResult.studentName && <p>Calon Santri: <strong>{checkInResult.studentName}</strong></p>}
                  {checkInResult.time && <p>Waktu Hadir: {new Date(checkInResult.time).toLocaleString('id-ID')}</p>}
                </div>
              )}

              <form onSubmit={handleCheckIn} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Kode Tiket (5 Digit)</label>
                  <input 
                    type="text" 
                    value={offlineCode}
                    onChange={(e) => setOfflineCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: A8K2X"
                    maxLength={5}
                    className="w-full text-center tracking-[0.5em] font-black text-3xl uppercase p-4 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all"
                    required
                    autoFocus
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={checkInLoading || offlineCode.length !== 5}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition mt-2"
                >
                  {checkInLoading ? 'Memproses...' : 'Verifikasi Check-in'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Offline Registration Modal */}
      {offlineRegModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh] transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 flex-shrink-0 transition-colors">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors">Tambah Pendaftar Offline</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Bypass pendaftaran tanpa melalui website publik.</p>
              </div>
              <button onClick={() => setOfflineRegModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:bg-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleOfflineRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 transition-colors">Nama Lengkap Anak</label>
                <input 
                  type="text" 
                  required
                  value={offlineRegForm.studentName}
                  onChange={e => setOfflineRegForm({...offlineRegForm, studentName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                  placeholder="Misal: Ahmad Fulan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 transition-colors">No WhatsApp Orang Tua</label>
                  <input 
                    type="text" 
                    required
                    value={offlineRegForm.whatsapp}
                    onChange={e => setOfflineRegForm({...offlineRegForm, whatsapp: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                    placeholder="Misal: 081234567890"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Digunakan sebagai Email Login sementara & Password (mqbs2026).</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 transition-colors">Email (Opsional)</label>
                  <input 
                    type="email" 
                    value={offlineRegForm.email}
                    onChange={e => setOfflineRegForm({...offlineRegForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                    placeholder="Misal: ortu@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 ml-1 transition-colors">Tahun Ajaran <span className="text-red-500">*</span></label>
                  <select
                    value={offlineRegForm.academicYear}
                    onChange={e => setOfflineRegForm({...offlineRegForm, academicYear: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                  >
                    {academicYears.length > 0 ? academicYears.map(ta => (
                      <option key={ta.id || ta.nama} value={ta.nama}>{ta.nama}</option>
                    )) : (
                      <option value="2026/2027">2026/2027</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 transition-colors">Jenis Kelamin</label>
                  <select 
                    value={offlineRegForm.gender}
                    onChange={e => setOfflineRegForm({...offlineRegForm, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 transition-colors">Program</label>
                <select 
                  required
                  value={offlineRegForm.program}
                  onChange={e => setOfflineRegForm({...offlineRegForm, program: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                >
                  <option value="">Pilih...</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="MAHAD_ALY">Ma'had Aly</option>
                </select>
              </div>
              {offlineRegForm.program === 'SMA' && (
                <label className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer mb-4 mt-2">
                  <input 
                    type="checkbox" 
                    checked={offlineRegForm.isLanjutan}
                    onChange={e => setOfflineRegForm({...offlineRegForm, isLanjutan: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500" 
                  />
                  <span className="text-sm font-semibold text-blue-800">SMA Lanjutan dari SMP MQ (Centang jika Ya)</span>
                </label>
              )}

              <div className="grid grid-cols-2 gap-4">
                {!(offlineRegForm.program === 'SMA' && offlineRegForm.isLanjutan) ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 transition-colors">Asal Sekolah</label>
                    <input 
                      type="text" 
                      required
                      value={offlineRegForm.previousSchool}
                      onChange={e => setOfflineRegForm({...offlineRegForm, previousSchool: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                    />
                  </div>
                ) : (
                  <div></div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 transition-colors">Sumber Info</label>
                  <select 
                    value={offlineRegForm.source}
                    onChange={e => setOfflineRegForm({...offlineRegForm, source: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Google Search / Website Resmi">Google Search / Website Resmi</option>
                    <option value="Rekomendasi Guru / Alumni / Keluarga">Rekomendasi Guru / Alumni / Keluarga</option>
                    <option value="Iklan Banner / Brosur / Spanduk">Iklan Banner / Brosur / Spanduk</option>
                    <option value="Event / Sosialisasi Sekolah">Event / Sosialisasi Sekolah</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 transition-colors">Alasan Memilih MQ</label>
                <textarea 
                  required 
                  rows={2}
                  value={offlineRegForm.motivation}
                  onChange={e => setOfflineRegForm({...offlineRegForm, motivation: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                ></textarea>
              </div>

              <label className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer mt-4">
                <input 
                  type="checkbox" 
                  checked={offlineRegForm.sudahBayarRegistrasi}
                  onChange={e => setOfflineRegForm({...offlineRegForm, sudahBayarRegistrasi: e.target.checked})}
                  className="w-5 h-5 text-amber-500 rounded border-amber-300 focus:ring-amber-500" 
                />
                <span className="text-sm font-semibold text-amber-800">Telah membayar registrasi (Rp 300.000) tunai / langsung</span>
              </label>

              <button 
                type="submit" 
                disabled={offlineRegLoading}
                className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all"
              >
                {offlineRegLoading ? "Memproses..." : "Tambahkan Pendaftar"}
              </button>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Hapus Data Peserta?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                Apakah Anda yakin ingin menghapus permanen data <strong>{deleteTarget.studentName}</strong>? Tindakan ini tidak dapat dibatalkan dan seluruh data (dokumen, ujian, riwayat pembayaran) akan ikut terhapus.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModalOpen(false)} 
                  disabled={deleteLoading}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDeleteRegistration}
                  disabled={deleteLoading}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menghapus...
                    </>
                  ) : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Success Modal ── */}
      {deleteSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Berhasil Dihapus</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Data peserta dan seluruh riwayatnya telah dihapus dari sistem.
              </p>
              <button 
                onClick={() => setDeleteSuccessModalOpen(false)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-colors"
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
