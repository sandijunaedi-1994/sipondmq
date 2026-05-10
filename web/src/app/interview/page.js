"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function InterviewFormPage() {
  const router = useRouter();
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/interview/questions`);
        const data = await res.json();
        if (res.ok) {
          setQuestions(data.questions || []);
          // Initialize empty answers object
          const initialAnswers = {};
          (data.questions || []).forEach(q => {
            initialAnswers[q.id] = "";
          });
          setAnswers(initialAnswers);
        } else {
          setError(data.message || "Gagal memuat pertanyaan.");
        }
      } catch (err) {
        setError("Terjadi kesalahan jaringan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleChange = (id, value) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const allFilled = questions.every(q => answers[q.id] && answers[q.id].trim() !== "");
    if (!allFilled) {
      alert("Mohon isi semua pertanyaan sebelum menyimpan form.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      const registrationId = localStorage.getItem("active_registration_id");
      if (!registrationId) {
        alert("Registration ID tidak ditemukan. Silakan kembali ke dashboard.");
        return;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/interview/submit`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ registrationId, answers })
      });

      if (res.ok) {
        setShowSuccessModal(true);
        let count = 3;
        setCountdown(count);
        const timer = setInterval(() => {
          count -= 1;
          setCountdown(count);
          if (count <= 0) {
            clearInterval(timer);
            router.push("/dashboard");
          }
        }, 1000);
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menyimpan form wawancara");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Memuat formulir...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto p-4 py-8 space-y-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Form Wawancara Orang Tua / Wali</h1>
          <p className="text-slate-500 mb-8 pb-6 border-b border-slate-200">
            Mohon jawab pertanyaan-pertanyaan berikut ini dengan jujur dan seksama. Jawaban Anda sangat membantu kami dalam mengenal calon santri dan keluarga dengan lebih baik.
          </p>

          {error ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center font-medium border border-red-200">
              {error}
            </div>
          ) : questions.length === 0 ? (
            <div className="p-8 bg-slate-50 text-slate-500 rounded-xl text-center border border-slate-200">
              Belum ada pertanyaan wawancara yang diatur oleh sistem.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <label className="block text-slate-800 font-medium mb-3">
                    <span className="font-bold text-emerald-600 mr-2">{i + 1}.</span> 
                    {q.questionText}
                  </label>
                  <textarea
                    className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y min-h-[120px] transition-all"
                    placeholder="Ketik jawaban Anda di sini..."
                    value={answers[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    required
                  ></textarea>
                </div>
              ))}

              <div className="pt-6 border-t border-slate-200">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Menyimpan Jawaban..." : "Simpan dan Kumpulkan Form Wawancara"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 text-center border border-slate-100">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Alhamdulillah!</h3>
            <p className="text-slate-500 mb-6 font-medium">
              Form wawancara Anda berhasil disimpan. Terima kasih atas partisipasi Anda.
            </p>
            <div className="py-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
              <p className="text-sm font-bold text-emerald-700">Mengarahkan ke Dashboard dalam</p>
              <div className="text-4xl font-black text-emerald-600 my-2 tabular-nums">
                {countdown}
              </div>
              <p className="text-xs text-emerald-600/70 font-semibold">Detik</p>
            </div>
            <button 
              onClick={() => router.push("/dashboard")}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/30"
            >
              Kembali ke Dashboard Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
