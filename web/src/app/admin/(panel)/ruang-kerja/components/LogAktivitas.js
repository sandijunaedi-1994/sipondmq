"use client";

import { useEffect, useState } from "react";

export default function LogAktivitas() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 50, totalPages: 1 });

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/activity-logs?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data log aktivitas");
      }

      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, limit: 20, totalPages: 1 });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  const getActionColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'CREATE': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
      case 'UPDATE': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20';
      case 'DELETE': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20';
      case 'LOGIN': return 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Log Aktivitas Sistem</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
            Rekam jejak setiap aksi krusial yang terjadi di dalam aplikasi.
          </p>
        </div>
        <button 
          onClick={() => fetchLogs(1)}
          className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="Refresh"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
        </button>
      </div>
      
      {error && <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm border border-red-200">{error}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] transition-colors">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Aksi</th>
                <th className="px-6 py-4">Modul / Entitas</th>
                <th className="px-6 py-4 w-full">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8">
                    <div className="flex justify-center items-center gap-3 text-slate-500 dark:text-slate-400">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      Memuat data log...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500 dark:text-slate-400 transition-colors">
                    Tidak ada riwayat aktivitas.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs transition-colors">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 transition-colors">
                      <div className="flex flex-col">
                        <span>{log.user?.namaLengkap || "Sistem"}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{log.user?.email || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 border rounded text-[10px] font-bold tracking-wide uppercase transition-colors ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-normal text-xs transition-colors">
                      {log.details || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchLogs(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Sebelumnya
            </button>
            <button 
              onClick={() => fetchLogs(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
