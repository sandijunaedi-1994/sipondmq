"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";

export default function AktivitasRutin() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    aktivitas: "",
    frekuensi: "SETIAP HARI",
    jamMulai: "",
    jamSelesai: "",
    petugas: "",
    deskripsi: ""
  });

  const [tipeFrekuensi, setTipeFrekuensi] = useState("HARIAN");
  const [hariPekanan, setHariPekanan] = useState("TIDAK TERTENTU");

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };
    if (showModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setFormData(task);
      setIsEditing(true);
      
      let f = task.frekuensi || "HARIAN";
      if (f.startsWith("PEKANAN")) {
        setTipeFrekuensi("PEKANAN");
        if (f.includes("-")) {
          setHariPekanan(f.split("-")[1]);
        } else {
          setHariPekanan("TIDAK TERTENTU");
        }
      } else {
        setTipeFrekuensi(f);
        setHariPekanan("TIDAK TERTENTU");
      }
    } else {
      setFormData({
        id: "",
        aktivitas: "",
        frekuensi: "HARIAN",
        jamMulai: "",
        jamSelesai: "",
        petugas: localStorage.getItem("admin_name") || "",
        deskripsi: ""
      });
      setTipeFrekuensi("HARIAN");
      setHariPekanan("TIDAK TERTENTU");
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalFrekuensi = tipeFrekuensi;
    if (tipeFrekuensi === "PEKANAN") {
      finalFrekuensi = `PEKANAN-${hariPekanan}`;
    }
    
    const payload = { ...formData, frekuensi: finalFrekuensi };
    
    try {
      const token = localStorage.getItem("admin_token");
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/tasks/${formData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/tasks`;
        
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchTasks();
      } else {
        alert("Gagal menyimpan tugas rutin");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus aktivitas ini? Semua jadwal yang sudah digenerate juga akan terhapus.")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generateSchedules = async () => {
    if (!confirm("Generate jadwal rutin untuk bulan ini?")) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const now = new Date();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/schedules/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ month: now.getMonth() + 1, year: now.getFullYear() })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
      } else {
        alert("Gagal meng-generate jadwal");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.aktivitas.toLowerCase().includes(search.toLowerCase()) || 
    (t.petugas && t.petugas.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Aktivitas Rutin</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Kelola template tugas rutin harian atau mingguan Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generateSchedules}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-bold rounded-xl text-sm border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 transition-colors"
          >
            <span>⚙️</span> Generate Jadwal Bulan Ini
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl text-sm hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus size={16} /> Tambah Aktivitas
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Cari aktivitas atau nama petugas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] transition-colors">
              <tr>
                <th className="px-6 py-4">Aktivitas</th>
                <th className="px-6 py-4">Frekuensi</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Petugas</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
            ) : filteredTasks.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Tidak ada data aktivitas rutin.</td></tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{task.aktivitas}</div>
                    {task.deskripsi && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{task.deskripsi}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-md text-[10px] font-bold tracking-wide">
                      {task.frekuensi}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {(task.jamMulai || task.jamSelesai) ? `${task.jamMulai || '--:--'} s/d ${task.jamSelesai || '--:--'}` : 'Sepanjang Hari'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        {(task.petugas || "A").charAt(0)}
                      </div>
                      {task.petugas || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(task)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {isEditing ? "Edit Aktivitas Rutin" : "Tambah Aktivitas Rutin"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="routine-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Aktivitas *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.aktivitas}
                    onChange={e => setFormData({...formData, aktivitas: e.target.value})}
                    placeholder="Contoh: Cek kebersihan asrama"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tipe Frekuensi *</label>
                    <select 
                      required
                      value={tipeFrekuensi}
                      onChange={e => setTipeFrekuensi(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
                    >
                      <option value="HARIAN">HARIAN</option>
                      <option value="PEKANAN">PEKANAN</option>
                      <option value="BULANAN">BULANAN</option>
                      <option value="SEMESTERAN">SEMESTERAN</option>
                      <option value="TAHUNAN">TAHUNAN</option>
                    </select>
                  </div>

                  {tipeFrekuensi === "PEKANAN" && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Pilih Hari *</label>
                      <select 
                        required
                        value={hariPekanan}
                        onChange={e => setHariPekanan(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
                      >
                        <option value="TIDAK TERTENTU">TIDAK TERTENTU</option>
                        <option value="SENIN">SENIN</option>
                        <option value="SELASA">SELASA</option>
                        <option value="RABU">RABU</option>
                        <option value="KAMIS">KAMIS</option>
                        <option value="JUMAT">JUMAT</option>
                        <option value="SABTU">SABTU</option>
                        <option value="MINGGU">MINGGU</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Jam Mulai</label>
                    <input 
                      type="time" 
                      value={formData.jamMulai || ''}
                      onChange={e => setFormData({...formData, jamMulai: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Jam Selesai</label>
                    <input 
                      type="time" 
                      value={formData.jamSelesai || ''}
                      onChange={e => setFormData({...formData, jamSelesai: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Petugas / PIC</label>
                  <input 
                    type="text" 
                    value={formData.petugas || ''}
                    onChange={e => setFormData({...formData, petugas: e.target.value})}
                    placeholder="Nama yang bertanggung jawab"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi / Instruksi</label>
                  <textarea 
                    rows={3}
                    value={formData.deskripsi || ''}
                    onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                    placeholder="Instruksi tambahan..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white custom-scrollbar resize-none"
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="routine-form"
                className="px-5 py-2.5 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                Simpan Aktivitas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
