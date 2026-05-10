"use client";

import { useState, useEffect } from "react";

export default function RubrikPenguji() {
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [target, setTarget] = useState("SANTRI");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [urutan, setUrutan] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchRubrics();
  }, []);

  const fetchRubrics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/interviewer-rubric`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRubrics(data.rubrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (rubric = null) => {
    if (rubric) {
      setIsEditing(true);
      setEditId(rubric.id);
      setTarget(rubric.target);
      setTopic(rubric.topic);
      setDescription(rubric.description || "");
      setOption1(rubric.option1);
      setOption2(rubric.option2);
      setOption3(rubric.option3);
      setUrutan(rubric.urutan);
      setIsActive(rubric.isActive);
    } else {
      setIsEditing(false);
      setEditId(null);
      setTarget("SANTRI");
      setTopic("");
      setDescription("");
      setOption1("Tidak siap dan ragu-ragu");
      setOption2("Siap dengan pertimbangan");
      setOption3("Siap dengan situasi apapun");
      setUrutan(rubrics.length > 0 ? rubrics.length + 1 : 1);
      setIsActive(true);
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const payload = { target, topic, description, option1, option2, option3, urutan: parseInt(urutan), isActive };
      
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/interviewer-rubric/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/interviewer-rubric`;
      
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsOpen(false);
        fetchRubrics();
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus rubrik penilaian ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/interviewer-rubric/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRubrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Group by target
  const santriRubrics = rubrics.filter(r => r.target === "SANTRI");
  const waliRubrics = rubrics.filter(r => r.target === "WALI");

  const renderRubricGroup = (title, data) => (
    <div className="mb-8">
      <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base mb-4 flex items-center gap-2 transition-colors">
        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
        {title} ({data.length})
      </h3>
      
      {data.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 text-sm transition-colors">
          Belum ada rubrik untuk bagian ini.
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((r, i) => (
            <div key={r.id} className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col gap-4 ${r.isActive ? 'border-slate-200 dark:border-slate-800 shadow-sm' : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-950'} transition-colors`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center text-xs font-bold transition-colors">{r.urutan}</span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors">{r.topic}</h4>
                  </div>
                  {r.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 italic transition-colors">{r.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleOpenForm(r)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50/50 border border-red-100 p-3 rounded-xl">
                  <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded mb-1">SKOR 1</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium transition-colors">{r.option1}</p>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
                  <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded mb-1">SKOR 2</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium transition-colors">{r.option2}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10/50 border border-emerald-100 p-3 rounded-xl transition-colors">
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded mb-1">SKOR 3</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium transition-colors">{r.option3}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Rubrik Wawancara Penguji</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Buat panduan dan skala penilaian untuk penguji.</p>
        </div>
        <button onClick={() => handleOpenForm()} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Tambah Topik
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {renderRubricGroup("Evaluasi Santri", santriRubrics)}
            <hr className="border-slate-100 dark:border-slate-800 mb-8 transition-colors" />
            {renderRubricGroup("Evaluasi Wali Santri", waliRubrics)}
          </>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto transition-colors">
            <div className="p-5 border-b bg-slate-50 dark:bg-slate-950 flex justify-between items-center transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{isEditing ? "Edit Topik Rubrik" : "Tambah Topik Rubrik"}</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Target Penilaian</label>
                  <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors">
                    <option value="SANTRI">Calon Santri</option>
                    <option value="WALI">Wali Santri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Nomor Urut</label>
                  <input type="number" value={urutan} onChange={(e) => setUrutan(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors" required />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Topik / Kriteria</label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Contoh: Kesiapan Masuk Pesantren" className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors" required />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Deskripsi / Panduan Penguji</label>
                <textarea rows="2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contoh: Tanyakan kesediaan anak tinggal di asrama dan konsekuensi jauh dari orang tua..." className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors" />
              </div>

              <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Definisi Skala Penilaian</p>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
                    <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">1</span> Deskripsi Skor 1
                  </label>
                  <input type="text" value={option1} onChange={(e) => setOption1(e.target.value)} placeholder="Buruk / Tidak Siap" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors" required />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
                    <span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">2</span> Deskripsi Skor 2
                  </label>
                  <input type="text" value={option2} onChange={(e) => setOption2(e.target.value)} placeholder="Cukup / Siap dengan syarat" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors" required />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                    <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">3</span> Deskripsi Skor 3
                  </label>
                  <input type="text" value={option3} onChange={(e) => setOption3(e.target.value)} placeholder="Sangat Baik / Sangat Siap" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors" required />
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 transition-colors" />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors">Topik ini Aktif</label>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition">
                  {isEditing ? "Simpan Perubahan" : "Simpan Topik"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
