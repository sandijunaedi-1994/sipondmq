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
  
  useEffect(() => {
    fetchSantri();
  }, [filterMarkaz]);

  const fetchSantri = async (searchQuery = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/santri`);
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
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/santri/import', {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">Manajemen Santri Aktif</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Daftar seluruh santri yang berstatus aktif di institusi.</p>
        </div>
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
                      <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition">
                        Detail
                      </button>
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
    </div>
  );
}
