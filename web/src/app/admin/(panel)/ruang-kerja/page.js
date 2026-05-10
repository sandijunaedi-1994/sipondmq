"use client";

import { useState, useEffect } from "react";
import RingkasanPribadi from "./components/RingkasanPribadi";
import LogAktivitas from "./components/LogAktivitas";
import AktivitasRutin from "./components/AktivitasRutin";
import MasterTime from "./components/MasterTime";
import CatatanPribadi from "./components/CatatanPribadi";
import { Clock, Calendar, MapPin } from "lucide-react";

export default function DashboardPribadiPage() {
  const [activeTab, setActiveTab] = useState("ringkasan");
  
  const [adminName, setAdminName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [greetingMsg, setGreetingMsg] = useState("");
  const [currentTime, setCurrentTime] = useState(null);
  const [hijriDate, setHijriDate] = useState("");
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [locationName, setLocationName] = useState("Mendeteksi...");

  useEffect(() => {
    // Nama Admin
    setAdminName(localStorage.getItem("admin_name") || "Admin");

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
        setGreeting("Selamat Pagi 🌅");
        setGreetingMsg("Selamat Beraktivitas, Jangan Lupa meniatkan pekerjaan hari ini untuk meraih ridha Allah.");
      } else if (hour >= 10 && hour < 14) {
        setGreeting("Selamat Siang ☀️");
        setGreetingMsg("Tetap semangat dan jaga fokus dalam menyelesaikan pekerjaan hari ini. Semoga berkah.");
      } else if (hour >= 14 && hour < 18) {
        setGreeting("Selamat Sore 🌇");
        setGreetingMsg("Pekerjaan hari ini hampir usai, semoga lelah Anda bernilai ibadah.");
      } else {
        setGreeting("Selamat Malam 🌙");
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

  const tabs = [
    { id: "ringkasan", name: "Ringkasan", icon: "📊" },
    { id: "aktivitas_rutin", name: "Aktivitas Rutin", icon: "📋" },
    { id: "master_time", name: "Master Time", icon: "📅" },
    { id: "catatan_pribadi", name: "Catatan Pribadi", icon: "📝" },
    { id: "log_aktivitas", name: "Log Aktivitas", icon: "🕒" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-800 dark:to-teal-950 px-5 md:px-6 py-4 rounded-2xl shadow-lg border border-emerald-500/30 dark:border-teal-700/50 transition-colors -mx-2 sm:mx-0 flex flex-col gap-4 text-white">
        
        {/* ── Header Information ── */}
        <div className="flex flex-col xl:flex-row justify-between gap-4">
          
          {/* Kiri: Sapaan */}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              Assalamu'alaikum, {adminName} <span className="font-medium text-base px-2 py-0.5 bg-white/20 rounded-lg backdrop-blur-sm">{greeting}</span>
            </h1>
            <p className="text-sm text-emerald-100 font-medium leading-relaxed max-w-xl mt-1">
              {greetingMsg}
            </p>
          </div>

          {/* Kanan: Jam Live & Tanggal & Jadwal Sholat */}
          <div className="flex flex-col xl:items-end gap-3">
            
            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-emerald-50 font-medium">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/20">
                  <Calendar size={14} className="text-emerald-300" />
                  {currentTime ? currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "Memuat..."}
                </span>
                {hijriDate && (
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/20">
                    🌙 {hijriDate}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 bg-white text-emerald-800 px-3 py-1.5 rounded-lg shadow-inner font-mono text-lg font-bold w-fit">
                <Clock size={18} className={currentTime ? "animate-pulse text-emerald-500" : ""} />
                {currentTime ? currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
                <span className="text-xs font-medium ml-1 opacity-70">WIB</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
              <span className="text-[10px] md:text-xs font-bold text-emerald-200 uppercase tracking-widest mr-1 flex items-center gap-1">
                <MapPin size={12} /> {locationName}
              </span>
              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(prayer => {
                const label = prayer === 'Fajr' ? 'Subuh' : prayer === 'Dhuhr' ? 'Dzuhur' : prayer === 'Asr' ? 'Ashar' : prayer === 'Isha' ? 'Isya' : prayer;
                return (
                  <div key={prayer} className="text-[10px] md:text-xs font-semibold px-2 py-1 rounded bg-white/10 backdrop-blur-sm text-emerald-50">
                    <span className="opacity-70 mr-1.5">{label}</span>
                    <span className="text-white">{prayerTimes ? prayerTimes[prayer] : '--:--'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 pt-3 border-t border-white/20 transition-colors">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white text-emerald-700 shadow-md"
                  : "bg-white/10 text-emerald-50 hover:bg-white/20 border border-white/10"
              }`}
            >
              <span className="text-base md:text-lg">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "ringkasan" && <RingkasanPribadi />}
        {activeTab === "aktivitas_rutin" && <AktivitasRutin />}
        {activeTab === "master_time" && <MasterTime />}
        {activeTab === "catatan_pribadi" && <CatatanPribadi />}
        {activeTab === "log_aktivitas" && <LogAktivitas />}
      </div>
    </div>
  );
}
