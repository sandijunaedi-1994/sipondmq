"use client";

import { useState, useEffect } from "react";
import { useChild } from "../../context/ChildContext";

export default function RiwayatKesehatanPage() {
  const { selectedSantri } = useChild();
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedSantri?.id) {
      fetchRecords(selectedSantri.id);
    } else {
      setLoading(false);
    }
  }, [selectedSantri]);

  const fetchRecords = async (santriId) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/health/${santriId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setHealthRecords(data.records || []);
      } else {
        setError(data.message || "Gagal mengambil riwayat kesehatan.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'SAKIT': return 'bg-red-50 text-red-600 border-red-200';
      case 'PERAWATAN': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'PENGAMBILAN_OBAT': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'RUJUKAN': return 'bg-purple-50 text-purple-600 border-purple-200';
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-200'; // PENGECEKAN_BERKALA
    }
  };

  const formatType = (type) => {
    return type.replace(/_/g, ' ');
  };

  if (!selectedSantri) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Pilih Data Anak</h2>
        <p className="text-slate-500">Silakan pilih data anak Anda dari menu dropdown di atas untuk melihat riwayat kesehatannya.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <span className="text-3xl">🏥</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Riwayat Kesehatan</h1>
            <p className="text-emerald-50 font-medium mt-1 opacity-90">Rekam medis dan catatan UKS untuk {selectedSantri.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-4 font-medium text-sm">Memuat data kesehatan...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-semibold border border-red-100">
            {error}
          </div>
        ) : healthRecords.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <span className="text-4xl">💊</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Alhamdulillah, Santri Sehat!</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">Belum ada catatan riwayat sakit atau perawatan di UKS untuk anak Anda. Semoga selalu diberikan kesehatan.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-emerald-100 ml-4 md:ml-6 space-y-8 pb-4">
            {healthRecords.map((record) => (
              <div key={record.id} className="relative pl-6 md:pl-8 group">
                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-[3px] border-white shadow-sm transition-transform group-hover:scale-125 ${getTypeStyle(record.type).split(' ')[0]}`}></div>
                
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getTypeStyle(record.type)}`}>
                        {formatType(record.type)}
                      </span>
                      <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-800 mb-2">{record.title}</h4>
                  
                  {record.description && (
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {record.description}
                    </p>
                  )}
                  
                  {record.handledBy && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg text-emerald-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Pemeriksa: {record.handledBy}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
