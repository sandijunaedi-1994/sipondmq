import { Plus, Receipt, AlertTriangle } from "lucide-react";

export default function TabKasbon() {
  const riwayatKasbon = [
    { tanggal: "10 Mar 2026", nominal: 500000, keterangan: "Keperluan keluarga", status: "BELUM_LUNAS" },
    { tanggal: "05 Feb 2026", nominal: 1000000, keterangan: "Biaya sekolah anak", status: "LUNAS" },
    { tanggal: "12 Des 2025", nominal: 300000, keterangan: "Service kendaraan", status: "LUNAS" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-800/30 p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-rose-800/60 dark:text-rose-400/60 uppercase tracking-widest mb-1">Sisa Kasbon Aktif</p>
              <h2 className="text-3xl md:text-4xl font-black text-rose-700 dark:text-rose-400 tracking-tight">
                <span className="text-xl md:text-2xl mr-1 opacity-70">Rp</span>500.000
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Receipt size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="pt-4 border-t border-rose-200/50 dark:border-rose-800/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-rose-600/80 dark:text-rose-400/80 font-medium">Batas Maksimal Kasbon</span>
              <span className="font-bold text-rose-700 dark:text-rose-300">Rp 1.500.000</span>
            </div>
            <div className="w-full bg-rose-100 dark:bg-rose-950 rounded-full h-2 mt-3">
              <div className="bg-rose-500 h-2 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
            <Plus size={32} />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Ajukan Kasbon Baru</h3>
          <p className="text-xs text-slate-500 max-w-[250px] mb-4">Pengajuan kasbon akan ditinjau oleh Bagian Keuangan dan dipotong otomatis dari gaji.</p>
          <button className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm">
            Buat Pengajuan
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Riwayat Kasbon</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Tanggal Pengajuan</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {riwayatKasbon.map((kasbon, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{kasbon.tanggal}</td>
                  <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400">Rp {kasbon.nominal.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{kasbon.keterangan}</td>
                  <td className="px-6 py-4">
                    {kasbon.status === 'LUNAS' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full">LUNAS (Dipotong Gaji)</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-[10px] font-bold rounded-full flex items-center gap-1 w-max">
                        <AlertTriangle size={10} /> BELUM LUNAS
                      </span>
                    )}
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
