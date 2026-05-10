"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

export default function ExamPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  
  const socketRef = useRef(null);

  // Initialize Exam and Proctoring
  useEffect(() => {
    let activeAttemptId = null;

    const startExam = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return router.push("/login");

      try {
        const registrationId = localStorage.getItem("active_registration_id");
        if (!registrationId) {
          alert("Registration ID tidak ditemukan.");
          router.push("/dashboard");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/exam/start`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ registrationId })
        });
        
        if (!res.ok) {
          alert("Gagal memulai ujian.");
          router.push("/dashboard");
          return;
        }

        const data = await res.json();
        setAttemptId(data.attemptId);
        activeAttemptId = data.attemptId;
        setRemainingTime(data.remainingTime);

        // Fetch questions
        const qRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/exam/questions`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const qData = await qRes.json();
        setQuestions(qData.questions || []);

        // Setup Socket.io
        socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`);
        socketRef.current.emit("join_exam", activeAttemptId);
        
        socketRef.current.on("time_sync", (msg) => {
          setRemainingTime(msg.remainingTime);
        });

        socketRef.current.on("time_up", () => {
          alert("Waktu habis! Ujian Anda akan disubmit otomatis.");
          autoSubmit(activeAttemptId);
        });

      } catch (err) {
        console.error(err);
      }
    };

    startExam();

    // Proctoring: Detect tab switch
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && activeAttemptId) {
        setFailed(true);
        const token = localStorage.getItem("auth_token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/exam/log-event`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ attemptId: activeAttemptId, event: "TAB_SWITCHED" })
        });
        alert("PELANGGARAN TERDETEKSI: Anda terdeteksi keluar dari tab ujian. Ujian Anda digagalkan.");
        router.push("/dashboard");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [router]);

  const autoSubmit = async (activeAttemptId) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/exam/submit`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ attemptId: activeAttemptId })
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSubmit = async () => {
    if (window.confirm("Apakah Anda yakin ingin menyelesaikan ujian?")) {
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
          "Authorization": `Bearer ${token}`,
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

  if (failed) {
    return <div className="min-h-screen flex items-center justify-center bg-error/10 text-error p-8 font-bold text-center">Ujian dibatalkan karena terdeteksi kecurangan. Anda akan dialihkan.</div>;
  }

  if (questions.length === 0 || remainingTime === null) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Exam Header */}
      <div className="bg-primary text-white p-4 shadow-md sticky top-0 z-50 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Ujian Saringan Masuk (Online)</h1>
          <p className="text-xs text-white/80">Kategori: {currentQuestion.category}</p>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-lg text-xl font-mono font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className={remainingTime < 300 ? "text-red-300 animate-pulse" : ""}>{formatTime(remainingTime)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col md:flex-row gap-6 mt-6">
        
        {/* Question Area */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="mb-6 flex justify-between items-end border-b pb-4">
            <h2 className="text-xl font-bold text-slate-800">Soal No. {currentIdx + 1}</h2>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{currentQuestion.category}</span>
          </div>

          <p className="text-lg text-slate-700 leading-relaxed mb-8">{currentQuestion.text}</p>
          
          <div className="space-y-3">
            {(typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : currentQuestion.options).map((opt, optIdx) => {
              const isSelected = answers[currentQuestion.id] === optIdx;
              return (
                <div 
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition flex items-center gap-4
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/30 bg-slate-50'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${isSelected ? 'border-primary bg-primary' : 'border-slate-400 bg-white'}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <span className={`text-base ${isSelected ? 'font-medium text-primary-dark' : 'text-slate-700'}`}>{opt}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-between">
            <button 
              disabled={currentIdx === 0} 
              onClick={() => setCurrentIdx(i => i - 1)}
              className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
            >
              &larr; Sebelumnya
            </button>
            
            {currentIdx < questions.length - 1 ? (
              <button 
                onClick={() => setCurrentIdx(i => i + 1)}
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition"
              >
                Selanjutnya &rarr;
              </button>
            ) : (
              <button 
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg shadow-lg hover:bg-orange-600 transition"
              >
                {isSubmitting ? "Menyimpan..." : "Selesai Ujian"}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 bg-white p-4 rounded-xl shadow-sm border border-slate-200 self-start">
          <h3 className="font-bold text-slate-700 mb-4 text-center">Navigasi Soal</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const hasAnswered = answers[q.id] !== undefined;
              const isCurrent = currentIdx === idx;
              
              let btnClass = "h-10 rounded font-medium text-sm transition flex items-center justify-center ";
              if (isCurrent) {
                btnClass += "border-2 border-primary bg-primary/10 text-primary-dark";
              } else if (hasAnswered) {
                btnClass += "bg-primary text-white border-primary border-2";
              } else {
                btnClass += "bg-slate-100 text-slate-500 border-2 border-transparent hover:bg-slate-200";
              }

              return (
                <button key={q.id} onClick={() => setCurrentIdx(idx)} className={btnClass}>
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
