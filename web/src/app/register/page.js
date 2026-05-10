"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveySuccess, setSurveySuccess] = useState(false);
  const [surveyData, setSurveyData] = useState({
    namaSantri: "", noHp: "", tanggal: "", jam: "", program: "SMP", gender: "Laki-laki", harapan: ""
  });

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/survey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan jadwal survei");

      setSurveySuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    studentName: "",
    academicYear: "",
    program: "SMP",
    gender: "Laki-laki",
    previousSchool: "",
    source: "Facebook",
    motivation: "",
    isLanjutan: false,
  });

  const [academicYears, setAcademicYears] = useState([]);

  // Check if user is already logged in and fetch academic years
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsLoggedIn(true);
    }

    const fetchAcademicYears = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/academic-years`);
        if (res.ok) {
          const data = await res.json();
          setAcademicYears(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, academicYear: data[0].nama }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch academic years", err);
        setAcademicYears([{ nama: "2026/2027" }, { nama: "2027/2028" }]); // Fallback
        setFormData(prev => ({ ...prev, academicYear: "2026/2027" }));
      }
    };
    fetchAcademicYears();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let token = localStorage.getItem("auth_token");

      if (!isLoggedIn) {
        // 1. Create Auth Account if not logged in
        const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            password: formData.password
          }),
        });
        const authData = await authRes.json();
        if (!authRes.ok) throw new Error(authData.message || "Gagal membuat akun");

        token = authData.token;
        localStorage.setItem("auth_token", token);
      }

      // 2. Submit PPDB Form
      const ppdbRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          studentName: formData.studentName,
          academicYear: formData.academicYear,
          program: formData.program,
          gender: formData.gender === "Laki-laki" ? "LAKI_LAKI" : "PEREMPUAN",
          previousSchool: (formData.program === 'SMA' && formData.isLanjutan) ? "SMP Madinatul Qur'an (Lanjutan Internal)" : formData.previousSchool,
          source: formData.source,
          motivation: formData.motivation
        }),
      });
      
      const ppdbData = await ppdbRes.json();
      if (!ppdbRes.ok) throw new Error(ppdbData.message || "Gagal mengirim data PPDB");

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex justify-center relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 fixed">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-emerald-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
      </div>
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-slate-500 mb-6">Mengarahkan ke dashboard...</p>
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl bg-white/90 p-8 rounded-2xl shadow-xl border border-white backdrop-blur-md h-fit my-8 z-10 relative">
        {showSurvey ? (
          surveySuccess ? (
            <div className="animate-in fade-in zoom-in duration-300 text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Jadwal Survei Berhasil Dibuat!</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Terima kasih, kami menantikan kedatangan Anda di Madinatul Qur'an Boarding School.
                <br /><br />
                Sambil menunggu jadwal survei, <strong>tahukah Anda bahwa kuota pendaftaran terbatas?</strong> Anda bisa mengamankan kursi dengan mendaftar secara online sekarang juga lho!
              </p>
              <div className="flex flex-col gap-3 justify-center max-w-xs mx-auto">
                <button type="button" onClick={() => { setShowSurvey(false); setShowGuide(false); }} className="px-6 py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg transition hover:-translate-y-0.5 transform">
                  Daftar Online Sekarang
                </button>
                <button type="button" onClick={() => router.push("/")} className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition">
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 flex items-center">
                <button type="button" onClick={() => setShowSurvey(false)} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Kembali ke Alur
                </button>
              </div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Jadwalkan Survei ke Pondok</h1>
                <p className="text-text-secondary">Silakan isi form berikut untuk mengatur jadwal kunjungan Anda.</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-center">Lokasi Kampus (Google Maps)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a href="https://maps.app.goo.gl/VkLU1xnyRs2DfqEg9" target="_blank" rel="noreferrer" className="flex flex-col items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-300 transition group text-center shadow-sm">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm mb-2 group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Kampus MQBS 1</span>
                    <span className="text-[10px] text-emerald-600 mt-0.5 font-medium group-hover:underline">Buka Maps ↗</span>
                  </a>
                  <a href="https://maps.app.goo.gl/LqL2LepzD1pxFsPBA" target="_blank" rel="noreferrer" className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 hover:border-blue-300 transition group text-center shadow-sm">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm mb-2 group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Kampus MQBS 2</span>
                    <span className="text-[10px] text-blue-600 mt-0.5 font-medium group-hover:underline">Buka Maps ↗</span>
                  </a>
                  <a href="https://maps.app.goo.gl/3gwKafKzPGnkZRDy5" target="_blank" rel="noreferrer" className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 hover:border-purple-300 transition group text-center shadow-sm">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm mb-2 group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Kampus MQBS 3</span>
                    <span className="text-[10px] text-purple-600 mt-0.5 font-medium group-hover:underline">Buka Maps ↗</span>
                  </a>
                </div>
              </div>

              <form onSubmit={handleSurveySubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nama Calon Santri *</label>
                    <input required type="text" value={surveyData.namaSantri} onChange={(e) => setSurveyData({...surveyData, namaSantri: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Masukkan nama lengkap calon santri" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nomor WA/HP Aktif *</label>
                    <input required type="tel" value={surveyData.noHp} onChange={(e) => setSurveyData({...surveyData, noHp: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="08..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Tanggal Kunjungan *</label>
                    <input required type="date" value={surveyData.tanggal} onChange={(e) => setSurveyData({...surveyData, tanggal: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Jam Berkunjung (08:00 - 16:30) *</label>
                    <input required type="time" min="08:00" max="16:30" value={surveyData.jam} onChange={(e) => setSurveyData({...surveyData, jam: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Program Diminati *</label>
                    <select value={surveyData.program} onChange={(e) => setSurveyData({...surveyData, program: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Gender Calon Santri *</label>
                    <select value={surveyData.gender} onChange={(e) => setSurveyData({...surveyData, gender: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Apa yang ingin Anda ketahui/harapkan saat survei? *</label>
                  <textarea required rows={3} value={surveyData.harapan} onChange={(e) => setSurveyData({...surveyData, harapan: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Contoh: Ingin melihat langsung asrama, kurikulum tahfidz, dll."></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition disabled:opacity-70 mt-4 text-lg shadow-md hover:shadow-lg">
                  {loading ? "Memproses..." : "JADWALKAN SEKARANG"}
                </button>
              </form>
            </div>
          )
        ) : showGuide ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <img src="/logo.png" alt="Logo Madinatul Qur'an" className="w-24 h-24 object-contain drop-shadow-md" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Alur Pendaftaran Santri Baru</h1>
              <p className="text-slate-500">Pahami tahapan penerimaan santri baru sebelum memulai pendaftaran.</p>
            </div>

            <div className="relative border-l-2 border-emerald-200 ml-4 md:ml-8 space-y-8 mb-10">
              <div className="relative">
                <div className="absolute -left-[25px] bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">1</div>
                <div className="pl-8">
                  <h3 className="font-bold text-lg text-slate-800">Mengisi Form Pendaftaran</h3>
                  <p className="text-slate-500 text-sm">Membuat akun wali dan mendaftarkan data awal santri.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[25px] bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">2</div>
                <div className="pl-8">
                  <h3 className="font-bold text-lg text-slate-800">Login ke Dashboard</h3>
                  <p className="text-slate-500 text-sm">Masuk ke portal khusus menggunakan nomor HP dan password.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[25px] bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">3</div>
                <div className="pl-8">
                  <h3 className="font-bold text-lg text-slate-800">Pembayaran & Kelengkapan Data</h3>
                  <p className="text-slate-500 text-sm">Mentransfer biaya pendaftaran dan melengkapi berkas yang dibutuhkan.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[25px] bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">4</div>
                <div className="pl-8">
                  <h3 className="font-bold text-lg text-slate-800">Tes & Wawancara</h3>
                  <p className="text-slate-500 text-sm">Mengikuti tes seleksi sesuai jadwal yang telah ditentukan.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[25px] bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">5</div>
                <div className="pl-8">
                  <h3 className="font-bold text-lg text-slate-800">Pengumuman Kelulusan</h3>
                  <p className="text-slate-500 text-sm">Memantau hasil seleksi penerimaan santri baru.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[25px] bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">6</div>
                <div className="pl-8">
                  <h3 className="font-bold text-lg text-slate-800">Daftar Ulang</h3>
                  <p className="text-slate-500 text-sm">Melakukan registrasi ulang dan pembayaran administrasi awal.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
              <h3 className="font-semibold text-slate-800 mb-4">Ingin langsung mendaftar atau survei berkunjung ke pondok dulu?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button type="button" onClick={() => setShowSurvey(true)} className="px-6 py-3 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 font-medium hover:bg-emerald-100 transition shadow-sm">
                  Jadwalkan Survei ke Pondok
                </button>
                <button type="button" onClick={() => setShowGuide(false)} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg transition hover:-translate-y-0.5 transform">
                  Langsung Mendaftar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src="/logo.png" alt="Logo Madinatul Qur'an" className="w-24 h-24 object-contain drop-shadow-md" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">Registrasi Santri Baru</h1>
              <p className="text-text-secondary">Lengkapi data berikut untuk mendaftar.</p>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

        <form onSubmit={handleRegister} className="space-y-6">
          {!isLoggedIn && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-text-primary border-b pb-2">1. Data Akun Wali (Login)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Nomor WhatsApp *</label>
                  <input required={!isLoggedIn} type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="08..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Email (Opsional)</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Buat Password *</label>
                <input required={!isLoggedIn} type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                <p className="text-xs text-blue-500 mt-2 font-medium">Nomor Hp jangan sampai salah dan password harap diingat</p>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-text-primary border-b pb-2">{isLoggedIn ? "Data Calon Santri Baru" : "2. Data Calon Santri"}</h2>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Nama Lengkap Calon Santri *</label>
              <input required type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Pendaftaran Untuk Tahun Ajaran</label>
                <select name="academicYear" value={formData.academicYear} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                  {academicYears.length > 0 ? academicYears.map(ta => (
                    <option key={ta.id || ta.nama} value={ta.nama}>{ta.nama}</option>
                  )) : (
                    <option value="2026/2027">2026/2027</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Program Pilihan</label>
                <select name="program" value={formData.program} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="Ma'had Aly">Ma'had Aly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Jenis Kelamin</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Sumb. Info</label>
                <select name="source" value={formData.source} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Google Search / Website Resmi">Google Search / Website Resmi</option>
                  <option value="Rekomendasi Guru / Alumni / Keluarga">Rekomendasi Guru / Alumni / Keluarga</option>
                  <option value="Iklan Banner / Brosur / Spanduk">Iklan Banner / Brosur / Spanduk</option>
                  <option value="Event / Sosialisasi Sekolah">Event / Sosialisasi Sekolah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            
            {formData.program === 'SMA' && (
              <label className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer mb-4 mt-2">
                <input 
                  type="checkbox" 
                  name="isLanjutan"
                  checked={formData.isLanjutan}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500" 
                />
                <span className="text-sm font-semibold text-blue-800">SMA Lanjutan dari SMP MQ (Centang jika Ya)</span>
              </label>
            )}

            {!(formData.program === 'SMA' && formData.isLanjutan) && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Asal Sekolah *</label>
                <input required type="text" name="previousSchool" value={formData.previousSchool} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Alasan Memilih MQ *</label>
              <textarea required rows={3} name="motivation" value={formData.motivation} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"></textarea>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3 my-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              <strong>Informasi Penting:</strong> Nomor HP dan Password yang Anda masukkan akan digunakan untuk <strong>Login ke halaman Dashboard</strong>. Di sana nanti Anda dapat memantau progres pendaftaran, melengkapi data, menjadwalkan tes, dan keperluan administrasi lainnya.
            </p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition disabled:opacity-70 text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transform">
            {loading ? "Memproses..." : "DAFTAR SEKARANG"}
          </button>
          
          <div className="text-center mt-4">
            {isLoggedIn ? (
              <button type="button" onClick={() => router.push("/dashboard")} className="text-secondary hover:text-primary-dark text-sm">Batal / Kembali ke Dashboard</button>
            ) : (
              <button type="button" onClick={() => router.push("/login")} className="text-secondary hover:text-primary-dark text-sm">Kembali ke Halaman Login</button>
            )}
          </div>
        </form>
          </div>
        )}
      </div>
    </div>
  );
}
