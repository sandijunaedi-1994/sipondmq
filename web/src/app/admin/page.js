"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function SpiderWebEffect() {
  useEffect(() => {
    const canvas = document.getElementById("spider-web-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    const particles = [];
    const properties = {
      particleColor: 'rgba(16, 185, 129, 0.5)', // emerald-500
      particleRadius: 2.5,
      particleCount: 60,
      particleMaxVelocity: 0.6,
      lineLength: 160,
    };

    let mouse = { x: null, y: null };
    
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    class Particle {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.velocityX = Math.random() * (properties.particleMaxVelocity * 2) - properties.particleMaxVelocity;
        this.velocityY = Math.random() * (properties.particleMaxVelocity * 2) - properties.particleMaxVelocity;
      }
      position() {
        if (this.x + this.velocityX > w && this.velocityX > 0 || this.x + this.velocityX < 0 && this.velocityX < 0) this.velocityX *= -1;
        if (this.y + this.velocityY > h && this.velocityY > 0 || this.y + this.velocityY < 0 && this.velocityY < 0) this.velocityY *= -1;
        this.x += this.velocityX;
        this.y += this.velocityY;
      }
      reDraw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, properties.particleRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = properties.particleColor;
        ctx.fill();
      }
    }

    for (let i = 0 ; i < properties.particleCount ; i++) {
      particles.push(new Particle());
    }

    function drawLines() {
      let x1, y1, x2, y2, length, opacity;
      for (let i = 0; i < properties.particleCount; i++) {
        for (let j = i + 1; j < properties.particleCount; j++) {
          x1 = particles[i].x;
          y1 = particles[i].y;
          x2 = particles[j].x;
          y2 = particles[j].y;
          length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          if (length < properties.lineLength) {
            opacity = 1 - length / properties.lineLength;
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.4})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
          }
        }
        
        if (mouse.x !== null && mouse.y !== null) {
          x1 = particles[i].x;
          y1 = particles[i].y;
          x2 = mouse.x;
          y2 = mouse.y;
          length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          if (length < properties.lineLength * 1.5) {
            opacity = 1 - length / (properties.lineLength * 1.5);
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.8})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
    }

    let animationId;
    function loop() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < properties.particleCount; i++) {
        particles[i].position();
        particles[i].reDraw();
      }
      drawLines();
      animationId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return <canvas id="spider-web-canvas" className="pointer-events-none fixed inset-0 z-0 opacity-70"></canvas>;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal masuk");

      if (data.user.role !== "ADMIN_PUSAT") {
        throw new Error("Akses ditolak. Anda bukan admin pusat.");
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user_id", data.user.id);
      localStorage.setItem("admin_permissions", JSON.stringify(data.user.permissions || []));
      localStorage.setItem("admin_name", data.user.namaLengkap || "Penguji");
      router.push("/admin/ruang-kerja");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-hidden">
      {/* Dynamic Cursor Background */}
      <SpiderWebEffect />

      <div className="w-full max-w-5xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 transition-colors overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Form Login */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm dark:shadow-inner transition-colors group hover:rotate-12 hover:scale-105 duration-300">
              <img src="/logo.png" alt="Logo MQ" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight transition-colors">Masuk</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm transition-colors font-bold tracking-wider">Portal Aplikasi My MQBS</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl mb-6 text-sm flex items-start gap-2.5 transition-colors animate-in slide-in-from-top-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Email Anda</label>
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Link href="/admin/forgot-password" className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                  Lupa Password?
                </Link>
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
              ) : "MASUK SEKARANG"}
            </button>
          </form>
        </div>

        {/* Right Side: Welcome & Motivation */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-900 text-white p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                Selamat Datang di Portal My MQBS
              </h2>
              <div className="space-y-2">
                <p className="text-emerald-300 font-bold text-lg italic">
                  "Setiap Perkembangan Adalah Kebahagiaan Bersama."
                </p>
                <p className="text-emerald-100/90 font-medium text-base max-w-md leading-relaxed">
                  Platform terintegrasi untuk mengelola data operasional dan akademik Madinatul Qur'an Boarding School.
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl relative">
              <div className="absolute -top-3 -left-2 text-4xl text-emerald-300 opacity-50">"</div>
              <p className="text-white/90 italic leading-relaxed text-sm relative z-10">
                Mendidik dan mengabdi di pesantren bukan sekadar profesi, melainkan jalan amal jariyah untuk mencetak generasi Qur'ani. Mari niatkan setiap lelah hari ini sebagai lillah.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/50 flex items-center justify-center font-bold text-xs border border-emerald-400/30">MQ</div>
                <div className="text-xs font-semibold text-emerald-200">
                  Pesan Asatidz & Karyawan
                </div>
              </div>
            </div>
            
            <div className="pt-8 mt-auto border-t border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-200/80 text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Secure Access Portal
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
