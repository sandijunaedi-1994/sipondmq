"use client";

import { useState, useEffect } from "react";
import RingkasanPribadi from "./components/RingkasanPribadi";
import LogAktivitas from "./components/LogAktivitas";
import AktivitasRutin from "./components/AktivitasRutin";
import MasterTime from "./components/MasterTime";
import RuangWaliKelas from "./components/RuangWaliKelas";
import RuangMuhaffidz from "./components/RuangMuhaffidz";
import SaranOnline from "./components/SaranOnline";
import CatatanPribadi from "./components/CatatanPribadi";
import { BookOpen, Clock, Calendar, MapPin, BarChart2, ClipboardList, CalendarDays, Edit3, History, Sun, Moon, Sunrise, Sunset, UserCircle, Users, MessageSquare } from "lucide-react";

export default function DashboardPribadiPage() {
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [showAllMenu, setShowAllMenu] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isWaliKelas, setIsWaliKelas] = useState(false);
  const [isMuhaffidz, setIsMuhaffidz] = useState(false);
  
  const [adminName, setAdminName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [greetingMsg, setGreetingMsg] = useState("");
  const [currentTime, setCurrentTime] = useState(null);
  const [hijriDate, setHijriDate] = useState("");
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [locationName, setLocationName] = useState("Mendeteksi...");
  const [greetingIcon, setGreetingIcon] = useState(<Sun className="w-4 h-4 text-amber-400" />);

  useEffect(() => {
    // Nama Admin
    setAdminName(localStorage.getItem("admin_name") || "Admin");
    
    // Cek Role Superadmin & Wali Kelas
    try {
      const perms = JSON.parse(localStorage.getItem("admin_permissions") || "[]");
      setIsSuperAdmin(perms.includes("MANAJEMEN_ADMIN"));
      setIsWaliKelas(perms.includes("WALI_KELAS_VIEW"));
      setIsMuhaffidz(perms.includes("MUHAFFIDZ_VIEW"));
    } catch (e) {}

    // Tanggal Hijriyah
    try {
      setHijriDate(new Intl.DateTimeFormat('id-TN-u-ca-islamic', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date()));
    } catch (e) {
      setHijriDate("");
    }

    // Jam Live & Sapaan
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      const hour = now.getHours();
      
      if (hour >= 3 && hour < 10) {
        setGreeting("Selamat Pagi");
        setGreetingIcon(<Sunrise className="w-4 h-4 text-amber-500" />);
        setGreetingMsg("Selamat Beraktivitas, Jangan Lupa meniatkan pekerjaan hari ini untuk meraih ridha Allah.");
      } else if (hour >= 10 && hour < 15) {
        setGreeting("Selamat Siang");
        setGreetingIcon(<Sun className="w-4 h-4 text-amber-400" />);
        setGreetingMsg("Tetap semangat dan jaga fokus dalam menyelesaikan pekerjaan hari ini. Semoga berkah.");
      } else if (hour >= 15 && hour < 18) {
        setGreeting("Selamat Sore");
        setGreetingIcon(<Sunset className="w-4 h-4 text-amber-500" />);
        setGreetingMsg("Pekerjaan hari ini hampir usai, semoga lelah Anda bernilai ibadah.");
      } else {
        setGreeting("Selamat Malam");
        setGreetingIcon(<Moon className="w-4 h-4 text-amber-300" />);
        setGreetingMsg("Waktunya beristirahat untuk mengumpulkan energi bagi esok hari.");
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Deteksi Lokasi untuk Jadwal Sholat
    const fetchDefault = () => {
      setLocationName("Bogor");
      fetch("https://api.aladhan.com/v1/timingsByCity?city=Bogor&country=Indonesia&method=11")
        .then(res => res.json())
        .then(data => {
          if(data?.data?.timings) setPrayerTimes(data.data.timings);
        })
        .catch(console.error);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=11`)
            .then(res => res.json())
            .then(data => {
              if(data?.data?.timings) setPrayerTimes(data.data.timings);
            })
            .catch(console.error);

          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`)
            .then(res => res.json())
            .then(data => {
              setLocationName(data.city || data.locality || "Lokasi Anda");
            })
            .catch(() => setLocationName("Lokasi Anda"));
        },
        (error) => {
          console.error("Geolocation error:", error);
          fetchDefault();
        }
      );
    } else {
      fetchDefault();
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowAllMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  let tabs = [
    { id: "ringkasan", name: "Ringkasan", icon: <BarChart2 size={18} strokeWidth={2.5} />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20" },
    { id: "aktivitas_rutin", name: "Aktivitas Saya", icon: <ClipboardList size={18} strokeWidth={2.5} />, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20" },
    { id: "catatan", name: "Catatan", icon: <Edit3 size={18} strokeWidth={2.5} />, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20" },
    { id: "master_time", name: "Master Time", icon: <CalendarDays size={18} strokeWidth={2.5} />, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20" },
    { id: "saran_online", name: "Saran Online", icon: <MessageSquare size={18} strokeWidth={2.5} />, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10 border-pink-100 dark:border-pink-500/20" },
    { id: "log_aktivitas", name: "Log Aktivitas", icon: <History size={18} strokeWidth={2.5} />, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20" }
  ];

  let insertIndex = 1;
  if (isWaliKelas) {
    tabs.splice(insertIndex, 0, { id: "wali_kelas", name: "Ruang Wali Kelas", icon: <Users size={18} strokeWidth={2.5} />, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20" });
    insertIndex++;
  }
  
  if (isMuhaffidz) {
    tabs.splice(insertIndex, 0, { id: "muhaffidz", name: "Ruang Muhaffidz", icon: <BookOpen size={18} strokeWidth={2.5} />, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" });
    insertIndex++;
  }

  const getActiveTabTitle = () => {
    switch(activeTab) {
      case "ringkasan": return "Ringkasan Harian";
      case "wali_kelas": return "Ruang Wali Kelas";
      case "muhaffidz": return "Ruang Muhaffidz";
      case "aktivitas_rutin": return "Aktivitas Saya";
      case "catatan": return "Catatan Pribadi";
      case "master_time": return "Master Time: Calendar";
      case "saran_online": return "Saran Online";
      case "log_aktivitas": return "Log Aktivitas";
      default: return "";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0 font-sans w-full min-w-0">
      
      {/* ── Header Information (Latar Terang) ── */}
      <div className="flex justify-between items-start pt-2 px-2 md:px-0">
        <div className="flex flex-col gap-1.5 pr-4">
          <h1 className="text-2xl md:text-3xl font-black text-emerald-900 dark:text-emerald-100 leading-tight">
            Assalamu'alaikum,<br />{adminName}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[280px] md:max-w-sm mt-1">
            {greetingMsg}
          </p>
        </div>
        
        <div className="relative flex-shrink-0 mt-1">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur opacity-30"></div>
          <div className="relative bg-emerald-600 shadow-lg px-3 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold text-white flex items-center gap-1.5 border border-emerald-500/50">
            {greeting} {greetingIcon}
          </div>
        </div>
      </div>

      {/* ── Kartu Waktu & Jadwal Sholat (Hijau Tua) ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-[28px] shadow-xl border border-emerald-600/30 text-white p-5 md:p-6 mx-2 md:mx-0">
        {/* Dekorasi Ornamen Islami di latar */}
        <div className="absolute right-[-10%] top-[-10%] w-64 h-64 opacity-5 pointer-events-none">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-white">
            <path d="M50 0L57 43L100 50L57 57L50 100L43 57L0 50L43 43L50 0Z" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative flex flex-col gap-5">
          {/* Tanggal Masehi & Hijriah */}
          <div className="flex flex-row flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-emerald-800/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-emerald-600/40 w-fit shadow-inner">
              <Calendar size={14} className="text-emerald-300" />
              <span className="text-xs font-bold tracking-wide">
                {currentTime ? currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "Memuat..."}
              </span>
            </div>
            {hijriDate && (
              <div className="inline-flex items-center gap-2 bg-emerald-800/40 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-emerald-600/20 w-fit">
                <span className="text-xs">🌙</span>
                <span className="text-[11px] font-semibold text-emerald-100 tracking-wide">
                  {hijriDate}
                </span>
              </div>
            )}
          </div>

          {/* Jam Digital Besar */}
          <div className="flex items-center mt-1 bg-white px-3.5 py-2 rounded-2xl w-fit shadow-lg text-emerald-800 border border-emerald-100">
            <Clock size={18} className={currentTime ? "animate-pulse text-emerald-500 mr-2" : "mr-2"} />
            <span className="text-xl md:text-2xl font-black font-mono tracking-wider">
              {currentTime ? currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
            </span>
            <span className="text-xs font-bold ml-2 opacity-60">WIB</span>
          </div>

          {/* Lokasi & Jadwal Sholat */}
          <div className="mt-2 pt-4 border-t border-emerald-600/50 flex flex-wrap items-center gap-x-4 gap-y-2.5">
            <div className="flex items-center gap-1.5 text-emerald-100 text-[10px] font-bold uppercase tracking-widest mr-2 bg-emerald-900/40 px-2 py-1 rounded-md">
              <MapPin size={12} className="text-emerald-400" /> 
              {locationName}
            </div>
            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(prayer => {
              const label = prayer === 'Fajr' ? 'Subuh' : prayer === 'Dhuhr' ? 'Dzuhur' : prayer === 'Asr' ? 'Ashar' : prayer === 'Isha' ? 'Isya' : prayer;
              return (
                <div key={prayer} className="flex flex-col">
                  <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest">{label}</span>
                  <span className="text-xs font-bold text-white">{prayerTimes ? prayerTimes[prayer] : '--:--'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Menu Cepat (Quick Menu) ── */}
      <div className="px-2 md:px-0 mt-6">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Menu Cepat</h3>
          <button onClick={() => setShowAllMenu(true)} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold cursor-pointer hover:underline">Lihat semua &gt;</button>
        </div>
        
        {/* Horizontal Scroll Area */}
        <div className="flex overflow-x-auto gap-3 pb-6 pt-4 px-2 custom-scrollbar snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}} />
          
          {/* 5 Item Pertama (Selalu Muncul) */}
          {tabs.slice(0, 5).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`snap-center shrink-0 flex flex-col items-center gap-2.5 w-16 md:w-24 group transition-all`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 ${tab.bg} ${tab.color} ${activeTab === tab.id ? 'ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-slate-900 scale-105' : 'group-hover:scale-105'}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] md:text-xs font-bold text-center leading-tight transition-colors ${activeTab === tab.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {tab.name}
              </span>
            </button>
          ))}
          
          {/* Item Sisanya (Sembunyikan di Mobile, Muncul di Desktop) */}
          {tabs.slice(5).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`snap-center shrink-0 hidden md:flex flex-col items-center gap-2.5 w-16 md:w-24 group transition-all`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 ${tab.bg} ${tab.color} ${activeTab === tab.id ? 'ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-slate-900 scale-105' : 'group-hover:scale-105'}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] md:text-xs font-bold text-center leading-tight transition-colors ${activeTab === tab.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {tab.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="px-2 md:px-0 w-full min-w-0">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{getActiveTabTitle()}</h3>
          {activeTab === 'master_time' && (
            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold cursor-pointer border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Calendar size={12} /> Lihat kalender &gt;
            </span>
          )}
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0">
          {activeTab === "ringkasan" && <RingkasanPribadi />}
          {activeTab === "wali_kelas" && <RuangWaliKelas />}
          {activeTab === "muhaffidz" && <RuangMuhaffidz />}
          {activeTab === "aktivitas_rutin" && <AktivitasRutin />}
          {activeTab === "catatan" && <CatatanPribadi />}
          {activeTab === "master_time" && <MasterTime />}
          {activeTab === "saran_online" && <SaranOnline />}
          {activeTab === "log_aktivitas" && <LogAktivitas />}
        </div>
      </div>

      {/* ── Modal Semua Menu ── */}
      {showAllMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Semua Menu Cepat</h3>
              <button onClick={() => setShowAllMenu(false)} className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="p-6 grid grid-cols-3 gap-y-6 gap-x-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setShowAllMenu(false); }}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 ${tab.bg} ${tab.color} group-hover:scale-110`}>
                    {tab.icon}
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight text-slate-600 dark:text-slate-400 group-hover:text-emerald-600">
                    {tab.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-500 font-medium border-t border-slate-100 dark:border-slate-800">
              Silakan pilih menu untuk menampilkannya di beranda.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
