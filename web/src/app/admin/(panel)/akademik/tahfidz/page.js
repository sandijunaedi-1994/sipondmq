"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Users, Plus, Edit2, Trash2, FileText, Search, ChevronLeft, Clock } from "lucide-react";
import SantriTahfidzModule from "../../santri/data/[id]/components/SantriTahfidzModule";

export default function ManajemenTahfidzPage() {
  const [activeTab, setActiveTab] = useState("halaqoh"); // halaqoh, santri, hafalan
  
  // Data
  const [halaqohList, setHalaqohList] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [markazList, setMarkazList] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [globalHafalan, setGlobalHafalan] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Halaqoh
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    muhaffidzId: "",
    markazId: "",
    aktif: true
  });

  // Santri Tab
  const [searchSantri, setSearchSantri] = useState("");
  const [selectedSantri, setSelectedSantri] = useState(null);

  // Hafalan Tab
  const [hafalanForm, setHafalanForm] = useState({
    santriId: "",
    tanggal: new Date().toISOString().split('T')[0],
    targetHal: "",
    capaianHal: "",
    totalJuz: "",
    keterangan: ""
  });
  const [searchHafalanSantri, setSearchHafalanSantri] = useState("");
  const [showSantriDropdown, setShowSantriDropdown] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchData();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resHalaqoh, resPegawai, resMarkaz, resSantri, resHafalan] = await Promise.all([
        fetch(`${apiUrl}/api/admin/halaqoh`, { headers }),
        fetch(`${apiUrl}/api/admin/sdm/pegawai`, { headers }),
        fetch(`${apiUrl}/api/admin/markaz`, { headers }),
        fetch(`${apiUrl}/api/admin/santri`, { headers }),
        fetch(`${apiUrl}/api/admin/tahfidz/hafalan`, { headers }) // global hafalan
      ]);

      const dataHalaqoh = await resHalaqoh.json();
      const dataPegawai = await resPegawai.json();
      const dataMarkaz = await resMarkaz.json();
      const dataSantri = await resSantri.json();
      const dataHafalan = await resHafalan.json();

      if (dataHalaqoh.success) setHalaqohList(dataHalaqoh.halaqoh);
      if (dataPegawai.success) setPegawaiList(dataPegawai.pegawai);
      if (dataMarkaz.success) setMarkazList(dataMarkaz.markaz || dataMarkaz.data || []);
      if (dataSantri.success) setSantriList(dataSantri.santri || []);
      if (dataHafalan.success) setGlobalHafalan(dataHafalan.hafalan || []);
    } catch (err) {
      alert("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalHafalan = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${apiUrl}/api/admin/tahfidz/hafalan`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      if (data.success) {
        setGlobalHafalan(data.hafalan || []);
      }
    } catch (err) {}
  };

  const handleSaveHalaqoh = async (e) => {
    e.preventDefault();
    if (!formData.nama) return alert("Nama halaqoh harus diisi");

    try {
      const token = localStorage.getItem("admin_token");
      const url = editingId 
        ? `${apiUrl}/api/admin/halaqoh/${editingId}`
        : `${apiUrl}/api/admin/halaqoh`;
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowModal(false);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
  };

  const handleDeleteHalaqoh = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus halaqoh ini?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${apiUrl}/api/admin/halaqoh/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
  };

  const submitHafalan = async (e) => {
    e.preventDefault();
    if (!hafalanForm.santriId) return alert("Pilih santri terlebih dahulu");
    if (!hafalanForm.targetHal || !hafalanForm.capaianHal) return alert("Target dan Capaian wajib diisi");

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${apiUrl}/api/admin/tahfidz/hafalan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(hafalanForm)
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        // Reset form except date
        setHafalanForm({
          ...hafalanForm,
          targetHal: "",
          capaianHal: "",
          totalJuz: "",
          keterangan: "",
          santriId: ""
        });
        setSearchHafalanSantri("");
        fetchGlobalHafalan();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  const openFormHalaqoh = (h = null) => {
    if (h) {
      setEditingId(h.id);
      setFormData({
        nama: h.nama,
        muhaffidzId: h.muhaffidzId || "",
        markazId: h.markazId || "",
        aktif: h.aktif
      });
    } else {
      setEditingId(null);
      setFormData({
        nama: "",
        muhaffidzId: "",
        markazId: "",
        aktif: true
      });
    }
    setShowModal(true);
  };

  const filteredSantri = santriList.filter(s => {
    const term = searchSantri.toLowerCase();
    const nama = s.registration?.studentName?.toLowerCase() || "";
    const nis = s.nis?.toLowerCase() || "";
    return nama.includes(term) || nis.includes(term);
  });

  const filteredHafalanSantri = santriList.filter(s => {
    const term = searchHafalanSantri.toLowerCase();
    const nama = s.registration?.studentName?.toLowerCase() || "";
    const nis = s.nis?.toLowerCase() || "";
    return nama.includes(term) || nis.includes(term);
  });

  const getSelectedSantriName = () => {
    if (!hafalanForm.santriId) return "";
    const s = santriList.find(x => x.id === hafalanForm.santriId);
    return s ? `${s.registration?.studentName} (${s.nis})` : "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="text-teal-500" /> Manajemen Tahfidz
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola data halaqoh, progress tahapan, dan capaian hafalan harian santri.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "halaqoh", label: "Daftar Halaqoh", icon: <Users size={18} /> },
          { id: "santri", label: "Progress Tahapan", icon: <FileText size={18} /> },
          { id: "hafalan", label: "Input Hafalan Harian", icon: <Clock size={18} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== "santri") setSelectedSantri(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400"
                : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Halaqoh */}
      {activeTab === "halaqoh" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">Data Halaqoh</h2>
            <button
              onClick={() => openFormHalaqoh()}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              <Plus size={16} /> Tambah Halaqoh
            </button>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama Halaqoh</th>
                  <th className="px-6 py-4">Markaz</th>
                  <th className="px-6 py-4">Muhaffidz / Pengampu</th>
                  <th className="px-6 py-4 text-center">Jml Santri</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-10 text-slate-500">Memuat data...</td>
                  </tr>
                ) : halaqohList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-10 text-slate-500">Belum ada data halaqoh.</td>
                  </tr>
                ) : (
                  halaqohList.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{h.nama}</td>
                      <td className="px-6 py-4">{h.markaz?.nama || <span className="text-slate-400 italic">-</span>}</td>
                      <td className="px-6 py-4">{h.muhaffidz?.namaLengkap || <span className="text-slate-400 italic">Belum ditentukan</span>}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-xs">
                          {h._count.santri}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${h.aktif ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                          {h.aktif ? "Aktif" : "Non-Aktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openFormHalaqoh(h)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteHalaqoh(h.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg dark:bg-red-500/10 dark:hover:bg-red-500/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Progress Santri (Tahapan) */}
      {activeTab === "santri" && (
        <div className="space-y-4">
          {!selectedSantri ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="font-bold text-slate-800 dark:text-white">Pilih Santri untuk Update Tahapan</h2>
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Cari nama / NIS..."
                    value={searchSantri}
                    onChange={e => setSearchSantri(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {loading ? (
                  <div className="col-span-full p-8 text-center text-slate-500">Memuat data santri...</div>
                ) : filteredSantri.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">Tidak ada santri ditemukan.</div>
                ) : (
                  filteredSantri.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedSantri(s)}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md cursor-pointer transition-all bg-white dark:bg-slate-900 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0">
                        {s.registration?.studentName?.charAt(0) || "-"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{s.registration?.studentName}</p>
                        <p className="text-xs text-slate-500">{s.nis || "No NIS"} • {s.kelas?.nama || "No Kelas"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => setSelectedSantri(null)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <ChevronLeft size={16} /> Kembali ke Daftar Santri
              </button>
              
              <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedSantri.registration?.studentName?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">{selectedSantri.registration?.studentName}</h2>
                  <p className="text-sm text-slate-500">{selectedSantri.nis} • {selectedSantri.kelas?.nama}</p>
                </div>
              </div>

              {/* Panggil Module Tahapan (editable) */}
              <SantriTahfidzModule santriId={selectedSantri.id} isEditable={true} />
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Hafalan Harian Global */}
      {activeTab === "hafalan" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Form Input */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 sticky top-6">
              <h2 className="font-bold text-slate-800 dark:text-white mb-4">Input Hafalan Baru</h2>
              <form onSubmit={submitHafalan} className="space-y-4">
                
                {/* Custom Santri Selector */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nama Santri <span className="text-red-500">*</span></label>
                  <div 
                    onClick={() => setShowSantriDropdown(!showSantriDropdown)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm cursor-pointer flex justify-between items-center"
                  >
                    <span className={hafalanForm.santriId ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}>
                      {hafalanForm.santriId ? getSelectedSantriName() : "Pilih Santri..."}
                    </span>
                    <ChevronLeft className={`w-4 h-4 transition-transform ${showSantriDropdown ? "rotate-90" : "-rotate-90"}`} />
                  </div>

                  {showSantriDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 flex flex-col overflow-hidden">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <input 
                          type="text" 
                          placeholder="Cari..." 
                          value={searchHafalanSantri}
                          onChange={e => setSearchHafalanSantri(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div className="overflow-y-auto flex-1 p-1">
                        {filteredHafalanSantri.slice(0, 50).map(s => (
                          <div 
                            key={s.id}
                            onClick={() => {
                              setHafalanForm({ ...hafalanForm, santriId: s.id });
                              setShowSantriDropdown(false);
                            }}
                            className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer rounded-lg flex flex-col"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200">{s.registration?.studentName}</span>
                            <span className="text-[10px] text-slate-500">{s.nis}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal <span className="text-red-500">*</span></label>
                  <input type="date" required value={hafalanForm.tanggal} onChange={e => setHafalanForm({...hafalanForm, tanggal: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Target (Hal) <span className="text-red-500">*</span></label>
                    <input type="number" required value={hafalanForm.targetHal} onChange={e => setHafalanForm({...hafalanForm, targetHal: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Capaian (Hal) <span className="text-red-500">*</span></label>
                    <input type="number" required value={hafalanForm.capaianHal} onChange={e => setHafalanForm({...hafalanForm, capaianHal: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Total Juz (Opsional)</label>
                  <input type="number" step="0.1" value={hafalanForm.totalJuz} onChange={e => setHafalanForm({...hafalanForm, totalJuz: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Misal: 5.5" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan (Opsional)</label>
                  <textarea rows="2" value={hafalanForm.keterangan} onChange={e => setHafalanForm({...hafalanForm, keterangan: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-500/30">
                    Simpan Hafalan
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Kolom Kanan: Tabel Riwayat Terakhir */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 dark:text-white">Riwayat Hafalan Terbaru (50 Terakhir)</h2>
                <button onClick={fetchGlobalHafalan} className="text-teal-600 hover:underline text-xs font-bold">Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Nama Santri</th>
                      <th className="px-4 py-3 text-center">Tgt</th>
                      <th className="px-4 py-3 text-center">Cap</th>
                      <th className="px-4 py-3">Juz</th>
                      <th className="px-4 py-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {loading ? (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">Memuat riwayat...</td></tr>
                    ) : globalHafalan.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada riwayat hafalan.</td></tr>
                    ) : (
                      globalHafalan.map(h => (
                        <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(h.tanggal).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800 dark:text-white text-xs line-clamp-1">{h.santri?.registration?.studentName}</div>
                            <div className="text-[10px] text-slate-500">{h.santri?.kelas?.nama}</div>
                          </td>
                          <td className="px-4 py-3 text-center">{h.targetHal}</td>
                          <td className="px-4 py-3 text-center font-bold text-teal-600 dark:text-teal-400">{h.capaianHal}</td>
                          <td className="px-4 py-3 text-xs">{h.totalJuz || "-"}</td>
                          <td className="px-4 py-3 text-[11px] text-slate-500 line-clamp-1">{h.keterangan || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Halaqoh */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">
                {editingId ? "Edit Halaqoh" : "Tambah Halaqoh"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveHalaqoh} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Halaqoh <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Misal: Halaqoh Abu Bakar"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Markaz</label>
                <select
                  value={formData.markazId}
                  onChange={(e) => setFormData({ ...formData, markazId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Pilih Markaz --</option>
                  {markazList.map(m => (
                    <option key={m.id} value={m.id}>{m.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Muhaffidz (Pengampu)</label>
                <select
                  value={formData.muhaffidzId}
                  onChange={(e) => setFormData({ ...formData, muhaffidzId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Pilih Muhaffidz --</option>
                  {pegawaiList.map(p => (
                    <option key={p.id} value={p.id}>{p.namaLengkap}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="aktif"
                  checked={formData.aktif}
                  onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-600"
                />
                <label htmlFor="aktif" className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Aktif</label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-500/30"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
