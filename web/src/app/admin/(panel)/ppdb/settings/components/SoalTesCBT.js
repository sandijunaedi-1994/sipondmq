"use client";

import { useEffect, useState } from "react";

export default function SettingSoalTesPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [selectedLevel, setSelectedLevel] = useState("SMP");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    category: "Umum",
    options: ["", "", "", ""],
    correctOption: 0,
    urutan: 1
  });

  const [inlineEditing, setInlineEditing] = useState(null);
  const [inlineUrutan, setInlineUrutan] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, [selectedLevel]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/cbt?level=${encodeURIComponent(selectedLevel)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions || []);
      } else {
        setError(data.message || "Gagal mengambil data soal.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (q = null) => {
    if (q) {
      setEditingId(q.id);
      setFormData({
        text: q.text,
        category: q.category || "Umum",
        options: q.options || ["", "", "", ""],
        correctOption: q.correctOption ?? 0,
        urutan: q.urutan || 0
      });
    } else {
      setEditingId(null);
      const nextUrutan = questions.length > 0 ? Math.max(...questions.map(x => x.urutan || 0)) + 1 : 1;
      setFormData({ text: "", category: "Umum", options: ["", "", "", ""], correctOption: 0, urutan: nextUrutan });
    }
    setIsModalOpen(true);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (formData.options.some(opt => opt.trim() === "")) {
      setError("Semua opsi jawaban (A, B, C, D) harus diisi.");
      return;
    }

    const newUrutan = parseInt(formData.urutan);
    if (questions.some(x => x.id !== editingId && x.urutan === newUrutan)) {
      setError(`Nomor urut ${newUrutan} sudah digunakan. Harap ganti dengan angka lain.`);
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/cbt/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/cbt`;
      const method = editingId ? "PUT" : "POST";
      
      const payload = { ...formData, level: selectedLevel };
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan soal");
      
      setSuccess(`Soal berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}.`);
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus soal ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/cbt/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal menghapus soal");
      setSuccess("Soal berhasil dihapus.");
      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveInlineOrder = async (q) => {
    try {
      const newUrutan = parseInt(inlineUrutan);
      if (isNaN(newUrutan)) return setInlineEditing(null);
      if (questions.some(x => x.id !== q.id && x.urutan === newUrutan)) {
        alert("Nomor urut " + newUrutan + " sudah digunakan. Harap gunakan nomor urut yang unik.");
        return;
      }
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/cbt/${q.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...q, urutan: newUrutan, level: selectedLevel })
      });
      if (!res.ok) throw new Error("Gagal mengubah urutan");
      setInlineEditing(null);
      fetchQuestions();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && questions.length === 0) return <div className="animate-pulse h-64 bg-slate-200 rounded-2xl w-full"></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Setting Soal Tes CBT</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Kelola bank soal ujian masuk berdasarkan jenjang.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="flex-1 sm:flex-none p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 bg-slate-50 dark:bg-slate-950 transition-colors"
          >
            <option value="SMP">Tingkat SMP</option>
            <option value="SMA">Tingkat SMA</option>
            <option value="Ma'had Aly">Tingkat Ma'had Aly</option>
          </select>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
            <span className="hidden sm:inline">Tambah Soal</span>
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm border border-red-200">{error}</div>}
      {success && <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl font-medium text-sm border border-emerald-200 transition-colors">{success}</div>}

      <div className="grid gap-4">
        {questions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center transition-colors">
            <p className="text-slate-500 dark:text-slate-400 transition-colors">Belum ada soal CBT. Silakan tambah soal baru.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-6 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {inlineEditing === q.id ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          value={inlineUrutan} 
                          onChange={e => setInlineUrutan(e.target.value)} 
                          className="w-16 px-2 py-1 text-xs font-bold border border-emerald-500 rounded-md outline-none bg-emerald-50 dark:bg-emerald-500/10 transition-colors"
                          autoFocus
                          onKeyDown={e => { if(e.key === 'Enter') handleSaveInlineOrder(q); if(e.key === 'Escape') setInlineEditing(null); }}
                        />
                        <button onClick={() => handleSaveInlineOrder(q)} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={() => setInlineEditing(null)} className="p-1 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 rounded-md transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setInlineEditing(q.id); setInlineUrutan(q.urutan || 0); }} title="Klik untuk ubah urutan" className="group flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 hover:text-emerald-700 text-slate-500 dark:text-slate-400 font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer">
                        <span>Urutan: {q.urutan || 0}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      </button>
                    )}
                  </div>
                  <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg text-xs">{q.category}</span>
                </div>
                <p className="text-slate-800 dark:text-slate-100 font-medium mb-4 transition-colors">{q.text}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`p-3 rounded-xl border text-sm flex items-center gap-3 ${q.correctOption === i ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'} transition-colors`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${q.correctOption === i ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:text-slate-400'} transition-colors`}>
                        {['A', 'B', 'C', 'D'][i]}
                      </div>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-row sm:flex-col gap-2 justify-start sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6 transition-colors">
                <button onClick={() => handleOpenModal(q)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-xl transition flex items-center gap-2 text-sm font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  <span className="sm:hidden">Edit</span>
                </button>
                <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition flex items-center gap-2 text-sm font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  <span className="sm:hidden">Hapus</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">{editingId ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-3 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Teks Pertanyaan</label>
                  <textarea required rows={4} value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 resize-none transition-colors" placeholder="Masukkan soal di sini..." />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">No. Urut</label>
                  <input type="number" required value={formData.urutan} onChange={e => setFormData({...formData, urutan: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 bg-white dark:bg-slate-900 transition-colors" placeholder="Cth: 1" />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 bg-white dark:bg-slate-900 transition-colors">
                    <option value="Umum">Umum</option>
                    <option value="Agama">Agama</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Bahasa">Bahasa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 transition-colors">Pilihan Jawaban (A, B, C, D)</label>
                <div className="space-y-3">
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-bold transition-colors">
                          {['A', 'B', 'C', 'D'][idx]}
                        </div>
                        <input type="text" required value={opt} onChange={e => handleOptionChange(idx, e.target.value)} className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${formData.correctOption === idx ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10/30' : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'}`} placeholder={`Pilihan ${['A', 'B', 'C', 'D'][idx]}`} />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                        <input type="radio" name="correctOpt" checked={formData.correctOption === idx} onChange={() => setFormData({...formData, correctOption: idx})} className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors">Kunci Jawaban</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 transition-colors">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-md shadow-emerald-500/20">Simpan Soal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
