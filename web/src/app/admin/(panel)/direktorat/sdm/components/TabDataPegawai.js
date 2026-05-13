"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TabDataPegawai() {
  const router = useRouter();
  const [pegawaiList, setPegawaiList] = useState([]);
  const [stats, setStats] = useState({ total: 0, tetap: 0, kontrak: 0, pusat: 0, markaz: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterPenempatan, setFilterPenempatan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit, link
  const [currentPegawai, setCurrentPegawai] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dependencies
  const [markazList, setMarkazList] = useState([]);
  const [userList, setUserList] = useState([]);

  // Form State
  const initialForm = {
    nip: "",
    namaLengkap: "",
    jenisKelamin: "LAKI_LAKI",
    nik: "",
    noHp: "",
    email: "",
    tempatLahir: "",
    tanggalLahir: "",
    alamat: "",
    posisi: "",
    penempatan: "DIREKTORAT_PUSAT",
    markazId: "",
    statusPegawai: "KONTRAK",
    tanggalMasuk: "",
    tinggalDiKomplek: false,
    domisiliMarkaz: "",
    jarakRumah: ""
  };
  const [formData, setFormData] = useState(initialForm);
  const [linkUserId, setLinkUserId] = useState("");

  useEffect(() => {
    fetchData();
  }, [search, filterPenempatan, filterStatus, page]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      // Fetch Markaz (We can use health santri endpoint or portal app endpoints. Let's assume there's a way to get markaz, if not we'll use a mocked list or fetch from an existing markaz endpoint)
      // Since Markaz is usually fetched from /api/admin/santri/markaz if it exists.
      // Fetch Users
      const resUsers = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUserList(data.admins || []);
      }
    } catch (err) {
      console.error("Gagal mengambil dependensi:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const query = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(filterPenempatan && { penempatan: filterPenempatan }),
        ...(filterStatus && { statusPegawai: filterStatus })
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal mengambil data pegawai");

      setPegawaiList(data.data);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, pegawai = null) => {
    setModalMode(mode);
    setError(null);
    if (mode === 'add') {
      setFormData(initialForm);
    } else if (mode === 'edit' && pegawai) {
      setCurrentPegawai(pegawai);
      setFormData({
        nip: pegawai.nip,
        namaLengkap: pegawai.namaLengkap,
        jenisKelamin: pegawai.jenisKelamin,
        nik: pegawai.nik || "",
        noHp: pegawai.noHp || "",
        email: pegawai.email || "",
        tempatLahir: pegawai.tempatLahir || "",
        tanggalLahir: pegawai.tanggalLahir ? pegawai.tanggalLahir.split('T')[0] : "",
        alamat: pegawai.alamat || "",
        posisi: pegawai.posisi,
        penempatan: pegawai.penempatan,
        markazId: pegawai.markazId || "",
        statusPegawai: pegawai.statusPegawai,
        tanggalMasuk: pegawai.tanggalMasuk ? pegawai.tanggalMasuk.split('T')[0] : "",
        tinggalDiKomplek: pegawai.tinggalDiKomplek || false,
        domisiliMarkaz: pegawai.domisiliMarkaz || "",
        jarakRumah: pegawai.jarakRumah || ""
      });
    } else if (mode === 'link' && pegawai) {
      setCurrentPegawai(pegawai);
      setLinkUserId(pegawai.userId || "");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("admin_token");
      const url = modalMode === 'edit' 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai/${currentPegawai.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai`;
      
      const res = await fetch(url, {
        method: modalMode === 'edit' ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan data pegawai");

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai/${currentPegawai.id}/link`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: linkUserId || null })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menautkan akun");

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data pegawai ${nama}?`)) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menghapus data");
      }

      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Pegawai</h2>
        </div>
        <button 
          onClick={() => handleOpenModal('add')} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Tambah Pegawai Baru
        </button>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">👥</div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Pegawai</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">🔰</div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Pegawai Tetap</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.tetap}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl">🏢</div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Penempatan Pusat</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.pusat}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">🏫</div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Penempatan Markaz</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.markaz}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96 flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white"
          />
        </div>
        <div className="w-full flex gap-4">
          <select
            value={filterPenempatan}
            onChange={(e) => setFilterPenempatan(e.target.value)}
            className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
          >
            <option value="">Semua Penempatan</option>
            <option value="DIREKTORAT_PUSAT">Direktorat Pusat</option>
            <option value="MARKAZ">Markaz</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
          >
            <option value="">Semua Status</option>
            <option value="TETAP">Pegawai Tetap</option>
            <option value="KONTRAK">Pegawai Kontrak</option>
            <option value="MAGANG">Magang</option>
            <option value="BERHENTI">Berhenti</option>
          </select>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Profil Pegawai</th>
                <th className="px-6 py-4">Jabatan & Penempatan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Akun Sistem</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-500">Memuat data...</td></tr>
              ) : pegawaiList.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-500">Tidak ada data pegawai yang ditemukan.</td></tr>
              ) : (
                pegawaiList.map(pegawai => (
                  <tr key={pegawai.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                          {pegawai.namaLengkap.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{pegawai.namaLengkap}</p>
                          <p className="text-[11px] text-slate-500 font-medium">NIP: {pegawai.nip}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 dark:text-slate-200">{pegawai.posisi}</p>
                      <p className="text-[11px] text-slate-500">
                        {pegawai.penempatan === 'MARKAZ' ? (pegawai.markaz ? pegawai.markaz.nama : 'Markaz Tidak Diketahui') : 'Direktorat Pusat'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                        pegawai.statusPegawai === 'TETAP' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        pegawai.statusPegawai === 'KONTRAK' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        pegawai.statusPegawai === 'MAGANG' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {pegawai.statusPegawai}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {pegawai.user ? (
                        <div className="flex flex-col items-center">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mb-1"></span>
                          <span className="text-[10px] font-bold text-emerald-600">Tertaut</span>
                        </div>
                      ) : (
                        <button onClick={() => handleOpenModal('link', pegawai)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                          Tautkan Akun
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/sdm/pegawai/${pegawai.id}`} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition" title="Lihat Detail Profil">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        </Link>
                        <button onClick={() => handleOpenModal('edit', pegawai)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition" title="Edit Pegawai">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                        {pegawai.user && (
                          <button onClick={() => handleOpenModal('link', pegawai)} className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition" title="Kelola Tautan Akun">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                          </button>
                        )}
                        <button onClick={() => handleDelete(pegawai.id, pegawai.namaLengkap)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-50 text-slate-700 dark:text-slate-300"
            >
              Sebelumnya
            </button>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Halaman {page} dari {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-50 text-slate-700 dark:text-slate-300"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl my-8 transition-colors border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {modalMode === 'add' ? 'Tambah Data Pegawai Baru' : 'Edit Data Pegawai'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm border border-red-200">{error}</div>}
              
              <form id="pegawai-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Informasi Kepegawaian</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">NIP (Nomor Induk Pegawai) *</label>
                      <input required type="text" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Posisi / Jabatan *</label>
                      <input required type="text" placeholder="Cth: Pengajar Tahfidz" value={formData.posisi} onChange={e => setFormData({...formData, posisi: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Penempatan *</label>
                      <select required value={formData.penempatan} onChange={e => setFormData({...formData, penempatan: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white">
                        <option value="DIREKTORAT_PUSAT">Direktorat Pusat</option>
                        <option value="MARKAZ">Markaz Cabang</option>
                      </select>
                    </div>
                    {formData.penempatan === 'MARKAZ' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">ID Markaz (Sesuai Database) *</label>
                        <input required type="number" placeholder="Cth: 1" value={formData.markazId} onChange={e => setFormData({...formData, markazId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Status Kepegawaian *</label>
                      <select required value={formData.statusPegawai} onChange={e => setFormData({...formData, statusPegawai: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white">
                        <option value="TETAP">Pegawai Tetap</option>
                        <option value="KONTRAK">Pegawai Kontrak</option>
                        <option value="MAGANG">Magang</option>
                        <option value="BERHENTI">Berhenti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Tanggal Masuk Bekerja</label>
                      <input type="date" value={formData.tanggalMasuk} onChange={e => setFormData({...formData, tanggalMasuk: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 mt-6">Domisili & Tempat Tinggal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Tinggal di Komplek Pesantren? *</label>
                      <select required value={formData.tinggalDiKomplek ? "true" : "false"} onChange={e => setFormData({...formData, tinggalDiKomplek: e.target.value === "true"})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white">
                        <option value="false">Tidak</option>
                        <option value="true">Ya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Markaz (Tempat Tinggal)</label>
                      <input type="text" placeholder="Cth: Markaz Al-Furqon" value={formData.domisiliMarkaz} onChange={e => setFormData({...formData, domisiliMarkaz: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Jarak Rumah (Km)</label>
                      <input type="number" step="0.1" placeholder="Cth: 2.5" value={formData.jarakRumah} onChange={e => setFormData({...formData, jarakRumah: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 mt-6">Biodata Personal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Nama Lengkap Sesuai KTP *</label>
                      <input required type="text" value={formData.namaLengkap} onChange={e => setFormData({...formData, namaLengkap: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Jenis Kelamin *</label>
                      <select required value={formData.jenisKelamin} onChange={e => setFormData({...formData, jenisKelamin: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white">
                        <option value="LAKI_LAKI">Laki-Laki</option>
                        <option value="PEREMPUAN">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Nomor Induk Kependudukan (NIK)</label>
                      <input type="text" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Tempat Lahir</label>
                      <input type="text" value={formData.tempatLahir} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Tanggal Lahir</label>
                      <input type="date" value={formData.tanggalLahir} onChange={e => setFormData({...formData, tanggalLahir: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Nomor Telepon / WhatsApp</label>
                      <input type="text" value={formData.noHp} onChange={e => setFormData({...formData, noHp: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Email Aktif</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Alamat Lengkap</label>
                      <textarea rows="3" value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm custom-scrollbar dark:text-white"></textarea>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950 rounded-b-2xl">
              <button disabled={isSubmitting} type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">Batal</button>
              <button disabled={isSubmitting} type="submit" form="pegawai-form" className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30 transition disabled:opacity-50">
                {isSubmitting ? "Menyimpan..." : "Simpan Data Pegawai"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tautkan Akun */}
      {isModalOpen && modalMode === 'link' && currentPegawai && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md my-8 transition-colors border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Tautkan ke Akun Portal</h3>
              <p className="text-xs text-slate-500">Profil: <span className="font-bold text-emerald-600">{currentPegawai.namaLengkap}</span></p>
            </div>
            
            <div className="p-6">
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl font-medium text-xs border border-red-200">{error}</div>}
              
              <form id="link-form" onSubmit={handleLinkAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Pilih Akun Login Administrator</label>
                  <select 
                    value={linkUserId} 
                    onChange={e => setLinkUserId(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white"
                  >
                    <option value="">-- Kosongkan untuk melepas tautan --</option>
                    {userList.map(u => (
                      <option key={u.id} value={u.id}>{u.namaLengkap} ({u.email})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    Menautkan profil ini dengan akun portal memungkinkan sistem untuk mensinkronkan aktivitas pegawai (seperti log kehadiran dan tugas) secara terpadu.
                  </p>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950 rounded-b-2xl">
              <button disabled={isSubmitting} type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">Batal</button>
              <button disabled={isSubmitting} type="submit" form="link-form" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/30 transition disabled:opacity-50">
                {isSubmitting ? "Memproses..." : "Simpan Tautan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
