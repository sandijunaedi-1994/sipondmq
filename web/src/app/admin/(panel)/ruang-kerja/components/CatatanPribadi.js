"use client";

import { useState, useEffect } from "react";
import { Plus, X, Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";

const COLORS = [
  { id: 'default', bg: 'bg-white dark:bg-slate-900', border: 'border-slate-200 dark:border-slate-800' },
  { id: 'red', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/30' },
  { id: 'orange', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800/30' },
  { id: 'yellow', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800/30' },
  { id: 'green', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/30' },
  { id: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/30' },
  { id: 'purple', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800/30' },
];

export default function CatatanPribadi() {
  const [catatan, setCatatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, 
    tanggal: "", 
    judul: "", 
    tugas: "", 
    warna: "default", 
    labels: [],
    status: "PENDING" 
  });
  const [labelInput, setLabelInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCatatan();
  }, []);

  const loadCatatan = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/catatan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal mengambil data catatan");
      const data = await res.json();
      setCatatan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (note = null) => {
    if (note) {
      let parsedLabels = [];
      try {
        if (typeof note.labels === 'string') {
          parsedLabels = JSON.parse(note.labels);
        } else if (Array.isArray(note.labels)) {
          parsedLabels = note.labels;
        }
      } catch(e) { console.error("Error parsing labels", e); }

      setFormData({
        id: note.id,
        tanggal: note.tanggal ? note.tanggal.split('T')[0] : new Date().toISOString().split('T')[0],
        judul: note.judul || "",
        tugas: note.tugas || "",
        warna: note.warna || "default",
        labels: parsedLabels || [],
        status: note.status || "PENDING"
      });
    } else {
      setFormData({
        id: null,
        tanggal: new Date().toISOString().split('T')[0],
        judul: "",
        tugas: "",
        warna: "default",
        labels: [],
        status: "PENDING"
      });
    }
    setLabelInput("");
    setIsModalOpen(true);
  };

  const handleAddLabel = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = labelInput.trim().replace(/,$/, '');
      if (val && !formData.labels.includes(val)) {
        setFormData({ ...formData, labels: [...formData.labels, val] });
      }
      setLabelInput("");
    }
  };

  const removeLabel = (labelToRemove) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter(l => l !== labelToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Catch any trailing label input
    let finalLabels = [...formData.labels];
    if (labelInput.trim()) {
      const val = labelInput.trim().replace(/,$/, '');
      if (!finalLabels.includes(val)) {
        finalLabels.push(val);
      }
    }

    const payload = { ...formData, labels: finalLabels };

    try {
      const token = localStorage.getItem("admin_token");
      const url = payload.id 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/catatan/${payload.id}` 
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/catatan`;
      const method = payload.id ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Gagal menyimpan catatan");
      
      await loadCatatan();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Yakin ingin menghapus catatan ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/catatan/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal menghapus catatan");
      await loadCatatan();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (note, e) => {
    e.stopPropagation();
    const newStatus = note.status === "PENDING" ? "SELESAI" : "PENDING";
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/catatan/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      await loadCatatan();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors w-full min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Catatan Pribadi</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Kelola ide, tugas, dan catatan dengan mudah layaknya Google Keep.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto shrink-0"
        >
          <Plus size={18} /> Tambah Catatan
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 mb-6">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {catatan.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 w-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4 opacity-50">📝</div>
              <p>Belum ada catatan.</p>
            </div>
          ) : (
            catatan.map((note) => {
              const colorObj = COLORS.find(c => c.id === note.warna) || COLORS[0];
              let parsedLabels = [];
              try {
                if (typeof note.labels === 'string') parsedLabels = JSON.parse(note.labels);
                else if (Array.isArray(note.labels)) parsedLabels = note.labels;
              } catch(e) {}

              return (
                <div 
                  key={note.id} 
                  onClick={() => handleOpenModal(note)}
                  className={`break-inside-avoid rounded-2xl border p-4 cursor-pointer hover:shadow-md transition-all group relative flex flex-col ${colorObj.bg} ${colorObj.border}`}
                >
                  {/* Action Buttons overlay */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg p-1">
                    <button onClick={(e) => handleDelete(note.id, e)} className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors" title="Hapus">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <button onClick={(e) => toggleStatus(note, e)} className="mt-0.5 shrink-0 z-10" title="Tandai selesai">
                      {note.status === 'SELESAI' ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Circle size={18} className="text-slate-300 hover:text-emerald-400 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      {note.judul && (
                        <h3 className={`font-bold text-sm mb-1.5 ${note.status === 'SELESAI' ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                          {note.judul}
                        </h3>
                      )}
                      <p className={`text-sm whitespace-pre-wrap ${note.status === 'SELESAI' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {note.tugas}
                      </p>
                    </div>
                  </div>

                  {parsedLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4 ml-7">
                      {parsedLabels.map((lbl, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/5">
                          {lbl}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-[10px] text-slate-400 font-medium mt-4 ml-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(note.tanggal).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 transition-colors shrink-0">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">{formData.id ? 'Edit Catatan' : 'Tambah Catatan'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 p-1 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar">
              <form id="note-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <input 
                    type="text" 
                    value={formData.judul} 
                    onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                    className="w-full bg-transparent text-lg font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-colors border-b border-transparent focus:border-emerald-500 pb-1" 
                    placeholder="Judul catatan (opsional)" 
                  />
                </div>
                
                <div>
                  <textarea 
                    required 
                    rows={5} 
                    value={formData.tugas} 
                    onChange={(e) => setFormData({...formData, tugas: e.target.value})} 
                    className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none resize-none" 
                    placeholder="Tulis catatan Anda di sini..."
                  ></textarea>
                </div>
                
                <div className="space-y-3 pt-2">
                  {/* Labels Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Label</label>
                    <div className="flex flex-wrap gap-2 mb-1">
                      {formData.labels.map((lbl, idx) => (
                        <div key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {lbl}
                          <button type="button" onClick={() => removeLabel(lbl)} className="text-slate-400 hover:text-red-500">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      onKeyDown={handleAddLabel}
                      placeholder="Ketik label lalu tekan Enter..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  {/* Color Picker */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Warna Latar</label>
                    <div className="flex gap-2">
                      {COLORS.map(color => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setFormData({...formData, warna: color.id})}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${color.bg} ${formData.warna === color.id ? 'border-emerald-500 scale-110 shadow-sm' : color.border}`}
                          title={color.id}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Date & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tanggal</label>
                      <input 
                        required 
                        type="date" 
                        value={formData.tanggal} 
                        onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
                      <select 
                        value={formData.status} 
                        onChange={(e) => setFormData({...formData, status: e.target.value})} 
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SELESAI">SELESAI</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition">
                Batal
              </button>
              <button type="submit" form="note-form" disabled={isSubmitting} className="px-5 py-2 text-sm bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-70 shadow-sm flex items-center gap-2">
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Menyimpan...</>
                ) : "Simpan Catatan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
