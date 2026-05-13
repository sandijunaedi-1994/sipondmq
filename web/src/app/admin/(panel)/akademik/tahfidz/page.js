"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Users, Plus, Edit2, Trash2, ShieldCheck, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function ManajemenTahfidzPage() {
  const [activeTab, setActiveTab] = useState("halaqoh");
  
  // Data
  const [halaqohList, setHalaqohList] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    muhaffidzId: "",
    aktif: true
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resHalaqoh, resPegawai] = await Promise.all([
        fetch(`${apiUrl}/api/admin/halaqoh`, { headers }),
        fetch(`${apiUrl}/api/admin/sdm/pegawai`, { headers })
      ]);

      const dataHalaqoh = await resHalaqoh.json();
      const dataPegawai = await resPegawai.json();

      if (dataHalaqoh.success) setHalaqohList(dataHalaqoh.halaqoh);
      if (dataPegawai.success) setPegawaiList(dataPegawai.pegawai);
    } catch (err) {
      toast.error("Gagal memuat data halaqoh");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nama) return toast.error("Nama halaqoh harus diisi");

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
        toast.success(data.message);
        setShowModal(false);
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
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
        toast.success(data.message);
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
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
          // Tambahkan tab statistik/laporan nanti
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {/* Tab Content */}
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

      {/* Modal Form */}
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
