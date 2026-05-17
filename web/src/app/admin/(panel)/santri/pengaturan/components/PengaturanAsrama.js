"use client";

import { useState, useEffect } from "react";

export default function PengaturanAsrama() {
  const [asrama, setAsrama] = useState([]);
  const [markazList, setMarkazList] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterMarkaz, setFilterMarkaz] = useState("SEMUA");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsrama, setEditingAsrama] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    markazId: "",
    nama: "",
    musyrifId: "",
    kapasitas: "",
    aktif: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      
      // Fetch Markaz
      const resMarkaz = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/markaz`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resMarkaz.ok) {
        const data = await resMarkaz.json();
        setMarkazList(data.markaz);
      }

      // Fetch Pegawai for Musyrif
      const resPegawai = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resPegawai.ok) {
        const json = await resPegawai.json();
        setPegawaiList(json.data || []);
      }

      // Fetch Asrama
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri-settings/asrama`;
      if (filterMarkaz !== "SEMUA") url += `?markazId=${filterMarkaz}`;
      
      const resAsrama = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resAsrama.ok) {
        const data = await resAsrama.json();
        setAsrama(data.asrama);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMarkaz]);

  const handleOpenModal = (asr = null) => {
    if (asr) {
      setEditingAsrama(asr);
      setFormData({
        markazId: asr.markazId,
        nama: asr.nama,
        musyrifId: asr.musyrifId || "",
        kapasitas: asr.kapasitas || "",
        aktif: asr.aktif
      });
    } else {
      setEditingAsrama(null);
      setFormData({
        markazId: filterMarkaz !== "SEMUA" ? filterMarkaz : (markazList[0]?.id || ""),
        nama: "",
        musyrifId: "",
        kapasitas: "",
        aktif: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const url = editingAsrama 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri-settings/asrama/${editingAsrama.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri-settings/asrama`;
      
      const method = editingAsrama ? "PUT" : "POST";
      
      // Ensure kapasitas is integer or empty
      const submitData = { ...formData };
      if (submitData.kapasitas === "") submitData.kapasitas = null;
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(submitData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menyimpan asrama");
      }
    } catch (error) {
      console.error("Error saving asrama:", error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus asrama ini?")) return;
    
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/santri-settings/asrama/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menghapus asrama");
      }
    } catch (error) {
      console.error("Error deleting asrama:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Manajemen Asrama</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola daftar asrama, kapasitas, dan musyrif/pembina.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-sm flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Tambah Asrama
        </button>
      </div>
      
      <div className="mb-6">
        <select 
          value={filterMarkaz}
          onChange={(e) => setFilterMarkaz(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="SEMUA">Semua Markaz</option>
          {markazList.map(m => (
            <option key={m.id} value={m.id}>{m.kode}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nama Asrama</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Markaz</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Musyrif / Pembina</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Isi / Kapasitas</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Status</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">Memuat data...</td>
              </tr>
            ) : asrama.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">Belum ada data asrama.</td>
              </tr>
            ) : (
              asrama.map(a => (
                <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{a.nama}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{a.markaz?.kode || a.markaz?.nama}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{a.musyrif?.namaLengkap || "-"}</td>
                  <td className="py-3 px-4 text-sm text-center text-slate-600 dark:text-slate-400">
                    {a._count?.santri || 0} / {a.kapasitas ? a.kapasitas : "∞"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded ${a.aktif ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'}`}>
                      {a.aktif ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleOpenModal(a)} className="text-blue-500 hover:text-blue-700 mx-2 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-700/50 w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  {editingAsrama ? 'Edit Asrama' : 'Tambah Asrama Baru'}
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Lengkapi detail informasi asrama di bawah ini.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Markaz <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.markazId}
                  onChange={(e) => setFormData({...formData, markazId: e.target.value ? parseInt(e.target.value) : ""})}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none"
                >
                  <option value="">Pilih Markaz...</option>
                  {markazList.map(m => (
                    <option key={m.id} value={m.id}>{m.kode}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Asrama <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="Misal: Asrama Abu Bakar"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Musyrif / Pembina</label>
                <select 
                  value={formData.musyrifId}
                  onChange={(e) => setFormData({...formData, musyrifId: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none"
                >
                  <option value="">Pilih Musyrif (Opsional)...</option>
                  {pegawaiList.map(p => (
                    <option key={p.id} value={p.id}>{p.namaLengkap} - {p.nip}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Kapasitas</label>
                  <input 
                    type="number" 
                    placeholder="Tak terbatas jika kosong"
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({...formData, kapasitas: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Aktif</label>
                  <div className="flex items-center h-12">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.aktif}
                        onChange={(e) => setFormData({...formData, aktif: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 pb-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors font-bold text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Asrama'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
