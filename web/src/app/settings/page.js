"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || "Password berhasil diubah");
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.message || "Gagal mengubah password");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-xl mx-auto p-4 py-12 space-y-8">
        <div className="bg-surface p-8 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-primary-dark mb-6 border-b pb-4">Setting Password</h1>
          
          {error && <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg mb-6">{error}</div>}
          {success && <div className="bg-primary/10 border border-primary/20 text-primary-dark p-4 rounded-lg mb-6">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Password Lama</label>
              <input 
                type="password" 
                name="oldPassword" 
                value={formData.oldPassword} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password Baru</label>
              <input 
                type="password" 
                name="newPassword" 
                value={formData.newPassword} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Konfirmasi Password Baru</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                required 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-50 mt-4"
            >
              {loading ? "Menyimpan..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
