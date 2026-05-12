"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SantriAktifPage() {
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMarkaz, setFilterMarkaz] = useState("SEMUA");
  const [markazList, setMarkazList] = useState([]);
  const [search, setSearch] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Delete & Update Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  
  // Generate NIS State
  const [generateNisModalOpen, setGenerateNisModalOpen] = useState(false);
  const [generateNisForm, setGenerateNisForm] = useState({ academicYear: "2026/2027", program: "SMP", overwriteExisting: false });
  const [generateNisLoading, setGenerateNisLoading] = useState(false);
  const [generateNisResult, setGenerateNisResult] = useState(null);
  
  useEffect(() => {
    fetchSantri();
  }, [filterMarkaz]);

  const fetchSantri = async (searchQuery = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri`);
      if (filterMarkaz !== "SEMUA") url.searchParams.append("markazId", filterMarkaz);
      if (searchQuery) url.searchParams.append("search", searchQuery);
      
      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSantriList(data.santri);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMarkaz = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/markaz`, {
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSantri(search);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri/import`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setImportResult(data);
      if (data.success) {
        fetchSantri();
      }
    } catch (err) {
      setImportResult({ success: false, message: 'Gagal menghubungi server', errors: [err.message] });
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteClick = (santri) => {
    setDeleteTarget(santri);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSantri = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeleteModalOpen(false);
        setDeleteSuccessModalOpen(true);
        fetchSantri();
      } else {
        alert(data.message || "Terjadi kesalahan saat menghapus");
      }
    } catch (err) {
      alert("Kesalahan jaringan");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGenerateNis = async (e) => {
    e.preventDefault();
    setGenerateNisLoading(true);
    setGenerateNisResult(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri/generate-nis`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(generateNisForm)
      });
      const data = await res.json();
      setGenerateNisResult(data);
      if (data.success) {
        fetchSantri(); // refresh list
      }
    } catch (error) {
      setGenerateNisResult({ success: false, message: "Kesalahan jaringan" });
    } finally {
      setGenerateNisLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">Manajemen Santri Aktif</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Daftar seluruh santri yang berstatus aktif di institusi.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setGenerateNisModalOpen(true); setGenerateNisResult(null); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Generate NIS Massal
          </button>
          <button 
            onClick={() => { setShowImportModal(true); setImportResult(null); setImportFile(null); }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row justify-between gap-4 transition-colors">
          <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Cari nama santri atau NIS..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:max-w-md px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
            />
            <select 
              value={filterMarkaz}
              onChange={(e) => {
                setFilterMarkaz(e.target.value);
                // Trigger fetch on change via useEffect or we can just fetchSantri immediately
                // However, state update is async, so we'll just add it to useEffect dependency if we wanted.
                // But since fetchSantri uses filterMarkaz from state, it might not have updated yet if called here.
              }}
              className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            >
              <option value="SEMUA">Semua Markaz</option>
              {markazList.map(m => (
                <option key={m.id} value={m.id}>{m.nama} ({m.kode})</option>
              ))}
            </select>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition">
              Cari & Filter
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-wider transition-colors">
              <tr>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Nama Santri</th>
                <th className="px-6 py-4">Program / Kelas</th>
                <th className="px-6 py-4">Markaz</th>
                <th className="px-6 py-4">Asrama</th>
                <th className="px-6 py-4">Wali Santri (Hubungan)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 transition-colors">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : santriList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 transition-colors">
                    Belum ada data santri aktif.
                  </td>
                </tr>
              ) : (
                santriList.map(santri => (
                  <tr key={santri.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 transition-colors">{santri.nis || "-"}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{santri.registration?.studentName}</p>
                      <span className="inline-block px-2 py-0.5 mt-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">
                        {santri.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 transition-colors">{santri.registration?.program}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">Kelas: {santri.kelas || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] rounded border border-slate-200 dark:border-slate-800 transition-colors">
                        {santri.markaz?.kode || santri.registration?.markaz?.kode || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 transition-colors">{santri.asrama || "-"}</td>
                    <td className="px-6 py-4">
                      {santri.waliSantri && santri.waliSantri.length > 0 ? (
                        <div className="space-y-2">
                          {santri.waliSantri.map(wali => (
                            <div key={wali.id} className="text-xs">
                              <p className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{wali.user?.namaLengkap || wali.user?.email || "Tanpa Nama"}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase
                                  ${wali.hubungan === 'AYAH' ? 'bg-blue-100 text-blue-700' : 
                                    wali.hubungan === 'IBU' ? 'bg-pink-100 text-pink-700' : 'bg-slate-200 text-slate-700 dark:text-slate-200'}
                                 transition-colors`}>
                                  {wali.hubungan}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 transition-colors">{wali.user?.phone || "-"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum ada wali</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/admin/santri/data/${santri.id}`}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <button 
                          onClick={() => setUpdateModalOpen(true)}
                          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(santri)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-lg transition-colors"
                          title="Hapus Permanen"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL IMPORT CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 transition-colors">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 transition-colors">Import Data Santri (CSV)</h3>
              <button 
                onClick={() => !importing && setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 text-sm text-slate-600 dark:text-slate-300 space-y-2 transition-colors">
                <p>Upload file CSV yang berisi data santri aktif. Pastikan kolom-kolom berikut tersedia dengan penulisan header yang sama persis:</p>
                <ul className="list-disc pl-5 font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                  <li>NIS</li>
                  <li>Nama Santri (Wajib)</li>
                  <li>Jenis Kelamin (L/P)</li>
                  <li>Program</li>
                  <li>Tahun Ajaran</li>
                  <li>Kode Markaz</li>
                  <li>Kelas</li>
                  <li>Asrama</li>
                  <li>Tahun Masuk</li>
                  <li>Nama Wali</li>
                  <li>No HP Wali (Wajib)</li>
                  <li>Hubungan Wali (AYAH/IBU/WALI)</li>
                </ul>
              </div>

              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 transition-colors">Pilih File (.csv)</label>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 dark:bg-emerald-500/10 file:text-emerald-700 hover:file:bg-emerald-100 transition"
                    disabled={importing}
                  />
                </div>

                {importResult && (
                  <div className={`p-4 rounded-xl text-sm ${importResult.success ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'} transition-colors`}>
                    <p className="font-bold mb-1">{importResult.message}</p>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 mt-2 text-xs opacity-80 max-h-32 overflow-y-auto">
                        {importResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                  <button 
                    type="button" 
                    onClick={() => setShowImportModal(false)}
                    disabled={importing}
                    className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition disabled:opacity-50"
                  >
                    Tutup
                  </button>
                  <button 
                    type="submit" 
                    disabled={importing || !importFile}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {importing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Memproses...
                      </>
                    ) : 'Upload & Import'}
                  </button>
                </div>
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
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Hapus Data Santri?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                Apakah Anda yakin ingin menghapus permanen data santri aktif <strong>{deleteTarget.registration?.studentName}</strong>? Sistem akan menolak jika santri ini sudah memiliki riwayat akademik atau keuangan.
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
                  onClick={confirmDeleteSantri}
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
                Data santri aktif telah dihapus dari sistem.
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

      {/* ── Update Placeholder Modal ── */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Fitur Menyusul</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Fitur Update (Lulus, Naik Kelas, Keluar) sedang dalam tahap pengembangan dan akan segera hadir!
              </p>
              <button 
                onClick={() => setUpdateModalOpen(false)}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Generate NIS Massal Modal ── */}
      {generateNisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
              <h3 className="text-lg font-black text-blue-800 dark:text-blue-300">Generate NIS Massal</h3>
              <button onClick={() => !generateNisLoading && setGenerateNisModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Sistem akan membuatkan NIS secara otomatis (berurutan) berdasarkan <strong>abjad nama santri (A-Z)</strong> pada tahun ajaran dan program yang dipilih.
              </p>

              <form onSubmit={handleGenerateNis} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tahun Ajaran</label>
                  <input 
                    type="text" 
                    value={generateNisForm.academicYear}
                    onChange={(e) => setGenerateNisForm({...generateNisForm, academicYear: e.target.value})}
                    placeholder="Contoh: 2026/2027"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Program</label>
                  <select 
                    value={generateNisForm.program}
                    onChange={(e) => setGenerateNisForm({...generateNisForm, program: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 bg-white dark:bg-slate-950"
                  >
                    <option value="SMP">SMP (07)</option>
                    <option value="SMA">SMA (03)</option>
                    <option value="MAHAD_ALY">Mahad Aly (04)</option>
                    <option value="SD">SD (02)</option>
                    <option value="TK">TK (01)</option>
                  </select>
                </div>
                
                <label className="flex items-start gap-2 mt-4 cursor-pointer p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                  <input 
                    type="checkbox" 
                    checked={generateNisForm.overwriteExisting}
                    onChange={(e) => setGenerateNisForm({...generateNisForm, overwriteExisting: e.target.checked})}
                    className="mt-1"
                  />
                  <span className="text-xs text-red-700 dark:text-red-400">
                    <strong>Timpa NIS Lama</strong> <br/> (Hati-hati: Jika dicentang, semua santri di program ini akan diurutkan ulang dan NIS lamanya akan terganti).
                  </span>
                </label>

                {generateNisResult && (
                  <div className={`p-3 rounded-lg text-sm mt-4 ${generateNisResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {generateNisResult.message}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setGenerateNisModalOpen(false)} 
                    disabled={generateNisLoading}
                    className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Tutup
                  </button>
                  <button 
                    type="submit"
                    disabled={generateNisLoading}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generateNisLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Generate Sekarang'}
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
