"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal masuk");

      localStorage.setItem("auth_token", data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm z-10 relative">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Logo Madinatul Qur'an" className="w-24 h-24 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Portal Wali Santri</h1>
          <p className="text-text-secondary mt-1">My Madinatul Qur'an</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Nomor WhatsApp atau Email</label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              placeholder="0812xxxx / wali@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-70 mt-4"
          >
            {loading ? "MEMPROSES..." : "MASUK KELAS"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => router.push("/")} 
            className="text-primary-dark hover:underline text-sm font-medium"
          >
            Belum punya akun? Daftar Pendaftaran PPDB Baru
          </button>
        </div>
      </div>
    </div>
  );
}
