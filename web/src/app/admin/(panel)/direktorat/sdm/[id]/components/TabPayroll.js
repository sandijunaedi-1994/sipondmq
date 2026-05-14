import { FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";

export default function TabPayroll() {
  const riwayatGaji = [];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800/30 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <p className="text-sm font-bold text-emerald-800/60 dark:text-emerald-400/60 uppercase tracking-widest mb-1">Gaji Bulan Ini</p>
            <h2 className="text-3xl md:text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
              <span className="text-xl md:text-2xl mr-1 opacity-70">Rp</span>0
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">-</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Belum ada data
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm transition-colors text-sm">
            <Download size={16} /> Unduh Slip Gaji
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Riwayat Penggajian</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Periode</th>
                <th className="px-6 py-4">Gaji Pokok</th>
                <th className="px-6 py-4">Tunjangan</th>
                <th className="px-6 py-4">Potongan</th>
                <th className="px-6 py-4">Total Bersih</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {riwayatGaji.map((gaji, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{gaji.periode}</p>
                    <p className="text-[10px] text-slate-500">Cair: {gaji.tanggal}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Rp {gaji.pokok.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">+Rp {gaji.tunjangan.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-rose-600 dark:text-rose-400">-Rp {gaji.potongan.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">Rp {gaji.bersih.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors" title="Lihat Slip">
                      <FileText size={18} />
                    </button>
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
