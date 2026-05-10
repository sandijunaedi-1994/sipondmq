"use client";

export default function TagihanKhususPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Tagihan Khusus (Tentative)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Kelola tagihan insidental atau tambahan yang tidak rutin di luar tagihan pokok.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center min-h-[400px] transition-colors">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 transition-colors">Modul Belum Tersedia</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 transition-colors">Halaman ini masih dalam tahap kerangka (skeleton) dan akan segera dikembangkan di fase berikutnya.</p>
        <button disabled className="mt-6 px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold rounded-lg cursor-not-allowed transition-colors">Buat Tagihan Khusus</button>
      </div>
    </div>
  );
}
