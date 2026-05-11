import { Check, X, Clock, AlertTriangle, FileText } from "lucide-react";

export default function TabKasbonGlobal() {
  const pengajuanKasbon = [
    { nama: "Ust. Fulan", jabatan: "Pengajar Tahfidz", nominal: 1000000, tujuan: "Biaya masuk sekolah anak", tanggal: "26 April 2026", status: "PENDING" },
    { nama: "Bapak Budi", jabatan: "Keamanan", nominal: 500000, tujuan: "Perbaikan kendaraan operasional", tanggal: "25 April 2026", status: "PENDING" },
    { nama: "Ibu Siti", jabatan: "Staf Kebersihan", nominal: 300000, tujuan: "Keperluan keluarga", tanggal: "20 April 2026", status: "DISETUJUI" },
    { nama: "Ust. Mahmud", jabatan: "Wali Asrama", nominal: 2500000, tujuan: "Renovasi rumah", tanggal: "15 April 2026", status: "DITOLAK" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Menunggu Persetujuan</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-black text-amber-500">2</p>
            <p className="text-sm font-medium text-slate-500 pb-1">Pengajuan</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Kasbon Disetujui (Bulan Ini)</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">5</p>
            <p className="text-sm font-medium text-slate-500 pb-1">Pegawai</p>
          </div>
        </div>
        <div className="md:col-span-2 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 p-5 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-800/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-rose-800/60 dark:text-rose-400/60">Total Outstanding Kasbon</p>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">Rp 12.450.000</p>
            <p className="text-[11px] font-semibold text-rose-600/80 dark:text-rose-400/80 mt-0.5">Yang belum lunas dipotong gaji</p>
          </div>
          <button className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl shadow-sm transition-colors border border-rose-200 dark:border-rose-800/50 flex items-center gap-2">
            <FileText size={14} /> Report Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Daftar Pengajuan Kasbon</h3>
            <p className="text-xs text-slate-500 mt-1">Kelola persetujuan kasbon pegawai sebelum diteruskan ke Keuangan</p>
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-300">
              <option>Semua Status</option>
              <option>Menunggu Review</option>
              <option>Disetujui</option>
              <option>Ditolak</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tgl. Pengajuan</th>
                <th className="px-6 py-4">Pegawai</th>
                <th className="px-6 py-4">Tujuan / Keperluan</th>
                <th className="px-6 py-4 text-right">Nominal Ajuan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi (HR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pengajuanKasbon.map((kasbon, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">{kasbon.tanggal}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{kasbon.nama}</p>
                    <p className="text-[10px] text-slate-500">{kasbon.jabatan}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 max-w-[200px]">{kasbon.tujuan}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-rose-600 dark:text-rose-400">
                    Rp {kasbon.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {kasbon.status === 'PENDING' && <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg border border-amber-200 flex items-center justify-center gap-1 w-max mx-auto"><Clock size={10} /> REVIEW HR</span>}
                    {kasbon.status === 'DISETUJUI' && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-200 flex items-center justify-center gap-1 w-max mx-auto"><Check size={10} /> DISETUJUI</span>}
                    {kasbon.status === 'DITOLAK' && <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1 w-max mx-auto"><X size={10} /> DITOLAK</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {kasbon.status === 'PENDING' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors" title="Setujui">
                          <Check size={16} />
                        </button>
                        <button className="p-1.5 bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors" title="Tolak">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium italic">Diproses</span>
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
