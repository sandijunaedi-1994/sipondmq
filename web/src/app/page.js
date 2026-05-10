'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white flex flex-col justify-center items-center p-6 md:p-12 text-center relative overflow-hidden">
        
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Static Orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400 opacity-20 blur-[100px]"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-emerald-300 opacity-20 blur-[120px]"></div>
          
          {/* Spider Web Effect */}
          {isClient && <SpiderWebEffect />}
        </div>

        <div className="z-10 w-full max-w-5xl transform transition-all duration-1000 flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="Logo Madinatul Qur'an" 
            className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 drop-shadow-xl hover:scale-110 hover:-translate-y-2 transition-all duration-500" 
          />
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200 drop-shadow-sm mt-4 md:mt-0">
            Ahlan Wa Sahlan
          </h1>
          <p className="text-3xl md:text-4xl font-light text-emerald-100 mb-8 tracking-wide">
            di Madinatul Qur'an Boarding School
          </p>
          <div className="w-32 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-200 mx-auto rounded-full mb-8 shadow-lg"></div>
          
          <p className="text-emerald-50/90 text-xl md:text-2xl max-w-2xl mx-auto font-light mb-16 leading-relaxed">
            Sistem Penerimaan Murid Baru TA. 2027/2028
          </p>

          {/* Cards Grid: Kiri & Kanan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-4xl mx-auto mb-16 relative">
            
            {/* Kiri - Daftar */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl flex flex-col items-center justify-center text-center transform transition-all duration-500 hover:-translate-y-3 hover:bg-white/15 hover:shadow-2xl hover:shadow-emerald-900/50 group">
              <div className="w-20 h-20 bg-emerald-500/30 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Berminat mondok di MQ?</h3>
              <p className="text-emerald-100/80 mb-10 text-lg">Daftarkan diri Anda sekarang dan jadilah bagian dari keluarga besar Madinatul Qur'an.</p>
              
              <Link
                href="/register"
                className="w-full mt-auto flex justify-center items-center py-4 px-6 border-2 border-emerald-400 rounded-2xl shadow-[0_0_15px_rgba(52,211,153,0.3)] text-lg font-bold text-emerald-900 bg-emerald-400 hover:bg-emerald-300 hover:shadow-[0_0_25px_rgba(52,211,153,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
              >
                Mulai Pendaftaran
              </Link>
            </div>

            {/* Kanan - Login */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl flex flex-col items-center justify-center text-center transform transition-all duration-500 hover:-translate-y-3 hover:bg-white/15 hover:shadow-2xl hover:shadow-emerald-900/50 group">
              <div className="w-20 h-20 bg-blue-500/30 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">Sudah daftar dan ingin memantau progresnya?</h3>
              <p className="text-emerald-100/80 mb-10 text-lg">Masuk ke dasbor Anda untuk melihat status, mengunggah dokumen, dan membayar tagihan.</p>
              
              <Link
                href="/login"
                className="w-full mt-auto flex justify-center items-center py-4 px-6 border-2 border-transparent rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.1)] text-lg font-bold text-emerald-800 bg-white hover:bg-emerald-50 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300"
              >
                Login Dasbor
              </Link>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="mt-auto text-center text-sm text-emerald-200/60 pb-4 z-10">
          &copy; {new Date().getFullYear()} Madinatul Qur'an. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function SpiderWebEffect() {
  useEffect(() => {
    const canvas = document.getElementById("spider-web-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    const particles = [];
    const properties = {
      particleColor: 'rgba(52, 211, 153, 0.4)', // emerald-400 equivalent for the dark landing page
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
        // Bounce off edges
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
            ctx.strokeStyle = `rgba(52, 211, 153, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
          }
        }
        
        // Line to mouse
        if (mouse.x !== null && mouse.y !== null) {
          x1 = particles[i].x;
          y1 = particles[i].y;
          x2 = mouse.x;
          y2 = mouse.y;
          length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          if (length < properties.lineLength * 1.5) {
            opacity = 1 - length / (properties.lineLength * 1.5);
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(52, 211, 153, ${opacity * 0.6})`;
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

  return <canvas id="spider-web-canvas" className="pointer-events-none absolute inset-0 z-0 opacity-80"></canvas>;
}
