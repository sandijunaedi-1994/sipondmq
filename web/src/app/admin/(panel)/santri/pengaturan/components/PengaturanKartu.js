"use client";

import { useState, useEffect, useRef } from "react";

export default function PengaturanKartu() {
  const [santriList, setSantriList] = useState([]);
  const [markazList, setMarkazList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterMarkaz, setFilterMarkaz] = useState("SEMUA");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'INPUT', 'REPLACE', 'HISTORY'
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [formData, setFormData] = useState({ nomorKartu: "", nomorKartuBaru: "", alasan: "" });
  const [saving, setSaving] = useState(false);
  const [riwayat, setRiwayat] = useState([]);
  const inputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      
      // Fetch Markaz
      if (markazList.length === 0) {
        const resMarkaz = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/markaz`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resMarkaz.ok) {
          const data = await resMarkaz.json();
          setMarkazList(data.markaz);
        }
      }

      // Fetch Kartu Santri
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri-settings/kartu?`;
      if (filterMarkaz !== "SEMUA") url += `markazId=${filterMarkaz}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      
      const resKartu = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resKartu.ok) {
        const data = await resKartu.json();
        setSantriList(data.santri);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only refetch on markaz change, search requires manual trigger or debounced
    const timeout = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timeout);
  }, [filterMarkaz, searchQuery]);

  // Focus input automatically when modal opens for scanner
  useEffect(() => {
    if (activeModal === 'INPUT' || activeModal === 'REPLACE') {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [activeModal]);

  const openInputModal = (santri) => {
    setSelectedSantri(santri);
    setFormData({ nomorKartu: "", nomorKartuBaru: "", alasan: "" });
    setActiveModal('INPUT');
  };

  const openReplaceModal = (santri) => {
    setSelectedSantri(santri);
    setFormData({ nomorKartu: "", nomorKartuBaru: "", alasan: "" });
    setActiveModal('REPLACE');
  };

  const openHistoryModal = (santri) => {
    setSelectedSantri(santri);
    setRiwayat(santri.kartuSantri?.riwayat || []);
    setActiveModal('HISTORY');
  };

  const handleToggleStatus = async (santriId, currentStatus) => {
    if (!confirm(`Apakah Anda yakin ingin ${currentStatus ? 'me-nonaktifkan' : 'mengaktifkan'} kartu ini?`)) return;
    
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri-settings/kartu/${santriId}/toggle`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ aktif: !currentStatus })
      });
      
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal mengubah status kartu");
      }
    } catch (error) {
      console.error("Error toggle status:", error);
    }
  };

  const handleInputSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri-settings/kartu`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          santriId: selectedSantri.id,
          nomorKartu: formData.nomorKartu
        })
      });
      
      if (res.ok) {
        setActiveModal(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal mendaftarkan kartu");
      }
    } catch (error) {
      console.error("Error register kartu:", error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri-settings/kartu/${selectedSantri.id}/replace`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          nomorKartuBaru: formData.nomorKartuBaru,
          alasan: formData.alasan
        })
      });
      
      if (res.ok) {
        setActiveModal(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal mengganti kartu");
      }
    } catch (error) {
      console.error("Error replace kartu:", error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  // Helper to mask card number
  const maskCard = (num) => {
    if (!num) return "-";
    if (num.length <= 4) return "****";
    return "*".repeat(num.length - 4) + num.slice(-4);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Manajemen Kartu Santri</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Hubungkan kartu fisik (RFID/Barcode) dengan data santri.</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select 
          value={filterMarkaz}
          onChange={(e) => setFilterMarkaz(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="SEMUA">Semua Markaz</option>
          {markazList.map(m => (
            <option key={m.id} value={m.id}>{m.nama}</option>
          ))}
        </select>
        
        <input 
          type="text"
          placeholder="Cari nama santri..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="overflow-x-auto pb-24">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nama Santri</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Markaz & Kelas</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tahun Masuk</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Status Kartu</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Riwayat</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">Memuat data...</td>
              </tr>
            ) : santriList.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">Tidak ada santri ditemukan.</td>
              </tr>
            ) : (
              santriList.map(s => {
                const hasCard = !!s.kartuSantri;
                const isCardActive = s.kartuSantri?.aktif;
                const historyCount = s.kartuSantri?.riwayat?.length || 0;

                return (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {s.registration?.studentName}
                      <div className="text-xs font-normal text-slate-500 mt-1">NIS: {s.nis || '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {s.markaz?.kode || '-'} <br/>
                      <span className="text-xs">{s.kelasRef?.nama || s.kelas || '-'}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{s.tahunMasuk || s.registration?.academicYear}</td>
                    
                    <td className="py-3 px-4 text-center">
                      {!hasCard ? (
                        <span className="inline-block px-2 py-1 text-[10px] font-bold rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          BELUM ADA
                        </span>
                      ) : (
                        <div>
                          <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded ${isCardActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'}`}>
                            {isCardActive ? 'AKTIF' : 'NONAKTIF'}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">{maskCard(s.kartuSantri.nomorKartu)}</div>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {hasCard && (
                        <button 
                          onClick={() => openHistoryModal(s)}
                          className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
                        >
                          {historyCount} kali ganti
                        </button>
                      )}
                    </td>
                    
                    <td className="py-3 px-4 text-right space-x-2">
                      {!hasCard ? (
                        <button onClick={() => openInputModal(s)} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 text-sm font-medium">Input Kartu</button>
                      ) : (
                        <>
                          <button onClick={() => openReplaceModal(s)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Ganti Kartu</button>
                          <button onClick={() => handleToggleStatus(s.id, isCardActive)} className={`${isCardActive ? 'text-red-500 hover:text-red-700' : 'text-emerald-500 hover:text-emerald-700'} text-sm font-medium`}>
                            {isCardActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL INPUT KARTU BARU */}
      {activeModal === 'INPUT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-700/50 w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  Daftarkan Kartu Santri
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Santri: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedSantri?.registration?.studentName}</span></p>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInputSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">
                  Tunggu Kursor & Scan Kartu Menggunakan Mesin
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    ref={inputRef}
                    placeholder="Scan kartu disini..."
                    value={formData.nomorKartu}
                    onChange={(e) => setFormData({...formData, nomorKartu: e.target.value})}
                    className="w-full px-4 py-4 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center tracking-[1em] text-lg focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                    autoComplete="off"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-emerald-500 animate-pulse">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center mt-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                  Pastikan kursor berada di kolom teks, lalu tap kartu ke mesin pemindai.
                </p>
              </div>

              <div className="pt-6 pb-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors font-bold text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving || !formData.nomorKartu}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Kartu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GANTI KARTU */}
      {activeModal === 'REPLACE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-700/50 w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  Penggantian Kartu
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Santri: <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedSantri?.registration?.studentName}</span></p>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReplaceSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan Penggantian <span className="text-red-500">*</span>
                </label>
                <select 
                  required
                  value={formData.alasan}
                  onChange={(e) => setFormData({...formData, alasan: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="">Pilih alasan...</option>
                  <option value="Hilang">Hilang</option>
                  <option value="Rusak/Patah">Rusak / Patah</option>
                  <option value="Chip Tidak Terbaca">Chip Tidak Terbaca</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 mt-4 text-center">
                  Scan Kartu BARU <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    ref={inputRef}
                    placeholder="Scan kartu pengganti..."
                    value={formData.nomorKartuBaru}
                    onChange={(e) => setFormData({...formData, nomorKartuBaru: e.target.value})}
                    className="w-full px-4 py-4 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center tracking-[1em] text-lg focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                    autoComplete="off"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-blue-500 animate-pulse">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                  </div>
                </div>
              </div>

              <div className="pt-6 pb-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors font-bold text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving || !formData.nomorKartuBaru || !formData.alasan}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
                >
                  {saving ? 'Memproses...' : 'Ganti Kartu Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RIWAYAT */}
      {activeModal === 'HISTORY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-700/50 w-full max-w-lg overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  Riwayat Penggantian Kartu
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Santri: <span className="font-bold">{selectedSantri?.registration?.studentName}</span></p>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
              {riwayat.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Belum ada riwayat penggantian kartu.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {riwayat.map((r, i) => (
                    <div key={r.id} className="relative pl-6 pb-4 border-l-2 border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                      <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1 ring-4 ring-white dark:ring-slate-900"></div>
                      <div className="text-xs text-slate-400 mb-1">
                        {new Date(r.tanggalGanti).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                          Alasan: {r.alasan}
                        </p>
                        <p className="text-xs text-slate-500">
                          Kartu Lama: <span className="font-mono">{maskCard(r.nomorKartuLama)}</span>
                        </p>
                        {r.diurusOleh?.namaLengkap && (
                          <p className="text-xs text-slate-500 mt-1">
                            Diurus oleh: {r.diurusOleh.namaLengkap}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors font-bold text-sm"
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
