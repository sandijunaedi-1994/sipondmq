"use client";

import Navbar from "../../components/Navbar";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "Pendaftaran Berhasil",
      message: "Terima kasih, pendaftaran calon santri baru telah berhasil disubmit. Silakan pantau tahapan selanjutnya di menu Timeline PPDB.",
      date: new Date().toLocaleDateString('id-ID'),
      read: true
    },
    {
      id: 2,
      title: "Tagihan Registrasi Terbit",
      message: "Tagihan untuk biaya registrasi PPDB telah diterbitkan. Segera lakukan pembayaran untuk melanjutkan ke tahap Kelengkapan Data.",
      date: new Date().toLocaleDateString('id-ID'),
      read: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto p-4 py-8 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold text-primary-dark">Notifikasi</h1>
          <button className="text-sm text-primary hover:text-primary-dark font-medium">Tandai semua dibaca</button>
        </div>

        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-5 rounded-xl border transition ${notif.read ? 'bg-surface border-slate-200' : 'bg-primary/5 border-primary/20 shadow-sm'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold ${notif.read ? 'text-slate-700' : 'text-primary-dark'}`}>{notif.title}</h3>
                <span className="text-xs text-text-secondary">{notif.date}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {notif.message}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
