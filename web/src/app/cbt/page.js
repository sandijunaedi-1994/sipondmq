"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CBTPage() {
  const router = useRouter();
  const [step, setStep] = useState("CHECKING_AUTH"); // CHECKING_AUTH, LOGIN, WAITING, EXAM, COMPLETED
  
  // Login States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [studentName, setStudentName] = useState("");

  // Exam States
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const socketRef = useRef(null);

  // Initial Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        // Fetch user info briefly
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/status`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setStudentName(data.registration?.studentName || "Siswa");
            setStep("WAITING");
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setStep("LOGIN");
    };
    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: username, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("auth_token", data.token);
        // fetch name
        const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/status`, {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setStudentName(statusData.registration?.studentName || "Siswa");
        }
        setStep("WAITING");
      } else {
        setLoginError(data.message || "Login gagal. Coba lagi.");
      }
    } catch (err) {
      setLoginError("Koneksi ke server bermasalah.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setStep("LOGIN");
    setUsername("");
    setPassword("");
  };

  const handleStartExam = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return setStep("LOGIN");

    try {
      // We use the same exam/start endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/exam/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        alert("Gagal memulai ujian. Pastikan jadwal Anda sesuai.");
        return;
      }

      const data = await res.json();
      setAttemptId(data.attemptId);
      setRemainingTime(data.remainingTime);

      // Fetch questions
      const qRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/exam/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const qData = await qRes.json();
      setQuestions(qData.questions || []);

      // Setup Socket.io for timer synchronization
      socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`);
      socketRef.current.emit("join_exam", data.attemptId);
      
      socketRef.current.on("time_sync", (msg) => {
        setRemainingTime(msg.remainingTime);
      });

      socketRef.current.on("time_up", () => {
        alert("Waktu habis! Ujian Anda akan disubmit otomatis.");
        autoSubmit(data.attemptId);
      });

      setStep("EXAM");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const autoSubmit = async (targetAttemptId) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/exam/submit`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ attemptId: targetAttemptId || attemptId })
      });
      setStep("COMPLETED");
      if (socketRef.current) socketRef.current.disconnect();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (window.confirm("Apakah Anda yakin ingin menyelesaikan ujian? Jawaban tidak bisa diubah lagi.")) {
      autoSubmit(attemptId);
    }
  };

  const handleSelectOption = async (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));

    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/exam/answer`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ attemptId, questionId, selectedOption: optionIndex })
      });
    } catch (err) {
      console.error("Gagal menyimpan jawaban", err);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ---------------- RENDERING ----------------

  if (step === "CHECKING_AUTH") {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (step === "LOGIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 animate-in zoom-in-95 duration-300">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">💻</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">CBT Offline</h1>
          <p className="text-center text-slate-500 text-sm mb-8">Masuk menggunakan Akun Pendaftaran Anda untuk memulai ujian.</p>

          {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold mb-4 text-center">{loginError}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email / Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition" />
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition mt-2 disabled:opacity-70">
              {isLoggingIn ? "Memeriksa..." : "Masuk ke Ruang Ujian"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "WAITING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-xl border border-slate-100 text-center animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Ruang Tunggu CBT</h1>
          <p className="text-slate-500 mb-8">Ahlan wa Sahlan, <strong className="text-emerald-700">{studentName}</strong>.</p>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8 flex items-start gap-3 text-left">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-amber-800 font-medium">Jangan menekan tombol Mulai sebelum ada instruksi dari Pengawas / Panitia Ujian. Waktu akan langsung berjalan begitu Anda memulai.</p>
          </div>

          <button onClick={handleStartExam} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-emerald-500/30 transition transform hover:scale-[1.02] active:scale-95">
            MULAI UJIAN SEKARANG
          </button>
          
          <button onClick={handleLogout} className="mt-6 text-sm font-bold text-slate-400 hover:text-red-500 transition">
            Bukan akun Anda? Keluar
          </button>
        </div>
      </div>
    );
  }

  if (step === "COMPLETED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-600 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-emerald-600">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Ujian Selesai</h1>
          <p className="text-slate-500 mb-8">Alhamdulillah, jawaban Anda telah berhasil disimpan di dalam sistem. Silakan melapor ke Pengawas.</p>
          <button onClick={handleLogout} className="w-full py-3.5 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl transition">
            Keluar dari Sistem
          </button>
        </div>
      </div>
    );
  }

  // EXAM STEP
  if (questions.length === 0 || remainingTime === null) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Exam Header */}
      <div className="bg-white text-slate-800 p-4 shadow-sm border-b border-slate-200 sticky top-0 z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center">MQ</div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Ujian CBT Offline</h1>
            <p className="text-xs text-slate-500 font-medium">Peserta: {studentName}</p>
          </div>
        </div>
        <div className="bg-slate-100 border border-slate-200 px-5 py-2 rounded-xl text-2xl font-mono font-bold flex items-center gap-3 text-emerald-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className={remainingTime < 300 ? "text-red-500 animate-pulse" : ""}>{formatTime(remainingTime)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 flex flex-col md:flex-row gap-6 mt-4">
        
        {/* Question Area */}
        <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="mb-8 flex justify-between items-end border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-emerald-800">Soal No. {currentIdx + 1}</h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-wider">{currentQuestion.category}</span>
          </div>

          <p className="text-xl text-slate-800 leading-relaxed mb-10 font-medium">{currentQuestion.text}</p>
          
          <div className="space-y-4 flex-1">
            {(typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : currentQuestion.options).map((opt, optIdx) => {
              const isSelected = answers[currentQuestion.id] === optIdx;
              return (
                <div 
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-5
                    ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10' : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50'}`}
                >
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-slate-50'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                  </div>
                  <span className={`text-lg ${isSelected ? 'font-bold text-emerald-900' : 'text-slate-700 font-medium'}`}>{opt}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-between pt-6 border-t border-slate-100">
            <button 
              disabled={currentIdx === 0} 
              onClick={() => setCurrentIdx(i => i - 1)}
              className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
            >
              &larr; KEMBALI
            </button>
            
            {currentIdx < questions.length - 1 ? (
              <button 
                onClick={() => setCurrentIdx(i => i + 1)}
                className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-black transition shadow-lg shadow-slate-800/20"
              >
                LANJUT &rarr;
              </button>
            ) : (
              <button 
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 hover:-translate-y-0.5 transition"
              >
                {isSubmitting ? "MENYIMPAN..." : "SELESAIKAN UJIAN"}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div className="w-full md:w-72 self-start space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 text-center border-b border-slate-100 pb-3">Daftar Soal</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const hasAnswered = answers[q.id] !== undefined;
                const isCurrent = currentIdx === idx;
                
                let btnClass = "h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center ";
                if (isCurrent) {
                  btnClass += "border-2 border-slate-800 bg-slate-800 text-white scale-110 shadow-md";
                } else if (hasAnswered) {
                  btnClass += "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600";
                } else {
                  btnClass += "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 hover:text-slate-700";
                }

                return (
                  <button key={q.id} onClick={() => setCurrentIdx(idx)} className={btnClass}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Sudah Dijawab</div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium"><div className="w-3 h-3 bg-slate-100 border border-slate-200 rounded-sm"></div> Belum Dijawab</div>
            </div>
          </div>
          
          <button 
            onClick={handleManualSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald-50 text-emerald-700 border-2 border-emerald-200 font-bold rounded-2xl hover:bg-emerald-100 transition"
          >
            Selesai & Kumpulkan
          </button>
        </div>

      </div>
    </div>
  );
}
