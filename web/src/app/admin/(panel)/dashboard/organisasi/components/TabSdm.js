"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Briefcase, UserCheck, ShieldAlert } from "lucide-react";

export default function TabSdm() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSdmStats = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        // We can utilize the existing list endpoint which returns general stats
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai?limit=1`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Error fetching SDM stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSdmStats();
  }, []);

  const COLORS_STATUS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
  const COLORS_PLACEMENT = ['#8b5cf6', '#ec4899'];

  const statusData = stats ? [
    { name: 'Tetap', value: stats.tetap || 0 },
    { name: 'Kontrak', value: stats.kontrak || 0 },
    { name: 'Magang', value: stats.total - (stats.tetap + stats.kontrak) || 0 } // Approximation
  ] : [];

  const placementData = stats ? [
    { name: 'Direktorat Pusat', value: stats.pusat || 0 },
    { name: 'Markaz', value: stats.markaz || 0 }
  ] : [];

  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
      </div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Pegawai</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats?.total || 0}</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users size={24} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pegawai Tetap</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats?.tetap || 0}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pegawai Kontrak</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats?.kontrak || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Cuti / Sakit</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">0</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <ShieldAlert size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Kepegawaian */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-6">Distribusi Status Pegawai</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
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

        {/* Lokasi Penempatan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-6">Penempatan Pegawai</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placementData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" name="Jumlah" fill="#8b5cf6" radius={[0, 6, 6, 0]}>
                  {placementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PLACEMENT[index % COLORS_PLACEMENT.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
