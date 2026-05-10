export default function DonasiPage() {
  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 bg-rose-100 rounded-full flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-rose-700 text-sm">Donasi untuk Madinatul Qur'an</p>
          <p className="text-xs text-rose-500 mt-0.5">
            Setiap donasi Anda membantu pengembangan fasilitas dan beasiswa santri yang membutuhkan.
          </p>
        </div>
      </div>

      {/* Program Donasi (placeholder) */}
      <div>
        <h2 className="text-base font-bold text-text-primary mb-3">Program Donasi Aktif</h2>
        <div className="flex flex-col items-center justify-center py-14 text-center text-text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="font-medium text-slate-500">Belum ada program donasi</p>
          <p className="text-sm mt-1 text-slate-400">Program donasi yang tersedia akan ditampilkan di sini.</p>
        </div>
      </div>

      {/* Riwayat Donasi */}
      <div>
        <h2 className="text-base font-bold text-text-primary mb-3">Riwayat Donasi Saya</h2>
        <div className="flex flex-col items-center justify-center py-10 text-center text-text-secondary border border-dashed border-slate-200 rounded-xl">
          <p className="font-medium text-slate-500">Belum ada riwayat donasi</p>
        </div>
      </div>
    </div>
  );
}
