"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import KelengkapanDataForm from "../../components/KelengkapanDataForm";
import DaftarUlangModule from "../../components/DaftarUlangModule";

export default function DashboardPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegId, setSelectedRegId] = useState("");
  const [data, setData] = useState({ registration: null, bills: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offlineSchedules, setOfflineSchedules] = useState([]);
  const [onlineSchedules, setOnlineSchedules] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const milestones = [
    { id: "PENDAFTARAN", label: "Pendaftaran" },
    { id: "PEMBAYARAN_REGISTRASI", label: "Pembayaran Registrasi" },
    { id: "KELENGKAPAN_DATA", label: "Kelengkapan Data" },
    { id: "TES_WAWANCARA", label: "Tes & Wawancara" },
    { id: "PENGUMUMAN", label: "Pengumuman" },
    { id: "DAFTAR_ULANG", label: "Daftar Ulang (Lengkapi Berkas dan Bayar Uang Pangkal)" }
  ];

  useEffect(() => {
    const fetchInit = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [ppdbRes, schedRes, onlineRes, infoRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/status`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/offline-schedules`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/online-schedules`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/info`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (ppdbRes.status === 401) {
          localStorage.removeItem("auth_token");
          router.push("/login");
          return;
        }

        const ppdbData = ppdbRes.ok ? await ppdbRes.json() : { registrations: [] };
        const schedData = schedRes.ok ? await schedRes.json() : { schedules: [] };
        const onlineData = onlineRes.ok ? await onlineRes.json() : { schedules: [] };
        const infoData = infoRes.ok ? await infoRes.json() : { broadcasts: [] };

        setOfflineSchedules(schedData.schedules || []);
        setOnlineSchedules(onlineData.schedules || []);
        setBroadcasts(infoData.broadcasts || []);

        const regs = ppdbData.registrations || [];
        setRegistrations(regs);
        
        if (regs.length > 0) {
          setSelectedRegId(regs[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError("Gagal menghubungi server");
        setLoading(false);
      }
    };

    fetchInit();
  }, [router]);

  useEffect(() => {
    if (!selectedRegId) return;
    const fetchBills = async () => {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      try {
        const finRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/finance/bills?registrationId=${selectedRegId}`, { 
          headers: { "Authorization": `Bearer ${token}` } 
        });
        const finData = finRes.ok ? await finRes.json() : { bills: [] };
        
        const activeReg = registrations.find(r => r.id === selectedRegId);
        setData({ registration: activeReg, bills: finData.bills || [] });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [selectedRegId, registrations]);

  useEffect(() => {
    if (selectedRegId) {
      localStorage.setItem("active_registration_id", selectedRegId);
    }
  }, [selectedRegId]);

  const handleSimulatePay = async (billId) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/finance/bills/${billId}/simulate-pay`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ registrationId: selectedRegId })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Simulasi pembayaran gagal.");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat simulasi.");
    }
  };

  const [testMethod, setTestMethod] = useState("");
  const [testDate, setTestDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  const handleScheduleTest = async () => {
    if (!testMethod || !testDate) {
      alert("Silakan pilih metode dan jadwal terlebih dahulu.");
      return;
    }
    setIsScheduling(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/exam/schedule`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ method: testMethod, date: testDate, registrationId: selectedRegId })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Gagal menyimpan jadwal tes.");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleProceedDaftarUlang = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/proceed-daftar-ulang`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ registrationId: selectedRegId })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Gagal memproses Daftar Ulang.");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto p-4 py-8 space-y-8">
        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg">{error}</div>
        )}

        {!data.registration ? (
          <div className="bg-surface p-8 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="text-secondary mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Belum Ada Data Pendaftaran</h2>
            <p className="text-text-secondary mb-6">Silakan lengkapi formulir registrasi SPMB Anda.</p>
            <button onClick={() => router.push("/register")} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition">
              Lengkapi Form Pendaftaran
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {broadcasts.length > 0 && (
              <div className="space-y-3">
                {broadcasts.map(b => (
                  <div key={b.id} className={`p-4 rounded-xl border flex items-start gap-4 shadow-sm ${b.tipe === 'PENTING' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${b.tipe === 'PENTING' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {b.tipe === 'PENTING' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${b.tipe === 'PENTING' ? 'text-red-800' : 'text-blue-800'}`}>{b.judul}</h3>
                      <p className={`text-xs mt-1 leading-relaxed ${b.tipe === 'PENTING' ? 'text-red-700' : 'text-blue-700'}`}>{b.pesan}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary-dark">
                  Ahlan Wa Sahlan, Ananda {data.registration.studentName || "Sholeh/Sholehah"}!
                </h1>
                <p className="text-text-secondary mt-1">Pantau terus perkembangan proses Pendaftaran Peserta Didik Baru Anda di sini.</p>
              </div>
              
              <div className="relative w-full md:w-auto" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full md:w-56 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-primary/20 shadow-sm flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="text-left truncate">
                      <p className="text-xs text-slate-500 font-medium">Data Anak Aktif</p>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {data.registration.studentName} ({data.registration.program})
                      </p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full md:w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 space-y-1">
                      {registrations.map(reg => (
                        <button
                          key={reg.id}
                          onClick={() => {
                            setSelectedRegId(reg.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${reg.id === selectedRegId ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${reg.id === selectedRegId ? 'bg-emerald-200' : 'bg-slate-100'}`}>
                            <span className="font-bold text-xs">{reg.studentName.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-sm truncate">{reg.studentName}</p>
                            <p className="text-xs opacity-70">Program {reg.program}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-slate-100 bg-slate-50">
                      <button 
                        onClick={() => router.push('/register')}
                        className="w-full text-center px-4 py-2.5 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Tambah Santri Baru
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Timeline Progress */}
            <div className="bg-surface p-6 rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden">
              <h2 className="text-lg font-bold text-text-primary border-b pb-4 mb-6">Pipeline Seleksi</h2>
              <div className="flex overflow-x-auto pb-4 w-full justify-between items-start relative px-4">
                {milestones.map((step, idx) => {
                  const currentIndex = milestones.findIndex(m => m.id === data.registration.status);
                  const isCompleted = idx < currentIndex;
                  const isCurrent = idx === currentIndex;
                  
                  return (
                    <div key={step.id} className="flex-1 flex flex-col items-center relative min-w-[120px]">
                      {/* Line connector */}
                      {idx !== milestones.length - 1 && (
                        <div className={`absolute top-4 left-[50%] w-full h-1 -z-0 ${idx < currentIndex ? 'bg-primary' : 'bg-slate-200'}`}></div>
                      )}
                      
                      {/* Node circle */}
                      <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-surface ${isCompleted ? 'bg-primary text-white' : isCurrent ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {isCompleted ? "✓" : idx + 1}
                      </div>

                      {/* Label */}
                      <div className={`pt-3 text-center text-xs md:text-sm px-2 ${isCurrent ? 'font-bold text-orange-500' : isCompleted ? 'font-bold text-primary flex items-center justify-center gap-1' : 'text-text-secondary'}`}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tahap 1: Pembayaran & Kelengkapan Data */}
            {['PEMBAYARAN_REGISTRASI', 'KELENGKAPAN_DATA'].includes(data.registration.status) && (
              <div className="space-y-6">
                <div className="bg-surface p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-text-primary mb-2 border-b pb-4">Tahap 1: Administrasi & Kelengkapan Data</h2>
                  <p className="text-sm text-text-secondary mt-2 mb-6">Anda dapat menyelesaikan tahap Pembayaran Registrasi dan Kelengkapan Data dalam urutan apapun. Keduanya wajib diselesaikan untuk lanjut ke tahap Tes & Wawancara.</p>
                  
                  {/* 1. Tagihan Registrasi */}
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                      1. Pembayaran Registrasi
                      {data.bills.some(b => b.id === 'inv-001' && b.status === 'LUNAS') && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">✓ Selesai</span>
                      )}
                    </h3>
                    {data.bills.length > 0 && (
                      <div className="space-y-4">
                        {data.bills.filter(b => b.id === 'inv-001').map((bill) => {
                          const isPaid = bill.status === 'LUNAS';
                          return (
                            <div key={bill.id} className={`border rounded-lg p-5 transition ${isPaid ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white hover:border-primary/50'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-text-primary">{bill.title}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-error/10 text-error'}`}>
                                  {isPaid ? "LUNAS" : "BELUM BAYAR"}
                                </span>
                              </div>
                              <div className="text-2xl font-bold text-text-primary mb-4">
                                {formatRupiah(bill.amount)}
                              </div>
                              <div className="flex justify-between text-sm text-text-secondary pt-4 border-t border-slate-100">
                                <span>{isPaid ? 'Dibayar pada:' : 'Jatuh Tempo:'}</span>
                                <span className="font-medium">{formatDate(isPaid ? bill.paidAt : bill.dueDate)}</span>
                              </div>
                              {!isPaid && (
                                <button onClick={() => handleSimulatePay(bill.id)} className="w-full mt-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition text-sm shadow-md shadow-primary/20">
                                  BAYAR SEKARANG (SIMULASI)
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2. Kelengkapan Data */}
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                      2. Kelengkapan Data
                      {data.registration.registrationData && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">✓ Selesai</span>
                      )}
                    </h3>
                    
                    {data.registration.registrationData ? (
                      <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-5">
                        <p className="text-sm font-medium text-emerald-800">Alhamdulillah, form Kelengkapan Data calon santri telah berhasil diisi.</p>
                      </div>
                    ) : (
                      <div className="-mx-6 px-6">
                        <KelengkapanDataForm 
                          registrationId={selectedRegId}
                          studentName={data.registration.studentName} 
                          onSuccess={() => window.location.reload()} 
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 flex items-start gap-4 text-sm text-primary-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <strong>Bantuan Pendaftaran:</strong> Jika Anda mengalami kesulitan saat pembayaran atau pengisian data, silakan hubungi petugas administrasi di nomor +6281234567890.
                  </div>
                </div>
              </div>
            )}

            {/* Tes & Wawancara Section */}
            {data.registration.status === 'TES_WAWANCARA' && (
              <div className="bg-surface p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-text-primary mb-6 border-b pb-4">Jadwal Tes & Wawancara</h2>
                
                {!data.registration.parentInterview ? (
                  <div className="space-y-4 text-center py-6">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Tugas Wajib: Form Wawancara Orang Tua</h3>
                    <p className="text-text-secondary max-w-lg mx-auto">
                      Sebelum Anda dapat memilih jadwal dan metode Tes & Wawancara (Online/Offline), Anda diwajibkan untuk mengisi Form Wawancara Orang Tua terlebih dahulu.
                    </p>
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <button onClick={() => router.push('/interview')} className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-lg shadow-primary/30 transition">
                        ISI FORM WAWANCARA SEKARANG
                      </button>
                    </div>
                  </div>
                ) : !data.registration.testMethod || isEditingSchedule ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="text-text-secondary">Silakan pilih metode tes dan wawancara yang Anda inginkan:</p>
                      {isEditingSchedule && (
                        <button onClick={() => setIsEditingSchedule(false)} className="text-sm font-bold text-slate-400 hover:text-slate-600">Batal Edit</button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`p-4 border-2 rounded-xl cursor-pointer transition ${testMethod === 'OFFLINE' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'}`}
                        onClick={() => setTestMethod('OFFLINE')}
                      >
                        <h3 className="font-bold text-lg mb-2 text-primary-dark">Offline (Hadir ke Pesantren)</h3>
                        <p className="text-sm text-text-secondary">Tes tulis dan wawancara dilakukan secara langsung di Madinatul Qur'an.</p>
                      </div>
                      <div 
                        className={`p-4 border-2 rounded-xl cursor-pointer transition ${testMethod === 'ONLINE' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'}`}
                        onClick={() => setTestMethod('ONLINE')}
                      >
                        <h3 className="font-bold text-lg mb-2 text-primary-dark">Online (Dari Rumah)</h3>
                        <p className="text-sm text-text-secondary">Tes tulis dikerjakan via aplikasi, wawancara melalui Video Call WhatsApp.</p>
                      </div>
                    </div>

                    {testMethod === 'OFFLINE' && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <label className="block text-sm font-medium mb-2">Pilih Tanggal Kedatangan</label>
                        <select value={testDate} onChange={(e) => setTestDate(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg">
                          <option value="">-- Pilih Tanggal --</option>
                          {offlineSchedules.filter(s => s.isActive).map(schedule => {
                            const d = new Date(schedule.date);
                            const label = `${d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} (${schedule.timeStart} WIB)`;
                            return (
                              <option key={schedule.id} value={schedule.date}>{label}</option>
                            );
                          })}
                        </select>
                        {offlineSchedules.filter(s => s.isActive).length === 0 && (
                          <p className="text-xs text-red-500 mt-2">Belum ada jadwal tes offline yang tersedia saat ini.</p>
                        )}
                      </div>
                    )}

                    {testMethod === 'ONLINE' && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <label className="block text-sm font-medium mb-2">Pilih Jadwal Wawancara Online</label>
                        <select value={testDate} onChange={(e) => setTestDate(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg">
                          <option value="">-- Pilih Jadwal Wawancara --</option>
                          {onlineSchedules.filter(s => s.isActive).map(schedule => {
                            const d = new Date(schedule.date);
                            const label = `${d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} (${schedule.timeStart} WIB)`;
                            return (
                              <option key={schedule.id} value={schedule.date}>{label}</option>
                            );
                          })}
                        </select>
                        {onlineSchedules.filter(s => s.isActive).length === 0 && (
                          <p className="text-xs text-red-500 mt-2">Belum ada jadwal tes online yang tersedia saat ini.</p>
                        )}
                        <p className="text-xs text-error mt-2">*Tes Tulis CBT (Computer Based Test) dapat dikerjakan langsung setelah menyimpan jadwal ini.</p>
                      </div>
                    )}

                    {testMethod && testDate && (
                      <button onClick={async () => { await handleScheduleTest(); setIsEditingSchedule(false); }} disabled={isScheduling} className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-50">
                        {isScheduling ? "Menyimpan Jadwal..." : "Simpan Jadwal Ujian"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 text-center py-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="flex justify-center items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-800">Jadwal Anda Telah Terkonfirmasi</h3>
                      <button onClick={() => setIsEditingSchedule(true)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition text-xs font-bold border border-slate-200">Edit</button>
                    </div>
                    <p className="text-text-secondary">Metode: <strong className="text-primary-dark">{data.registration.testMethod}</strong></p>
                    <p className="text-text-secondary">Jadwal: <strong>{formatDate(data.registration.testMethod === 'OFFLINE' ? data.registration.testDate : data.registration.interviewDate)}</strong></p>
                    
                    {data.registration.testMethod === 'ONLINE' && (
                      <div className="mt-8 pt-6 border-t border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-4 text-lg text-left">Daftar Tugas Anda:</h4>
                        
                        <div className="space-y-4">
                          {/* Task 1: Form Wawancara */}
                          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs bg-emerald-500">✓</div>
                              <div className="text-left">
                                <p className="font-bold text-emerald-700">Form Wawancara Orang Tua</p>
                                <p className="text-xs text-slate-500">15 Pertanyaan untuk orang tua/wali</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Selesai</span>
                          </div>

                          {/* Task 2: CBT */}
                          <div className={`flex items-center justify-between p-4 border rounded-xl ${data.registration.user?.examAttempts?.length > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${data.registration.user?.examAttempts?.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                {data.registration.user?.examAttempts?.length > 0 ? '✓' : '2'}
                              </div>
                              <div className="text-left">
                                <p className={`font-bold ${data.registration.user?.examAttempts?.length > 0 ? 'text-emerald-700' : 'text-slate-700'}`}>Tes Tulis (CBT)</p>
                                <p className="text-xs text-slate-500">Ujian berbasis komputer online</p>
                              </div>
                            </div>
                            {data.registration.examAttempts?.length > 0 ? (
                              <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Selesai</span>
                            ) : (
                              <button onClick={() => router.push('/exam')} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-sm shadow-orange-500/30 transition text-sm">
                                Kerjakan
                              </button>
                            )}
                          </div>

                          {/* Task 3: Wawancara Santri */}
                          <div className={`flex items-center justify-between p-4 border rounded-xl ${data.registration.onlineInterviewSantriDone ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${data.registration.onlineInterviewSantriDone ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                {data.registration.onlineInterviewSantriDone ? '✓' : '3'}
                              </div>
                              <div className="text-left">
                                <p className={`font-bold ${data.registration.onlineInterviewSantriDone ? 'text-emerald-700' : 'text-slate-700'}`}>Wawancara Online Santri</p>
                                <p className="text-xs text-slate-500">Video call WhatsApp dengan Ustadz/Ustadzah</p>
                              </div>
                            </div>
                            {data.registration.onlineInterviewSantriDone ? (
                              <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Selesai</span>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">Menunggu Konfirmasi Admin</span>
                            )}
                          </div>

                          {/* Task 4: Wawancara Orang Tua */}
                          <div className={`flex items-center justify-between p-4 border rounded-xl ${data.registration.onlineInterviewParentDone ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${data.registration.onlineInterviewParentDone ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                {data.registration.onlineInterviewParentDone ? '✓' : '4'}
                              </div>
                              <div className="text-left">
                                <p className={`font-bold ${data.registration.onlineInterviewParentDone ? 'text-emerald-700' : 'text-slate-700'}`}>Wawancara Online Orang Tua</p>
                                <p className="text-xs text-slate-500">Video call WhatsApp lanjutan</p>
                              </div>
                            </div>
                            {data.registration.onlineInterviewParentDone ? (
                              <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Selesai</span>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">Menunggu Konfirmasi Admin</span>
                            )}
                          </div>
                        </div>

                        {(!data.registration.user?.examAttempts?.length || !data.registration.onlineInterviewSantriDone || !data.registration.onlineInterviewParentDone) && (
                          <p className="text-xs text-error mt-4">*Tahapan ini akan selesai jika semua daftar tugas di atas sudah tercentang Selesai.</p>
                        )}
                      </div>
                    )}
                    
                    {data.registration.testMethod === 'OFFLINE' && (
                      <div className="mt-8 pt-6 border-t border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-4">Informasi Tes Offline</h4>
                        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl">
                          <p className="text-sm text-emerald-800 mb-3">Silakan datang ke lokasi pesantren sesuai jadwal yang tertera. Tunjukkan kode tiket di bawah ini kepada panitia SPMB saat tiba di lokasi untuk melakukan proses <strong>Check-in</strong>.</p>
                          
                          <div className="bg-white px-6 py-4 rounded-lg border border-emerald-100 shadow-sm inline-block text-center mb-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kode Tiket Anda</p>
                            <p className="text-3xl font-black tracking-[0.25em] text-emerald-700">{data.registration.offlineCode || 'MENUNGGU'}</p>
                          </div>
                          
                          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                            Lokasi: Jl. Madinatul Qur'an No. 1, Bogor, Jawa Barat.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Pengumuman Section */}
            {data.registration.status === 'PENGUMUMAN' && (
              <div className="bg-surface p-8 rounded-xl border border-slate-200 shadow-sm text-center">
                {(() => {
                  // TODO: Get real admission result from backend. For now, simulate 'LULUS'
                  const admissionResult = 'LULUS'; 

                  if (admissionResult === 'LULUS') {
                    return (
                      <div className="space-y-6">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-emerald-700">Alhamdulillah, Selamat!</h2>
                        <div className="text-lg text-slate-700 max-w-2xl mx-auto space-y-2">
                          <p>Ananda <strong className="text-emerald-800">{data.registration.studentName}</strong> dinyatakan <strong className="text-emerald-600 text-xl uppercase tracking-wider">LULUS</strong> seleksi Penerimaan Peserta Didik Baru Madinatul Qur'an.</p>
                          <p className="text-sm text-text-secondary mt-4">Silakan lanjutkan ke tahap Daftar Ulang untuk melengkapi berkas administrasi dan melakukan pembayaran uang pangkal.</p>
                        </div>
                        <div className="pt-6 border-t border-slate-200 mt-6">
                          <button 
                            onClick={handleProceedDaftarUlang} 
                            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-lg shadow-primary/30 transition text-lg"
                          >
                            Lanjut Daftar Ulang
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="space-y-6">
                        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800">Qadarullah</h2>
                        <div className="text-lg text-slate-700 max-w-2xl mx-auto space-y-2">
                          <p>Mohon maaf, Ananda <strong>{data.registration.studentName}</strong> <strong className="text-red-600 uppercase tracking-wider">BELUM LULUS</strong> seleksi Penerimaan Peserta Didik Baru Madinatul Qur'an tahun ini.</p>
                          <p className="text-sm text-text-secondary mt-4">Tetap semangat dan jangan berkecil hati. Semoga Allah memberikan tempat pendidikan yang terbaik bagi Ananda.</p>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            {/* Daftar Ulang Section */}
            {data.registration.status === 'DAFTAR_ULANG' && (
              <DaftarUlangModule 
                registration={data.registration} 
                onSuccess={() => window.location.reload()} 
              />
            )}

          </div>
        )}
      </main>
    </div>
  );
}
