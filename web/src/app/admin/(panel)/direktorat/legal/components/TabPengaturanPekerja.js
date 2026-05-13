import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, X } from "lucide-react";

export default function TabPengaturanPekerja() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: "", nama: "", kategori: "Tukang Kayu", kontak: "", upahHarian: 0 });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/pembangunan/workers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/pembangunan/workers/${form.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/pembangunan/workers`;
      
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nama: form.nama,
          kategori: form.kategori,
          kontak: form.kontak,
          upahHarian: Number(form.upahHarian)
        })
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus data pekerja ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/pembangunan/workers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (worker = null) => {
    setError(null);
    if (worker) {
      setIsEdit(true);
      setForm({ ...worker });
    } else {
      setIsEdit(false);
      setForm({ id: "", nama: "", kategori: "Tukang Kayu", kontak: "", upahHarian: 0 });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Data Pekerja / Tukang</h4>
          <p className="text-sm text-slate-500">Kelola master data pekerja bangunan, mandor, dan keahliannya.</p>
        </div>
        <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-2">
          <Plus size={16} /> Tambah Pekerja
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Nama Pekerja</th>
              <th className="px-6 py-4">Kategori / Keahlian</th>
              <th className="px-6 py-4">Kontak</th>
              <th className="px-6 py-4 text-right">Upah Harian</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Belum ada data pekerja.</td></tr>
            ) : (
              data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{item.nama}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.kategori}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.kontak || '-'}</td>
                  <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    Rp {Number(item.upahHarian).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{isEdit ? 'Edit Pekerja' : 'Tambah Pekerja'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl">{error}</div>}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap *</label>
                <input required type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Kategori / Keahlian *</label>
                <input required type="text" placeholder="Cth: Tukang Batu, Mandor" value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Kontak</label>
                <input type="text" value={form.kontak} onChange={e => setForm({...form, kontak: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Upah Harian (Rp) *</label>
                <input required type="number" min="0" value={form.upahHarian} onChange={e => setForm({...form, upahHarian: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
