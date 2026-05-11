"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AddActivityModal({ date, onClose, onSuccess }) {
  const [type, setType] = useState('INISIATIF'); // or 'RUTIN'
  const [taskDate, setTaskDate] = useState(date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  
  // Initiative fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Routine fields
  const [routineTasks, setRoutineTasks] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState('');
  
  // Pembangunan fields
  const [pembangunanTasks, setPembangunanTasks] = useState([]);
  const [selectedPembangunan, setSelectedPembangunan] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === 'RUTIN' && routineTasks.length === 0) {
      const fetchTasks = async () => {
        try {
          const token = localStorage.getItem("admin_token");
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/routines/tasks`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            setRoutineTasks(data);
            if (data.length > 0) setSelectedRoutine(data[0].id);
          }
        } catch (e) { console.error(e); }
      };
      fetchTasks();
    } else if (type === 'PEMBANGUNAN' && pembangunanTasks.length === 0) {
      const fetchPembangunan = async () => {
        try {
          const token = localStorage.getItem("admin_token");
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              const tasks = [];
              data.data.forEach(proj => {
                if (proj.McSubTugas) {
                  proj.McSubTugas.forEach(st => {
                    if (st.status !== 'COMPLETED') {
                      tasks.push({
                        id: st.id,
                        nama: `${proj.rencanaPekerjaan} - ${st.namaPekerjaan}`
                      });
                    }
                  });
                }
              });
              setPembangunanTasks(tasks);
              if (tasks.length > 0) setSelectedPembangunan(tasks[0].id);
            }
          }
        } catch (e) { console.error(e); }
      };
      fetchPembangunan();
    }
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/routines/initiative`;
      let payload = { title, description, taskDate };
      
      if (type === 'RUTIN') {
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/routines/adhoc`;
        payload = { routineTaskId: selectedRoutine, taskDate };
      } else if (type === 'PEMBANGUNAN') {
        const taskName = pembangunanTasks.find(t => t.id === selectedPembangunan)?.nama || "Tugas Pembangunan";
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/routines/initiative`;
        payload = { title: `[Pembangunan] ${taskName}`, description: "Tugas dari modul Pembangunan & Maintenance", taskDate };
      }
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onSuccess();
      } else {
        alert("Gagal menambahkan aktivitas");
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Tambah Aktivitas</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipe Aktivitas</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                <input type="radio" checked={type === 'INISIATIF'} onChange={() => setType('INISIATIF')} className="text-emerald-600 focus:ring-emerald-500" /> Inisiatif Pribadi
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                <input type="radio" checked={type === 'RUTIN'} onChange={() => setType('RUTIN')} className="text-emerald-600 focus:ring-emerald-500" /> Dari Rutinitas
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                <input type="radio" checked={type === 'PEMBANGUNAN'} onChange={() => setType('PEMBANGUNAN')} className="text-amber-500 focus:ring-amber-500" /> Pembangunan
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
            <input type="date" required value={taskDate} onChange={e => setTaskDate(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" />
          </div>

          {type === 'INISIATIF' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul / Aktivitas</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" placeholder="Cth: Membuat Laporan Keuangan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi (Opsional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" rows={3}></textarea>
              </div>
            </>
          ) : type === 'RUTIN' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Aktivitas Rutin</label>
              <select value={selectedRoutine} onChange={e => setSelectedRoutine(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition" required>
                <option value="" disabled>-- Pilih Aktivitas --</option>
                {routineTasks.map(t => <option key={t.id} value={t.id}>{t.aktivitas}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Tugas Pembangunan</label>
              <select value={selectedPembangunan} onChange={e => setSelectedPembangunan(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition" required>
                {pembangunanTasks.length === 0 ? <option value="" disabled>Tidak ada tugas aktif</option> : <option value="" disabled>-- Pilih Tugas --</option>}
                {pembangunanTasks.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
              </select>
            </div>
          )}

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-70 shadow-sm">
              {loading ? "Menyimpan..." : "Simpan Aktivitas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
