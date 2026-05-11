"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim link reset");

      setMessage(data.message || "Jika email terdaftar, link reset telah dikirim.");
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-hidden">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 transition-colors overflow-hidden flex flex-col p-8 md:p-10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm dark:shadow-inner transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-5.257A4.01 4.01 0 014.743 14l5.514-5.514A6 6 0 0115 5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight transition-colors">Lupa Password</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm transition-colors">Masukkan email Anda untuk menerima link reset password.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl mb-6 text-sm flex items-start gap-2.5 transition-colors animate-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl mb-6 text-sm flex items-start gap-2.5 transition-colors animate-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="leading-snug">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Email Terdaftar</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600"
                placeholder="admin@mymq.com"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 mt-4 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-[0.98] flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>MEMPROSES...</span>
              </>
            ) : "KIRIM LINK RESET"}
          </button>

          <div className="text-center mt-6">
            <Link href="/admin" className="text-sm font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Kembali ke Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
