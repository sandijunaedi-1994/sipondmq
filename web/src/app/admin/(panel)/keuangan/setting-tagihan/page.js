"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingTagihanPage() {
  const router = useRouter();
  const [tahunAjarans, setTahunAjarans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [taModalOpen, setTaModalOpen] = useState(false);
  const [taForm, setTaForm] = useState({ id: "", nama: "", tanggalMulai: "", tanggalSelesai: "", aktif: false });

  const [periodeModalOpen, setPeriodeModalOpen] = useState(false);
  const [periodeForm, setPeriodeForm] = useState({
    id: "", tahunAjaranId: "", nama: "", tanggalMulai: "", tanggalSelesai: "", program: "SD", uangPangkal: "", spp: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/finance/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTahunAjarans(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTA = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const url = taForm.id 
        ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/finance/settings/${taForm.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/finance/settings`;
      const method = taForm.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(taForm)
      });
      if (res.ok) {
        setTaModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menyimpan");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  const handleDeleteTA = async (id) => {
    if (!confirm("Hapus tahun ajaran ini? Semua periode di dalamnya akan terhapus.")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/finance/settings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const handleSavePeriode = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const url = periodeForm.id
        ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/finance/settings/periode/${periodeForm.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/finance/settings/${periodeForm.tahunAjaranId}/periode`;
      const method = periodeForm.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...periodeForm,
          uangPangkal: Number(periodeForm.uangPangkal.replace(/\D/g, '')),
          spp: Number(periodeForm.spp.replace(/\D/g, ''))
        })
      });
      if (res.ok) {
        setPeriodeModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menyimpan periode");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  const handleDeletePeriode = async (id) => {
    if (!confirm("Hapus periode ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/finance/settings/periode/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const formatCurrency = (val) => {
    if (!val) return "Rp 0";
    return "Rp " + Number(val).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Pengaturan Biaya PPDB & SPP</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Atur daftar Tahun Ajaran dan Gelombang (Periode) pendaftaran.</p>
        </div>
        <button 
          onClick={() => { setTaForm({ id: "", nama: "", tanggalMulai: "", tanggalSelesai: "", aktif: false }); setTaModalOpen(true); }}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-md shadow-emerald-500/20"
        >
          + Tambah Tahun Ajaran
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tahunAjarans.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center transition-colors">
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Belum ada pengaturan Tahun Ajaran.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {tahunAjarans.map(ta => (
            <div key={ta.id} className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border ${ta.aktif ? 'border-emerald-300 ring-1 ring-emerald-300' : 'border-slate-200 dark:border-slate-800'} overflow-hidden transition-colors`}>
              <div className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 ${ta.aktif ? 'bg-emerald-50/50' : 'bg-slate-50 dark:bg-slate-950'} transition-colors`}>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 transition-colors">{ta.nama}</h3>
                    {ta.aktif && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">Aktif Digunakan</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                    Periode Aktif: {ta.tanggalMulai ? new Date(ta.tanggalMulai).toLocaleDateString('id-ID') : '-'} s/d {ta.tanggalSelesai ? new Date(ta.tanggalSelesai).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setTaForm({ id: ta.id, nama: ta.nama, tanggalMulai: ta.tanggalMulai?.split('T')[0] || "", tanggalSelesai: ta.tanggalSelesai?.split('T')[0] || "", aktif: ta.aktif }); setTaModalOpen(true); }}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTA(ta.id)}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition"
                  >
                    Hapus
                  </button>
                  <button 
                    onClick={() => { setPeriodeForm({ id: "", tahunAjaranId: ta.id, nama: "", tanggalMulai: "", tanggalSelesai: "", program: "SD", uangPangkal: "", spp: "" }); setPeriodeModalOpen(true); }}
                    className="px-3 py-1.5 text-sm bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition border border-emerald-200 ml-2"
                  >
                    + Tambah Gelombang
                  </button>
                </div>
              </div>
              
              <div className="p-0 overflow-x-auto">
                {ta.periodes?.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b transition-colors">
                      <tr>
                        <th className="px-6 py-3">Gelombang / Periode</th>
                        <th className="px-6 py-3">Program</th>
                        <th className="px-6 py-3">Tanggal Mulai - Selesai</th>
                        <th className="px-6 py-3 text-right">Uang Pangkal</th>
                        <th className="px-6 py-3 text-right">SPP Bulanan</th>
                        <th className="px-6 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ta.periodes.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:bg-slate-950/50 transition-colors">
                          <td className="px-6 py-3 font-bold text-slate-700 dark:text-slate-200 transition-colors">{p.nama}</td>
                          <td className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 transition-colors">{p.program.replace('_', ' ')}</td>
                          <td className="px-6 py-3 text-slate-500 dark:text-slate-400 transition-colors">
                            {new Date(p.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(p.tanggalSelesai).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-3 text-right font-bold text-emerald-600">{formatCurrency(p.uangPangkal)}</td>
                          <td className="px-6 py-3 text-right font-bold text-blue-600">{formatCurrency(p.spp)}</td>
                          <td className="px-6 py-3 text-right">
                            <button 
                              onClick={() => { setPeriodeForm({ id: p.id, tahunAjaranId: ta.id, nama: p.nama, tanggalMulai: p.tanggalMulai?.split('T')[0], tanggalSelesai: p.tanggalSelesai?.split('T')[0], program: p.program, uangPangkal: p.uangPangkal, spp: p.spp }); setPeriodeModalOpen(true); }}
                              className="text-blue-500 hover:text-blue-700 mx-2 font-bold text-xs uppercase"
                            >Edit</button>
                            <button 
                              onClick={() => handleDeletePeriode(p.id)}
                              className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                            >Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-sm text-slate-400">
                    Belum ada gelombang / periode yang diatur. Silakan tambahkan.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal TA */}
      {taModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{taForm.id ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}</h3>
              <button onClick={() => setTaModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSaveTA} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Nama / Periode (Misal: 2027/2028)</label>
                <input required type="text" value={taForm.nama} onChange={e => setTaForm({...taForm, nama: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none border-slate-300 dark:border-slate-700 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Tgl Mulai</label>
                  <input type="date" value={taForm.tanggalMulai} onChange={e => setTaForm({...taForm, tanggalMulai: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none border-slate-300 dark:border-slate-700 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Tgl Selesai</label>
                  <input type="date" value={taForm.tanggalSelesai} onChange={e => setTaForm({...taForm, tanggalSelesai: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none border-slate-300 dark:border-slate-700 transition-colors" />
                </div>
              </div>
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer transition-colors">
                <input type="checkbox" checked={taForm.aktif} onChange={e => setTaForm({...taForm, aktif: e.target.checked})} className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors">Jadikan Tahun Ajaran Aktif Saat Ini</span>
              </label>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setTaModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 shadow-md">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Periode */}
      {periodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200 transition-colors">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{periodeForm.id ? 'Edit Gelombang / Periode' : 'Tambah Gelombang / Periode'}</h3>
              <button onClick={() => setPeriodeModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSavePeriode} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Nama Gelombang</label>
                  <input required type="text" placeholder="Cth: Gelombang 1" value={periodeForm.nama} onChange={e => setPeriodeForm({...periodeForm, nama: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none border-slate-300 dark:border-slate-700 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Program</label>
                  <select required value={periodeForm.program} onChange={e => setPeriodeForm({...periodeForm, program: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors">
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="MAHAD_ALY">Ma'had Aly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Tgl Mulai Pendaftaran</label>
                  <input required type="date" value={periodeForm.tanggalMulai} onChange={e => setPeriodeForm({...periodeForm, tanggalMulai: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none border-slate-300 dark:border-slate-700 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Tgl Selesai Pendaftaran</label>
                  <input required type="date" value={periodeForm.tanggalSelesai} onChange={e => setPeriodeForm({...periodeForm, tanggalSelesai: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none border-slate-300 dark:border-slate-700 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 transition-colors">
                <div>
                  <label className="block text-sm font-bold text-emerald-800 mb-1">Nominal Uang Pangkal</label>
                  <input required type="text" placeholder="17000000" value={periodeForm.uangPangkal} onChange={e => setPeriodeForm({...periodeForm, uangPangkal: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none border-emerald-200" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-800 mb-1">Nominal SPP (Bulanan)</label>
                  <input required type="text" placeholder="1900000" value={periodeForm.spp} onChange={e => setPeriodeForm({...periodeForm, spp: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none border-blue-200" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setPeriodeModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 shadow-md">Simpan Periode</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
