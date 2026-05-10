"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function KesehatanSantriPage() {
  const [santriList, setSantriList] = useState([]);
  const [filteredSantri, setFilteredSantri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: "PENGECEKAN_BERKALA",
    date: new Date().toISOString().split("T")[0],
    title: "",
    description: "",
    handledBy: ""
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchSantri();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredSantri(santriList.filter(s => 
        s.registration?.namaLengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis?.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredSantri(santriList);
    }
  }, [searchQuery, santriList]);

  const fetchSantri = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/health/santri`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSantriList(data.santri || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openHealthModal = async (santri) => {
    setSelectedSantri(santri);
    setIsModalOpen(true);
    setIsFormOpen(false);
    await fetchRecords(santri.id);
  };

  const fetchRecords = async (santriId) => {
    try {
      setLoadingRecords(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/health/${santriId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setHealthRecords(data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/health/${selectedSantri.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsFormOpen(false);
        setFormData({
          type: "PENGECEKAN_BERKALA",
          date: new Date().toISOString().split("T")[0],
          title: "",
          description: "",
          handledBy: ""
        });
        fetchRecords(selectedSantri.id);
      } else {
        alert("Gagal menyimpan riwayat");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan");
    }
  };

  const handleDelete = async (recordId) => {
    if (!confirm("Hapus riwayat ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/health/record/${recordId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRecords(selectedSantri.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'SAKIT': return 'bg-red-50 text-red-600 border-red-200';
      case 'PERAWATAN': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'PENGAMBILAN_OBAT': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'RUJUKAN': return 'bg-purple-50 text-purple-600 border-purple-200';
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-200'; // PENGECEKAN_BERKALA
    }
  };

  const formatType = (type) => {
    return type.replace(/_/g, ' ');
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-slate-200 rounded-2xl w-full"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Kesehatan Santri (UKS)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Kelola data riwayat medis dan kesehatan harian santri aktif.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Cari nama atau NIS..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm focus:border-emerald-500 outline-none transition-colors"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSantri.map(santri => (
          <div key={santri.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-emerald-300 transition cursor-pointer" onClick={() => openHealthModal(santri)}>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
              {santri.registration?.namaLengkap?.substring(0,2).toUpperCase() || "?"}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate transition-colors">{santri.registration?.namaLengkap}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{santri.nis || "NIS Belum Ada"} • {santri.kelas || "Kelas Belum Ditentukan"}</p>
            </div>
          </div>
        ))}
        {filteredSantri.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            Tidak ada santri yang ditemukan.
          </div>
        )}
      </div>

      {isModalOpen && selectedSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">Riwayat Kesehatan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">{selectedSantri.registration?.namaLengkap} ({selectedSantri.nis})</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-600 dark:text-slate-300 rounded-full transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!isFormOpen ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200 transition-colors">Catatan Medis</h4>
                    <button onClick={() => setIsFormOpen(true)} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 font-bold text-xs rounded-lg transition flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                      Tambah Riwayat
                    </button>
                  </div>

                  {loadingRecords ? (
                    <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : healthRecords.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl transition-colors">
                      Belum ada riwayat kesehatan untuk santri ini.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8 pb-4 transition-colors">
                      {healthRecords.map(record => (
                        <div key={record.id} className="relative pl-6">
                          <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${getTypeStyle(record.type).split(' ')[0]}`}></div>
                          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getTypeStyle(record.type)}`}>
                                  {formatType(record.type)}
                                </span>
                                <h5 className="font-bold text-slate-800 dark:text-slate-100 mt-2 text-sm transition-colors">{record.title}</h5>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
                                  {new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <button onClick={() => handleDelete(record.id)} className="text-slate-400 hover:text-red-500 transition" title="Hapus Riwayat">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                              </div>
                            </div>
                            {record.description && <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 transition-colors">{record.description}</p>}
                            {record.handledBy && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Ditangani oleh: <span className="font-medium text-slate-700 dark:text-slate-200 transition-colors">{record.handledBy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200 transition-colors">Form Tambah Riwayat</h4>
                    <button type="button" onClick={() => setIsFormOpen(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-200 transition-colors">Batal</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 transition-colors">Tanggal</label>
                      <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm focus:border-emerald-500 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 transition-colors">Jenis Layanan</label>
                      <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm focus:border-emerald-500 outline-none transition-colors">
                        <option value="PENGECEKAN_BERKALA">Pengecekan Berkala</option>
                        <option value="SAKIT">Sakit</option>
                        <option value="PERAWATAN">Perawatan (Rawat Inap/Jalan)</option>
                        <option value="PENGAMBILAN_OBAT">Pengambilan Obat</option>
                        <option value="RUJUKAN">Rujukan (RS/Klinik)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 transition-colors">Judul / Keluhan Utama</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Demam ringan, Pengecekan gigi bulanan" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm focus:border-emerald-500 outline-none transition-colors" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 transition-colors">Keterangan / Tindakan</label>
                    <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detail keluhan atau tindakan yang diberikan..." className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm focus:border-emerald-500 outline-none resize-none transition-colors"></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 transition-colors">Ditangani Oleh</label>
                    <input type="text" value={formData.handledBy} onChange={e => setFormData({...formData, handledBy: e.target.value})} placeholder="Nama dokter, perawat, atau staf UKS" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm focus:border-emerald-500 outline-none transition-colors" />
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-md shadow-emerald-500/20">
                      Simpan Riwayat
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
