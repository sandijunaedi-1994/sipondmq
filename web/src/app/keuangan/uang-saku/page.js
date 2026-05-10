"use client";

import { useState, useEffect } from "react";
import { useChild } from "@/context/ChildContext";

export default function UangSakuPage() {
  const { selectedSantri, loading: childLoading } = useChild();
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for limit settings
  const [isSettingLimit, setIsSettingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState("");
  const [savingLimit, setSavingLimit] = useState(false);

  useEffect(() => {
    if (!childLoading) {
      fetchFinanceData();
    }
  }, [selectedSantri, childLoading]);

  const fetchFinanceData = async () => {
    if (!selectedSantri) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/finance/${selectedSantri.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFinanceData(data);
        if (data.uangSaku?.limitHarian) {
          setLimitInput(data.uangSaku.limitHarian.toString());
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data keuangan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLimit = async () => {
    if (!selectedSantri) return;
    setSavingLimit(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/finance/${selectedSantri.id}/limit`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ limitHarian: limitInput ? parseInt(limitInput) : null })
      });
      
      if (res.ok) {
        const data = await res.json();
        setFinanceData(prev => ({
          ...prev,
          uangSaku: { ...prev.uangSaku, limitHarian: data.limitHarian }
        }));
        setIsSettingLimit(false);
      } else {
        alert("Gagal menyimpan limit");
      }
    } catch (error) {
      console.error("Error saving limit:", error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setSavingLimit(false);
    }
  };

  if (childLoading || loading) {
    return <div className="p-6 text-center text-slate-500 animate-pulse">Memuat data uang saku...</div>;
  }

  if (!selectedSantri) {
    return <div className="p-6 text-center text-slate-500">Belum ada data anak.</div>;
  }

  const uangSaku = financeData?.uangSaku || { saldo: 0, limitHarian: null };
  const mutasi = financeData?.mutasi || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Saldo */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <p className="text-sm text-emerald-100 mb-1">Saldo Uang Saku</p>
        <p className="text-4xl font-bold tracking-tight">Rp {Number(uangSaku.saldo).toLocaleString("id-ID")}</p>
        <p className="text-xs text-emerald-200 mt-2">
          Santri: {selectedSantri.nama}
        </p>
      </div>

      {/* Limit Jajan Harian */}
      <div className="bg-surface rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="font-semibold text-text-primary">Limit Jajan Harian</h2>
          </div>
          {!isSettingLimit && (
            <button 
              onClick={() => setIsSettingLimit(true)}
              className="text-sm text-primary font-medium hover:text-emerald-700"
            >
              Ubah
            </button>
          )}
        </div>

        {isSettingLimit ? (
          <div className="space-y-3 mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 font-medium">Rp</span>
              </div>
              <input
                type="number"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                placeholder="Tidak dibatasi"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-500">Biarkan kosong untuk tidak membatasi jajan harian.</p>
            <div className="flex gap-2">
              <button 
                onClick={handleSaveLimit}
                disabled={savingLimit}
                className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition"
              >
                {savingLimit ? "Menyimpan..." : "Simpan"}
              </button>
              <button 
                onClick={() => {
                  setIsSettingLimit(false);
                  setLimitInput(uangSaku.limitHarian ? uangSaku.limitHarian.toString() : "");
                }}
                disabled={savingLimit}
                className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {uangSaku.limitHarian ? `Rp ${Number(uangSaku.limitHarian).toLocaleString("id-ID")}` : "Tidak Terbatas"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Maksimal nominal jajan yang diizinkan per hari.
            </p>
          </div>
        )}
      </div>

      {/* Aksi */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex flex-col items-center gap-2 p-4 bg-surface border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition group">
          <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">Top Up Saldo</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-surface border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition group">
          <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">Donasi</span>
        </button>
      </div>

      {/* Riwayat Transaksi */}
      <div>
        <h2 className="text-base font-bold text-text-primary mb-3">Transaksi Terbaru</h2>
        {mutasi.length > 0 ? (
          <div className="space-y-3">
            {mutasi.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-surface border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${item.tipe === 'TOPUP' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {item.tipe === 'TOPUP' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.keterangan || item.tipe}</p>
                    <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.tipe === 'TOPUP' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {item.tipe === 'TOPUP' ? '+' : '-'} Rp {Number(item.nominal).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-slate-500">Saldo: Rp {Number(item.saldoSesudah).toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-text-secondary border border-dashed border-slate-300 rounded-2xl bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="font-medium text-slate-500">Belum ada transaksi</p>
            <p className="text-xs mt-1 text-slate-400">Riwayat mutasi uang saku akan tampil di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
