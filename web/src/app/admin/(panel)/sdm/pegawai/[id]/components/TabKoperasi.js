import { Landmark, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export default function TabKoperasi() {
  const riwayatSimpanan = [
    { tanggal: "25 Apr 2026", jenis: "SIMPANAN_WAJIB", nominal: 50000, tipe: "IN", saldoAkhir: 2350000 },
    { tanggal: "25 Mar 2026", jenis: "SIMPANAN_WAJIB", nominal: 50000, tipe: "IN", saldoAkhir: 2300000 },
    { tanggal: "01 Mar 2026", jenis: "BAGI_HASIL", nominal: 120000, tipe: "IN", saldoAkhir: 2250000 },
    { tanggal: "25 Feb 2026", jenis: "SIMPANAN_WAJIB", nominal: 50000, tipe: "IN", saldoAkhir: 2130000 },
    { tanggal: "10 Feb 2026", jenis: "PENARIKAN", nominal: 500000, tipe: "OUT", saldoAkhir: 2080000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800/30 p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-indigo-800/60 dark:text-indigo-400/60 uppercase tracking-widest mb-1">Total Saldo Simpanan</p>
              <h2 className="text-3xl md:text-5xl font-black text-indigo-700 dark:text-indigo-400 tracking-tight mt-2">
                <span className="text-xl md:text-2xl mr-1 opacity-70">Rp</span>2.350.000
              </h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
              <Landmark size={32} strokeWidth={2} />
            </div>
          </div>
          
          <div className="mt-8 pt-5 border-t border-indigo-200/50 dark:border-indigo-800/30 flex gap-8">
            <div>
              <p className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase">Simpanan Pokok</p>
              <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200 mt-1">Rp 100.000</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase">Simpanan Wajib</p>
              <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200 mt-1">Rp 1.850.000</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase">SHU / Bagi Hasil</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">+ Rp 400.000</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Activity size={18} className="text-indigo-500" /> Aksi Cepat
          </h3>
          <div className="space-y-3">
            <button className="w-full py-2.5 px-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-sm font-bold rounded-xl border border-indigo-100 dark:border-indigo-800/30 transition-colors text-left flex justify-between items-center">
              Tambah Simpanan Sukarela <ArrowUpRight size={16} opacity={0.5} />
            </button>
            <button className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors text-left flex justify-between items-center">
              Ajukan Penarikan Saldo <ArrowDownRight size={16} opacity={0.5} />
            </button>
          </div>
        </div>

      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Mutasi Koperasi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Jenis Transaksi</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {riwayatSimpanan.map((mutasi, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{mutasi.tanggal}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {mutasi.jenis.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 font-bold ${mutasi.tipe === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {mutasi.tipe === 'IN' ? '+' : '-'} Rp {mutasi.nominal.toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                    Rp {mutasi.saldoAkhir.toLocaleString('id-ID')}
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
