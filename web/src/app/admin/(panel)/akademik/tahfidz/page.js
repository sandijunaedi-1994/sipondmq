"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Users, Plus, Edit2, Trash2, ShieldCheck, FileText, Search, ChevronLeft } from "lucide-react";
import SantriTahfidzModule from "../../santri/data/[id]/components/SantriTahfidzModule";

export default function ManajemenTahfidzPage() {
  const [activeTab, setActiveTab] = useState("halaqoh"); // halaqoh, santri
  
  // Data
  const [halaqohList, setHalaqohList] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Halaqoh
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    muhaffidzId: "",
    aktif: true
  });

  // Santri Tab
  const [searchSantri, setSearchSantri] = useState("");
  const [selectedSantri, setSelectedSantri] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resHalaqoh, resPegawai, resSantri] = await Promise.all([
        fetch(`${apiUrl}/api/admin/halaqoh`, { headers }),
        fetch(`${apiUrl}/api/admin/sdm/pegawai`, { headers }),
        fetch(`${apiUrl}/api/admin/santri`, { headers })
      ]);

      const dataHalaqoh = await resHalaqoh.json();
      const dataPegawai = await resPegawai.json();
      const dataSantri = await resSantri.json();

      if (dataHalaqoh.success) setHalaqohList(dataHalaqoh.halaqoh);
      if (dataPegawai.success) setPegawaiList(dataPegawai.pegawai);
      if (dataSantri.success) setSantriList(dataSantri.santri || []);
    } catch (err) {
      alert("Gagal memuat data halaqoh");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
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

  const handleDelete = async (id) => {
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

  const openForm = (h = null) => {
    if (h) {
      setEditingId(h.id);
      setFormData({
        nama: h.nama,
        muhaffidzId: h.muhaffidzId || "",
        aktif: h.aktif
      });
    } else {
      setEditingId(null);
      setFormData({
        nama: "",
        muhaffidzId: "",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="text-teal-500" /> Manajemen Tahfidz
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola data halaqoh, pengampu, dan laporan hafalan santri.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "halaqoh", label: "Daftar Halaqoh", icon: <Users size={18} /> },
          { id: "santri", label: "Progress Santri", icon: <FileText size={18} /> }
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
              onClick={() => openForm()}
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
                  <th className="px-6 py-4">Muhaffidz / Pengampu</th>
                  <th className="px-6 py-4 text-center">Jml Santri</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-10 text-slate-500">Memuat data...</td>
                  </tr>
                ) : halaqohList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-10 text-slate-500">Belum ada data halaqoh.</td>
                  </tr>
                ) : (
                  halaqohList.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{h.nama}</td>
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
                          onClick={() => openForm(h)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
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

      {/* Tab Content: Progress Santri */}
      {activeTab === "santri" && (
        <div className="space-y-4">
          {!selectedSantri ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 dark:text-white">Pilih Santri</h2>
                <div className="relative w-64">
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

              {/* Panggil Module dengan isEditable=true */}
              <SantriTahfidzModule santriId={selectedSantri.id} isEditable={true} />
            </div>
          )}
        </div>
      )}

      {/* Modal Form Halaqoh */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">
                {editingId ? "Edit Halaqoh" : "Tambah Halaqoh"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
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
