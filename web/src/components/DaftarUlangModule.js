"use client";

import { useState, useEffect } from "react";

export default function DaftarUlangModule({ registration, onSuccess }) {
  const [activeTab, setActiveTab] = useState("berkas");
  
  // Berkas State
  const [documents, setDocuments] = useState({
    AKTA: { file: null, status: "pending" },
    FOTO: { file: null, status: "pending" },
    KTP_AYAH: { file: null, status: "pending" },
    KTP_IBU: { file: null, status: "pending" },
    KK: { file: null, status: "pending" },
    IJAZAH: { file: null, status: "optional" }, // bisa menyusul
    SURAT_SEHAT: { file: null, status: "pending" },
    SKKB: { file: null, status: "pending" },
  });
  const [isUploading, setIsUploading] = useState(false);

  // Keuangan State
  const [bills, setBills] = useState([]);
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [isLoadingBills, setIsLoadingBills] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/finance/bills?registrationId=${registration.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBills(data.bills || []);
      }
    } catch (error) {
      console.error("Failed to fetch bills", error);
    } finally {
      setIsLoadingBills(false);
    }
  };

  const handleFileChange = (type, file) => {
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [type]: { file, status: "ready" }
      }));
    }
  };

  const handleUploadBerkas = async () => {
    setIsUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mark ready as uploaded
    const updated = { ...documents };
    Object.keys(updated).forEach(key => {
      if (updated[key].status === "ready") {
        updated[key].status = "uploaded";
      }
    });
    setDocuments(updated);
    setIsUploading(false);
    alert("Berkas berhasil diunggah! (Simulasi)");
  };

  const handlePayMidtrans = async () => {
    setIsPaying(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/finance/pay-registration`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ registrationId: registration.id })
      });
      
      if (res.ok) {
        const { token: snapToken } = await res.json();
        if (snapToken) {
          window.snap.pay(snapToken, {
            onSuccess: function(result) {
              alert("Pembayaran berhasil!");
              fetchBills();
              if (onSuccess) onSuccess();
            },
            onPending: function(result) {
              alert("Menunggu pembayaran Anda!");
              fetchBills();
            },
            onError: function(result) {
              alert("Pembayaran gagal!");
            },
            onClose: function() {
              console.log('Customer closed the popup without finishing the payment');
            }
          });
        }
      } else {
        alert("Gagal memproses pembayaran Midtrans.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsPaying(false);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const isAllRequiredUploaded = Object.keys(documents).every(key => {
    if (key === 'IJAZAH') return true; // Optional
    return documents[key].status === 'uploaded';
  });

  const uangMasukBill = bills.find(b => b.id === "inv-002");

  return (
    <div className="bg-surface rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Tabs */}
      <div className="border-b border-slate-200">
        <div className="p-6 bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800">Proses Daftar Ulang</h2>
          <p className="text-text-secondary mt-1">Selesaikan 2 tugas berikut untuk menyelesaikan proses Daftar Ulang.</p>
        </div>
        <div className="flex px-6 gap-6">
          <button 
            onClick={() => setActiveTab("berkas")}
            className={`py-4 font-bold border-b-2 transition ${activeTab === 'berkas' ? 'border-primary text-primary-dark' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            1. Lengkapi Berkas
          </button>
          <button 
            onClick={() => setActiveTab("keuangan")}
            className={`py-4 font-bold border-b-2 transition ${activeTab === 'keuangan' ? 'border-primary text-primary-dark' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            2. Uang Masuk
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* TAB 1: BERKAS */}
        {activeTab === 'berkas' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-3 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <strong>Informasi Berkas:</strong> Silakan unggah hasil scan atau foto dokumen asli. Format yang didukung: JPG, PNG, PDF (Maks 2MB). Dokumen Ijazah dapat disusulkan jika belum terbit.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                AKTA: "Akta Kelahiran",
                KK: "Kartu Keluarga",
                KTP_AYAH: "KTP Ayah",
                KTP_IBU: "KTP Ibu",
                SURAT_SEHAT: "Surat Keterangan Sehat",
                SKKB: "Surat Kelakuan Baik (SKKB)",
                IJAZAH: "Ijazah Terakhir",
                FOTO: "Foto Terbaru"
              }).map(([key, label]) => {
                const doc = documents[key];
                return (
                  <div key={key} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">
                        {label} {key === 'IJAZAH' && <span className="text-xs font-normal text-slate-500 ml-1">(Bisa Menyusul)</span>}
                      </h4>
                      {doc.status === 'uploaded' && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Terunggah</span>
                      )}
                      {doc.status === 'ready' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">Siap Unggah</span>
                      )}
                    </div>
                    
                    {key === 'FOTO' && (
                      <p className="text-xs text-slate-500 mb-3">
                        Ketentuan foto: {registration?.gender === 'PEREMPUAN' ? 'Menggunakan jilbab, background merah.' : 'Mengenakan peci hitam, baju koko putih, background merah.'}
                      </p>
                    )}

                    {doc.status === 'uploaded' ? (
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {doc.file?.name || "Dokumen tersimpan"}
                      </div>
                    ) : (
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(key, e.target.files[0])}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary-dark hover:file:bg-primary/20"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-6">
              <button 
                onClick={handleUploadBerkas}
                disabled={isUploading}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-50"
              >
                {isUploading ? "Mengunggah..." : "Simpan Berkas"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: KEUANGAN */}
        {activeTab === 'keuangan' && (
          <div className="space-y-6">
            {isLoadingBills ? (
              <div className="text-center py-8">Memuat data tagihan...</div>
            ) : !uangMasukBill ? (
              <div className="text-center py-8 text-slate-500">Data tagihan Uang Masuk belum tersedia.</div>
            ) : (
              <>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{uangMasukBill.title}</h3>
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 mb-1">Total Biaya</p>
                      <p className="text-2xl font-bold text-slate-800">{formatRupiah(uangMasukBill.amount)}</p>
                    </div>
                    <div className="flex-1 border-l border-slate-200 pl-6">
                      <p className="text-sm text-slate-500 mb-1">Telah Dibayar</p>
                      <p className="text-2xl font-bold text-emerald-600">{formatRupiah(uangMasukBill.paidAmount)}</p>
                    </div>
                    <div className="flex-1 border-l border-slate-200 pl-6">
                      <p className="text-sm text-slate-500 mb-1">Sisa Tagihan</p>
                      <p className="text-2xl font-bold text-red-600">{formatRupiah(uangMasukBill.amount - uangMasukBill.paidAmount)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>Progres Pembayaran</span>
                      <span>{Math.round((uangMasukBill.paidAmount / uangMasukBill.amount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className="bg-emerald-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((uangMasukBill.paidAmount / uangMasukBill.amount) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {uangMasukBill.paidAmount < uangMasukBill.amount ? (
                  <div className="border border-slate-200 rounded-xl p-6">
                    <h4 className="font-bold text-slate-800 mb-4">Bayar Uang Masuk</h4>
                    <p className="text-sm text-slate-500 mb-4">
                      Silakan selesaikan pembayaran Uang Masuk SPMB menggunakan berbagai metode pembayaran yang tersedia melalui Midtrans (Bank Transfer, Virtual Account, QRIS, dll).
                    </p>
                    <button 
                      onClick={handlePayMidtrans}
                      disabled={isPaying}
                      className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-50 w-full md:w-auto"
                    >
                      {isPaying ? "Memproses..." : "Bayar Sekarang"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h4 className="font-bold text-emerald-800 text-lg">Alhamdulillah, Uang Masuk Lunas!</h4>
                    <p className="text-emerald-600 mt-1">Terima kasih telah menyelesaikan seluruh kewajiban pembayaran Uang Masuk.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
