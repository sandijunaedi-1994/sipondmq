"use client";

import { useState, useEffect } from "react";

const REQUIRED_DOCS = [
  { type: 'KK', label: 'Kartu Keluarga' },
  { type: 'KTP_AYAH', label: 'KTP Ayah' },
  { type: 'KTP_IBU', label: 'KTP Ibu' },
  { type: 'AKTA', label: 'Akta Kelahiran' },
  { type: 'IJAZAH', label: 'Ijazah / SKL' },
  { type: 'FOTO', label: 'Pas Foto' },
  { type: 'SURAT_SEHAT', label: 'Surat Sehat' },
  { type: 'SKKB', label: 'SKKB' }
];

export default function KelengkapanBerkasSantriPage() {
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMarkaz, setFilterMarkaz] = useState("SEMUA");
  const [markazList, setMarkazList] = useState([]);
  const [search, setSearch] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSantri();
  }, [filterMarkaz, page]);

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

  const fetchSantri = async (searchQuery = search) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", 20);
      if (filterMarkaz !== "SEMUA") url.searchParams.append("markazId", filterMarkaz);
      if (searchQuery) url.searchParams.append("search", searchQuery);
      
      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSantriList(data.santri || []);
        if (data.pagination) setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSantri(search);
  };

  const openVerificationModal = (santri) => {
    setSelectedSantri(santri);
    setIsModalOpen(true);
  };

  const handleDocumentAction = async (docId, actionStatus, notes = '') => {
    if (!selectedSantri || !selectedSantri.id) return;
    
    // registrationId is the same as santri.id in this system design
    const registrationId = selectedSantri.id;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/ppdb/${registrationId}/document/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: actionStatus, notes })
      });
      const data = await res.json();
      if (res.ok) {
        // Update local state instead of refetching the whole list immediately
        const updatedSantri = { ...selectedSantri };
        const docIndex = updatedSantri.registration.documents.findIndex(d => d.id === docId);
        if (docIndex !== -1) {
          updatedSantri.registration.documents[docIndex].status = actionStatus;
          updatedSantri.registration.documents[docIndex].notes = notes;
        }
        setSelectedSantri(updatedSantri);
        
        // Also update the list silently
        setSantriList(prev => prev.map(s => s.id === updatedSantri.id ? updatedSantri : s));
      } else {
        alert(data.message || 'Gagal mengubah status dokumen');
      }
    } catch (error) {
      alert('Kesalahan jaringan');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">Kelengkapan Berkas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Pantau dan verifikasi kelengkapan dokumen persyaratan santri aktif.</p>
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
              className="w-full md:max-w-md px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors dark:bg-slate-900 dark:text-slate-100"
            />
            <select 
              value={filterMarkaz}
              onChange={(e) => {
                setFilterMarkaz(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            >
              <option value="SEMUA">Semua Markaz</option>
              {markazList.map(m => (
                <option key={m.id} value={m.id}>{m.nama} ({m.kode})</option>
              ))}
            </select>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition shadow-sm">
              Cari & Filter
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-wider transition-colors border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Profil Santri</th>
                <th className="px-6 py-4">Program & Markaz</th>
                <th className="px-6 py-4">Progress Kelengkapan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">Memuat data santri...</span>
                    </div>
                  </td>
                </tr>
              ) : santriList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada data santri ditemukan.
                  </td>
                </tr>
              ) : (
                santriList.map((santri) => {
                  const documents = santri.registration?.documents || [];
                  const acceptedDocsCount = documents.filter(d => d.status === 'DITERIMA').length;
                  const isComplete = acceptedDocsCount === REQUIRED_DOCS.length;
                  const progressPercentage = Math.round((acceptedDocsCount / REQUIRED_DOCS.length) * 100);

                  return (
                    <tr key={santri.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {santri.registration?.studentName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">{santri.registration?.studentName}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{santri.nis || "BELUM ADA NIS"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700 dark:text-slate-200 text-xs mb-1">{santri.registration?.program}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{santri.markaz?.nama || "-"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className={isComplete ? "text-emerald-600" : "text-slate-600 dark:text-slate-300"}>
                              {acceptedDocsCount} / {REQUIRED_DOCS.length} Diterima
                            </span>
                            <span className={isComplete ? "text-emerald-600" : "text-blue-600 dark:text-blue-400"}>{progressPercentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          {acceptedDocsCount > 0 && !isComplete && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-500 italic mt-0.5">Menunggu kelengkapan / verifikasi</p>
                          )}
                          {isComplete && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 italic mt-0.5 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              Berkas Komplit
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => openVerificationModal(santri)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/30 dark:hover:border-blue-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                          Cek & Verifikasi
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info & Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600 dark:text-slate-400 transition-colors">
          <p>Menampilkan halaman {page} dari {totalPages || 1}</p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(p => p - 1)} 
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
            >
              Sebelumnya
            </button>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => p + 1)} 
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Verifikasi Berkas */}
      {isModalOpen && selectedSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col scale-100 transition-transform">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div>
                <h3 className="font-black text-xl text-slate-800 dark:text-slate-100">Verifikasi Dokumen: {selectedSantri.registration?.studentName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">NIS: {selectedSantri.nis || "-"} • Program: {selectedSantri.registration?.program}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950 custom-scrollbar">
              <div className="grid lg:grid-cols-2 gap-4">
                {REQUIRED_DOCS.map(reqDoc => {
                  const uploaded = selectedSantri.registration?.documents?.find(d => d.type === reqDoc.type);
                  
                  return (
                    <div key={reqDoc.type} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl transition-colors shadow-sm hover:shadow-md group">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
                          {reqDoc.label}
                          {uploaded?.status === 'DITERIMA' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          )}
                        </h4>
                        {!uploaded ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">BELUM UPLOAD</span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            uploaded.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700' :
                            uploaded.status === 'DITOLAK' || uploaded.status === 'REVISI' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {uploaded.status}
                          </span>
                        )}
                      </div>
                      
                      {uploaded ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <a href={uploaded.fileUrl} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg text-xs font-bold text-center transition flex items-center justify-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              Lihat Berkas
                            </a>
                            {uploaded.status !== 'DITERIMA' && (
                              <button 
                                onClick={() => handleDocumentAction(uploaded.id, 'DITERIMA')} 
                                disabled={actionLoading}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 shadow-sm shadow-emerald-500/20"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                Terima
                              </button>
                            )}
                          </div>
                          
                          {uploaded.notes && (
                            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg">
                              <p className="text-[10px] font-bold text-red-800 dark:text-red-400 uppercase mb-1">Catatan Penolakan / Revisi:</p>
                              <p className="text-xs text-red-600 dark:text-red-300 italic">"{uploaded.notes}"</p>
                            </div>
                          )}

                          {(uploaded.status === 'PENDING' || uploaded.status === 'DITERIMA') && (
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                              <button 
                                onClick={() => {
                                  const reason = prompt(`Masukkan alasan penolakan/revisi untuk ${reqDoc.label}:`);
                                  if (reason) handleDocumentAction(uploaded.id, 'REVISI', reason);
                                }} 
                                disabled={actionLoading}
                                className="text-xs font-semibold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition flex items-center gap-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                Tolak / Minta Revisi Berkas
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Berkas belum diunggah</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition shadow-sm"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
