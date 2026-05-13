"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [markazList, setMarkazList] = useState([]);
  const [filterMarkaz, setFilterMarkaz] = useState("SEMUA");
  const [filterProgram, setFilterProgram] = useState("SEMUA");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    // Fetch Markaz list once
    const fetchMarkaz = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/markaz`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMarkazList(data.markaz || data || []);
        }
      } catch (err) {
        console.error("Failed to fetch markaz", err);
      }
    };
    fetchMarkaz();
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const query = new URLSearchParams({
          markazId: filterMarkaz,
          program: filterProgram
        });
        
        if (startDate) query.append('startDate', startDate);
        if (endDate) query.append('endDate', endDate);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/dashboard?${query.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [filterMarkaz, filterProgram, startDate, endDate]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  const funnelData = stats ? [
    { name: 'Pendaftaran', count: stats.funnel.PENDAFTARAN || 0 },
    { name: 'Bayar Registrasi', count: stats.funnel.PEMBAYARAN_REGISTRASI || 0 },
    { name: 'Lengkapi Data', count: stats.funnel.KELENGKAPAN_DATA || 0 },
    { name: 'Tes/Wawancara', count: stats.funnel.TES_WAWANCARA || 0 },
    { name: 'Pengumuman', count: stats.funnel.PENGUMUMAN || 0 },
    { name: 'Daftar Ulang', count: stats.funnel.DAFTAR_ULANG || 0 },
    { name: 'Selesai', count: stats.funnel.SELESAI || 0 },
    { name: 'Ditolak', count: stats.funnel.DITOLAK || 0 },
    { name: 'Mundur/Batal', count: 
      (stats.funnel.TIDAK_LANJUT_BAYAR_REGISTRASI || 0) + 
      (stats.funnel.TIDAK_LANJUT_TES || 0) + 
      (stats.funnel.TIDAK_LANJUT_DAFTAR_ULANG || 0) + 
      (stats.funnel.TIDAK_LANJUT_JADI_SANTRI || 0)
    }
  ] : [];

  const maxDropout = stats ? Math.max(
    stats.summary.tidakLanjutBayar,
    stats.summary.tidakLanjutTes,
    stats.summary.tidakLanjutDaftarUlang,
    stats.summary.tidakLanjutJadiSantri
  ) : 0;

  const getPercentage = (val) => {
    if (!stats || !stats.summary || !stats.summary.daftar) return '0%';
    return Math.round((val / stats.summary.daftar) * 100) + '%';
  };

  return (
    <div className="space-y-6">
      {/* ── Dashboard Header & Filters ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard SPMB</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pusat analitik pendaftar dan seleksi santri baru</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="flex gap-3 w-full sm:w-auto">
            <select 
              value={filterMarkaz}
              onChange={(e) => setFilterMarkaz(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer w-full sm:w-auto"
            >
              <option value="SEMUA">Semua Markaz</option>
              {markazList.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <select 
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer w-full sm:w-auto"
            >
              <option value="SEMUA">Semua Program</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="MAHAD_ALY">Ma'had Aly</option>
            </select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-full"
              title="Dari Tanggal"
            />
            <span className="text-slate-400 font-bold">-</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-full"
              title="Sampai Tanggal"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
          <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
        </div>
      ) : stats ? (
        <>
          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors">Daftar</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 transition-colors">{stats.summary.daftar}</p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
              </div>
              <div className={`text-[10px] p-2 rounded-lg border flex justify-between items-center transition-colors ${maxDropout > 0 && stats.summary.tidakLanjutBayar === maxDropout ? 'bg-rose-100 border-rose-300 text-rose-800 font-semibold shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'}`}>
                <span>Tidak Lanjut Bayar:</span>
                <span className={`font-bold ${maxDropout > 0 && stats.summary.tidakLanjutBayar === maxDropout ? 'text-rose-600 text-xs' : 'text-red-500'}`}>
                  {stats.summary.tidakLanjutBayar} <span className="opacity-70 font-normal">({getPercentage(stats.summary.tidakLanjutBayar)})</span>
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors">Bayar Registrasi</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 transition-colors">{stats.summary.bayarRegistrasi}</p>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
              </div>
              <div className={`text-[10px] p-2 rounded-lg border flex justify-between items-center transition-colors ${maxDropout > 0 && stats.summary.tidakLanjutTes === maxDropout ? 'bg-rose-100 border-rose-300 text-rose-800 font-semibold shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'}`}>
                <span>Tidak Lanjut Tes:</span>
                <span className={`font-bold ${maxDropout > 0 && stats.summary.tidakLanjutTes === maxDropout ? 'text-rose-600 text-xs' : 'text-red-500'}`}>
                  {stats.summary.tidakLanjutTes} <span className="opacity-70 font-normal">({getPercentage(stats.summary.tidakLanjutTes)})</span>
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors">Tes/Wawancara</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 transition-colors">{stats.summary.tesWawancara}</p>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                </div>
              </div>
              <div className={`text-[10px] p-2 rounded-lg border flex justify-between items-center transition-colors ${maxDropout > 0 && stats.summary.tidakLanjutDaftarUlang === maxDropout ? 'bg-rose-100 border-rose-300 text-rose-800 font-semibold shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'}`}>
                <span>Tdk Lanjut Daftar Ulang:</span>
                <span className={`font-bold ${maxDropout > 0 && stats.summary.tidakLanjutDaftarUlang === maxDropout ? 'text-rose-600 text-xs' : 'text-red-500'}`}>
                  {stats.summary.tidakLanjutDaftarUlang} <span className="opacity-70 font-normal">({getPercentage(stats.summary.tidakLanjutDaftarUlang)})</span>
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors">Daftar Ulang</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 transition-colors">{stats.summary.daftarUlang}</p>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <div className={`text-[10px] p-2 rounded-lg border flex justify-between items-center transition-colors ${maxDropout > 0 && stats.summary.tidakLanjutJadiSantri === maxDropout ? 'bg-rose-100 border-rose-300 text-rose-800 font-semibold shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'}`}>
                <span>Tdk Lanjut Jadi Santri:</span>
                <span className={`font-bold ${maxDropout > 0 && stats.summary.tidakLanjutJadiSantri === maxDropout ? 'text-rose-600 text-xs' : 'text-red-500'}`}>
                  {stats.summary.tidakLanjutJadiSantri} <span className="opacity-70 font-normal">({getPercentage(stats.summary.tidakLanjutJadiSantri)})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Tren Pendaftar Harian ── */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-6 transition-colors">Tren Pendaftar Harian</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="count" name="Pendaftar" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Sumber Informasi ── */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-6 transition-colors">Sumber Informasi</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.sources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.sources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Funnel Status Pendaftaran ── */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-6 transition-colors">Funnel Status SPMB</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} margin={{ top: 20, right: 20, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{fontSize: 11, fill: '#64748b'}} 
                      tickLine={false} 
                      axisLine={false} 
                      angle={-35} 
                      textAnchor="end"
                    />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" name="Jumlah" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'Ditolak' || entry.name === 'Mundur/Batal' ? '#ef4444' : 
                          entry.name === 'Selesai' ? '#10b981' : '#3b82f6'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Breakdown Per Markaz & Program ── */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-6 transition-colors">Rekapitulasi Pendaftar per MQBS & Program</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-300 dark:border-slate-700">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider transition-colors">
                      <th className="p-4 font-bold border-r border-slate-300 dark:border-slate-700">MQBS (Markaz)</th>
                      <th className="p-4 font-bold border-r border-slate-300 dark:border-slate-700">Program</th>
                      <th className="p-4 font-bold text-center border-r border-slate-300 dark:border-slate-700">Total Sudah Daftar</th>
                      <th className="p-4 font-bold text-center border-r border-slate-300 dark:border-slate-700">Fix Jadi Santri</th>
                      <th className="p-4 font-bold text-center">Persentase (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 dark:divide-slate-700 text-sm">
                    {stats.breakdown?.length > 0 ? (() => {
                      // Pre-calculate rowspans for each markaz
                      const markazCounts = {};
                      stats.breakdown.forEach(row => {
                        markazCounts[row.markaz] = (markazCounts[row.markaz] || 0) + 1;
                      });

                      return stats.breakdown.map((row, i) => {
                        const percentage = row.totalDaftar > 0 ? Math.round((row.fixSantri / row.totalDaftar) * 100) : 0;
                        const isFirstOfMarkaz = i === 0 || stats.breakdown[i-1].markaz !== row.markaz;
                        
                        return (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            {isFirstOfMarkaz && (
                              <td rowSpan={markazCounts[row.markaz]} className="p-4 font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-300 dark:border-slate-700 align-middle transition-colors">
                                {row.markaz}
                              </td>
                            )}
                            <td className="p-4 text-slate-700 dark:text-slate-200 font-medium border-r border-slate-300 dark:border-slate-700 transition-colors">{row.program}</td>
                            <td className="p-4 text-center font-bold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 border-r border-slate-300 dark:border-slate-700">{row.totalDaftar}</td>
                            <td className="p-4 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 border-r border-slate-300 dark:border-slate-700 transition-colors">{row.fixSantri}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${percentage >= 50 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : percentage > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} transition-colors border border-transparent`}>
                                {percentage}%
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })() : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400 italic transition-colors">Tidak ada data rekapitulasi</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold">
          Gagal memuat analitik. Silakan coba muat ulang halaman.
        </div>
      )}
    </div>
  );
}
