import { Download, FileText, CheckCircle2, AlertCircle, Clock, Check } from "lucide-react";

export default function TabPenggajianGlobal() {
  const rekapGaji = [
    { nama: "Ahmad Fulan", posisi: "Pengajar Tahfidz", pokok: 3000000, tunjangan: 1500000, potongan: 500000, total: 4000000, status: "SIAP" },
    { nama: "Siti Fulanah", posisi: "Staf Administrasi", pokok: 2500000, tunjangan: 1000000, potongan: 0, total: 3500000, status: "SIAP" },
    { nama: "Budi Santoso", posisi: "Keamanan", pokok: 2000000, tunjangan: 500000, potongan: 100000, total: 2400000, status: "REVIEW" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800/30 p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Periode Penggajian</h2>
            <div className="flex gap-4 mt-3">
              <select className="px-4 py-2 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700 dark:text-emerald-400">
                <option>April</option>
                <option>Mei</option>
                <option>Juni</option>
              </select>
              <select className="px-4 py-2 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700 dark:text-emerald-400">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-5 py-3 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm transition-colors text-sm flex items-center justify-center gap-2">
              <FileText size={18} /> Export Excel
            </button>
            <button className="flex-1 md:flex-none px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-500/30 transition-colors text-sm flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> Ajukan ke Keuangan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Pegawai Diproses</p>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">45 <span className="text-sm font-medium text-slate-500">Orang</span></p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Estimasi Total Penggajian</p>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">Rp 145.000.000</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Status Dokumen</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-500">Draf / Menunggu Review</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Rincian Penggajian</h3>
          <button className="text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Generate Gaji Massal</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama & Jabatan</th>
                <th className="px-6 py-4 text-right">Gaji Pokok</th>
                <th className="px-6 py-4 text-right">Tunjangan</th>
                <th className="px-6 py-4 text-right">Potongan (Kasbon dll)</th>
                <th className="px-6 py-4 text-right">Total Bersih</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rekapGaji.map((gaji, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{gaji.nama}</p>
                    <p className="text-[11px] text-slate-500">{gaji.posisi}</p>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">Rp {gaji.pokok.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">+Rp {gaji.tunjangan.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right text-rose-600 dark:text-rose-400">-Rp {gaji.potongan.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-200">Rp {gaji.total.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-center">
                    {gaji.status === 'SIAP' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200">SIAP DIAJUKAN</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-200 flex items-center justify-center gap-1 w-max mx-auto"><AlertCircle size={10} /> PERLU REVIEW</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Edit Detail</button>
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
