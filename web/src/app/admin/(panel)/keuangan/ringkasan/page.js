"use client";

export default function RingkasanTagihanPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Ringkasan Tagihan Santri</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Lihat data keseluruhan santri beserta status tagihan dan pembayaran yang telah masuk.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center min-h-[400px] transition-colors">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 transition-colors">Modul Belum Tersedia</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 transition-colors">Halaman ini masih dalam tahap kerangka (skeleton) dan akan segera dikembangkan di fase berikutnya.</p>
        <button disabled className="mt-6 px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold rounded-lg cursor-not-allowed transition-colors">Export Data Laporan</button>
      </div>
    </div>
  );
}
