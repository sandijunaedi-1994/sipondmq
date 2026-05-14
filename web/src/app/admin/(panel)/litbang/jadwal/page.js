"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Calendar, Settings, FileText, Settings2, Loader2, Play } from "lucide-react";

export default function JadwalPelajaranPage() {
  const [activeTab, setActiveTab] = useState("mapel");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Jadwal Pelajaran Otomatis</h1>
        <p className="text-slate-500 mt-1">Konfigurasi dan hasilkan jadwal mata pelajaran tanpa bentrok.</p>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto hide-scrollbar">
        {[
          { id: "mapel", label: "Master Mapel", icon: FileText },
          { id: "jam", label: "Waktu Jam Pelajaran", icon: Settings },
          { id: "plotting", label: "Aturan & Plotting", icon: Settings2 },
          { id: "hasil", label: "Generate & Hasil", icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id 
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {activeTab === "mapel" && <TabMapel />}
        {activeTab === "jam" && <TabJam />}
        {activeTab === "plotting" && <TabPlotting />}
        {activeTab === "hasil" && <TabHasil />}
      </div>
    </div>
  );
}

// =====================================
// TABS COMPONENTS
// =====================================

function TabMapel() {
  const [mapels, setMapels] = useState([]);
  const [form, setForm] = useState({ kode: "", nama: "", kategori: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchMapel(); }, []);

  const fetchMapel = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/mapel`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.ok) setMapels(await res.json());
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/mapel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success("Mata pelajaran ditambahkan");
        setForm({ kode: "", nama: "", kategori: "" });
        fetchMapel();
      } else {
        toast.error("Gagal menambahkan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus mapel ini?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/mapel/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      toast.success("Berhasil dihapus");
      fetchMapel();
    } catch (e) {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/3">
        <h3 className="font-bold text-lg mb-4">Tambah Mata Pelajaran</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Mapel</label>
            <input required value={form.kode} onChange={e => setForm({...form, kode: e.target.value})} placeholder="Mis: MAT" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
            <input required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} placeholder="Mis: Matematika Lanjut" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
            <input value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} placeholder="Mis: Umum / Diniyyah" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan Mapel"}
          </button>
        </form>
      </div>
      <div className="w-full lg:w-2/3">
        <h3 className="font-bold text-lg mb-4">Daftar Mapel</h3>
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-sm">
              <tr>
                <th className="p-3">Kode</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Kategori</th>
                <th className="p-3 w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
              {mapels.length === 0 && (
                <tr><td colSpan="4" className="p-4 text-center text-slate-500">Belum ada data</td></tr>
              )}
              {mapels.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-bold">{m.kode}</td>
                  <td className="p-3">{m.nama}</td>
                  <td className="p-3"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">{m.kategori || "-"}</span></td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 p-1">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TabJam() {
  const [jams, setJams] = useState([]);
  const [form, setForm] = useState({ hari: "Senin", jpKe: 1, jamMulai: "07:00", jamSelesai: "07:45", isIstirahat: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchJam(); }, []);

  const fetchJam = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/jam`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.ok) setJams(await res.json());
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/jam`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success("Waktu JP disimpan");
        fetchJam();
      } else {
        toast.error("Gagal menyimpan");
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/jam/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      fetchJam();
    } catch (e) {}
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/3">
        <h3 className="font-bold text-lg mb-4">Set Jam Pelajaran</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Hari</label>
            <select value={form.hari} onChange={e => setForm({...form, hari: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl">
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">JP Ke-</label>
              <input type="number" min="1" value={form.jpKe} onChange={e => setForm({...form, jpKe: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Istirahat?</label>
              <div className="mt-2.5">
                <input type="checkbox" checked={form.isIstirahat} onChange={e => setForm({...form, isIstirahat: e.target.checked})} className="w-5 h-5 accent-emerald-500" />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Mulai</label>
              <input type="time" value={form.jamMulai} onChange={e => setForm({...form, jamMulai: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Selesai</label>
              <input type="time" value={form.jamSelesai} onChange={e => setForm({...form, jamSelesai: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">Simpan Jam</button>
        </form>
      </div>
      <div className="w-full lg:w-2/3">
        <h3 className="font-bold text-lg mb-4">Daftar Jam</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {jams.map(j => (
            <div key={j.id} className={`p-3 rounded-xl border relative ${j.isIstirahat ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
              <button onClick={() => handleDelete(j.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">&times;</button>
              <div className="font-bold text-sm">{j.hari}</div>
              <div className="text-xl font-black my-1">{j.isIstirahat ? "Istirahat" : `JP ${j.jpKe}`}</div>
              <div className="text-xs text-slate-500 font-mono">{j.jamMulai} - {j.jamSelesai}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabPlotting() {
  const [plots, setPlots] = useState([]);
  const [gurus, setGurus] = useState([]);
  const [mapels, setMapels] = useState([]);
  const [kelas, setKelas] = useState([]);
  
  const [form, setForm] = useState({ guruId: "", mapelId: "", kelasId: "", totalJpMingguan: 4, maxConsecutive: 2 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlotting();
    fetchDependencies();
  }, []);

  const fetchPlotting = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/plotting`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.ok) setPlots(await res.json());
    } catch (e) {}
  };

  const fetchDependencies = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("admin_token")}` };
    const p1 = fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/sdm/pegawai`, { headers }).then(r=>r.json());
    const p2 = fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/mapel`, { headers }).then(r=>r.json());
    const p3 = fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/santri-settings/kelas`, { headers }).then(r=>r.json());
    
    try {
      const [g, m, k] = await Promise.all([p1, p2, p3]);
      setGurus(g.data || []);
      setMapels(Array.isArray(m) ? m : []);
      setKelas(k.kelas || []);
    } catch (e) { console.error(e) }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/plotting`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success("Plotting ditambahkan");
        fetchPlotting();
      } else {
        toast.error("Gagal menambahkan");
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/plotting/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      fetchPlotting();
    } catch (e) {}
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/3">
        <h3 className="font-bold text-lg mb-4">Tambah Plotting</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Guru</label>
            <select required value={form.guruId} onChange={e => setForm({...form, guruId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl">
              <option value="">-- Pilih Guru --</option>
              {gurus.map(g => <option key={g.id} value={g.id}>{g.namaLengkap || g.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Mata Pelajaran</label>
            <select required value={form.mapelId} onChange={e => setForm({...form, mapelId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl">
              <option value="">-- Pilih Mapel --</option>
              {mapels.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Kelas</label>
            <select required value={form.kelasId} onChange={e => setForm({...form, kelasId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl">
              <option value="">-- Pilih Kelas --</option>
              {kelas.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Total JP / Mgg</label>
              <input type="number" min="1" required value={form.totalJpMingguan} onChange={e => setForm({...form, totalJpMingguan: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Max Rentet</label>
              <input type="number" min="1" required value={form.maxConsecutive} onChange={e => setForm({...form, maxConsecutive: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">Plotting Guru</button>
        </form>
      </div>
      <div className="w-full lg:w-2/3">
        <h3 className="font-bold text-lg mb-4">Daftar Plotting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plots.map(p => (
            <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl relative">
              <button onClick={() => handleDelete(p.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Settings2 size={16} /></button>
              <div className="font-bold text-emerald-600 dark:text-emerald-400">{p.mapel?.nama}</div>
              <div className="text-sm font-semibold mt-1">{p.guru?.namaLengkap || p.guru?.nama}</div>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">Kelas {p.kelas?.nama}</span>
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">{p.totalJpMingguan} JP/Mgg</span>
                <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded">Max {p.maxConsecutive} Rentet</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabHasil() {
  const [jadwal, setJadwal] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [kelas, setKelas] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("ALL");

  useEffect(() => {
    fetchJadwal();
    fetchKelas();
  }, []);

  const fetchJadwal = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/generate`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.ok) setJadwal(await res.json());
    } catch (e) {}
  };

  const fetchKelas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/santri-settings/kelas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      const data = await res.json();
      if (res.ok) setKelas(data.kelas || []);
    } catch (e) {}
  };

  const handleGenerate = async () => {
    if (!confirm("Peringatan: Membuat jadwal baru akan menghapus semua hasil jadwal sebelumnya. Lanjutkan?")) return;
    setGenerating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/litbang/jadwal/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchJadwal();
      } else {
        toast.error(data.message || "Gagal generate jadwal");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan server");
    }
    setGenerating(false);
  };

  const filteredJadwal = selectedKelas === "ALL" 
    ? jadwal 
    : jadwal.filter(j => j.kelasId.toString() === selectedKelas);

  // Group by day and time for visualization
  const scheduleGrid = {}; // { [hari]: { [jpKe]: [slots] } }
  
  filteredJadwal.forEach(slot => {
    const hari = slot.pengaturanJam.hari;
    const jpKe = slot.pengaturanJam.jpKe;
    if (!scheduleGrid[hari]) scheduleGrid[hari] = {};
    if (!scheduleGrid[hari][jpKe]) scheduleGrid[hari][jpKe] = [];
    scheduleGrid[hari][jpKe].push(slot);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
        <div>
          <h3 className="text-emerald-800 dark:text-emerald-400 font-bold text-lg">Generate Jadwal Otomatis</h3>
          <p className="text-emerald-600 dark:text-emerald-500 text-sm mt-1">Sistem akan menyusun jadwal berdasarkan pengaturan jam dan plotting yang ada tanpa bentrok.</p>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={generating}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
          {generating ? "Menyusun Jadwal..." : "Jalankan Generator"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Visualisasi Jadwal</h3>
        <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm font-semibold">
          <option value="ALL">Semua Kelas</option>
          {kelas.map(k => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
        </select>
      </div>

      {jadwal.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 font-medium">Jadwal belum digenerate. Klik "Jalankan Generator" di atas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-left w-32 border-r border-slate-200 dark:border-slate-700">Hari / JP</th>
                <th className="p-3 text-left">Pelajaran & Kelas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(hari => (
                <tr key={hari} className="divide-x divide-slate-200 dark:divide-slate-800">
                  <td className="p-4 align-top font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900">
                    {hari}
                  </td>
                  <td className="p-4">
                    {scheduleGrid[hari] ? (
                      <div className="space-y-4">
                        {Object.keys(scheduleGrid[hari]).sort().map(jpKe => (
                          <div key={jpKe} className="flex flex-col sm:flex-row gap-3 items-start border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                            <span className="shrink-0 w-16 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-center py-1 rounded">JP {jpKe}</span>
                            <div className="flex flex-wrap gap-2">
                              {scheduleGrid[hari][jpKe].map(slot => (
                                <div key={slot.id} className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg shadow-sm">
                                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{slot.mapel?.nama}</div>
                                  <div className="mt-1 text-slate-600 dark:text-slate-400">{slot.guru?.namaLengkap || slot.guru?.nama}</div>
                                  {selectedKelas === "ALL" && (
                                    <div className="mt-1 text-[10px] bg-slate-100 dark:bg-slate-900 inline-block px-1.5 py-0.5 rounded font-bold">Kls {slot.kelas?.nama}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Libur / Kosong</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
