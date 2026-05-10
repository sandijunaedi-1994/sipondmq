"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

// ─── Constants ────────────────────────────────────────────────────────
const evtColor = {
  LIBUR:     { dot: "bg-red-400",    badge: "bg-red-50 text-red-700 border-red-200"          },
  AKADEMIK:  { dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-200"        },
  KEGIATAN:  { dot: "bg-emerald-500",badge: "bg-emerald-50 text-emerald-700 border-emerald-200"},
  KUNJUNGAN: { dot: "bg-orange-400", badge: "bg-orange-50 text-orange-700 border-orange-200"  },
  LAINNYA:   { dot: "bg-slate-400",  badge: "bg-slate-50 text-slate-700 border-slate-200"     },
};

const DAYS = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function KalenderKegiatan({ events }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today.toISOString().slice(0,10));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getEventsForDate = (d) => {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return events.filter(e => {
      if (e.tanggalSelesai) {
        return key >= e.tanggal.slice(0,10) && key <= e.tanggalSelesai.slice(0,10);
      }
      return e.tanggal.startsWith(key);
    });
  };

  const selectedEvents = events.filter(e => {
    if (e.tanggalSelesai) {
      return selected >= e.tanggal.slice(0,10) && selected <= e.tanggalSelesai.slice(0,10);
    }
    return e.tanggal.startsWith(selected);
  });

  const viewMonthStart = `${year}-${String(month+1).padStart(2,'0')}-01`;
  const viewMonthEnd = `${year}-${String(month+1).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}`;
  
  const rawEventsInViewMonth = events
    .filter(e => {
      const eStart = e.tanggal.slice(0,10);
      const eEnd = e.tanggalSelesai ? e.tanggalSelesai.slice(0,10) : eStart;
      return eStart <= viewMonthEnd && eEnd >= viewMonthStart;
    })
    .sort((a,b) => a.tanggal.localeCompare(b.tanggal));

  // Sort raw events to ensure grouping works
  rawEventsInViewMonth.sort((a,b) => {
    const mDiff = (a.markazId||0) - (b.markazId||0);
    if (mDiff !== 0) return mDiff;
    const jDiff = a.judul.localeCompare(b.judul);
    if (jDiff !== 0) return jDiff;
    return new Date(a.tanggal) - new Date(b.tanggal);
  });

  // Group contiguous events for right panel
  const eventsInViewMonth = [];
  rawEventsInViewMonth.forEach(e => {
    const last = eventsInViewMonth[eventsInViewMonth.length - 1];
    if (last && last.judul.trim() === e.judul.trim() && last.tipe === e.tipe && last.markazId === e.markazId) {
      const lastStr = (last.tanggalSelesai || last.tanggal).slice(0, 10);
      const currStr = e.tanggal.slice(0, 10);
      const lastDateObj = new Date(lastStr + "T00:00:00");
      const currDateObj = new Date(currStr + "T00:00:00");
      const diffDays = Math.round((currDateObj - lastDateObj) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        last.tanggalSelesai = e.tanggal;
        return;
      }
    }
    eventsInViewMonth.push({ ...e, tanggalSelesai: e.tanggalSelesai || null });
  });

  eventsInViewMonth.sort((a,b) => new Date(a.tanggal) - new Date(b.tanggal));

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setViewDate(d);
    setSelected(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`);
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setViewDate(d);
    setSelected(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(evtColor).map(([type, c]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`}/>
            <span className="capitalize">{type.toLowerCase()}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-5">
        {/* Calendar grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <span className="font-bold text-text-primary">{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
          {/* Days header */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map(d => (
              <div key={d} className={`text-center text-xs font-bold py-2 ${d==="Min"?"text-red-400":d==="Sab"?"text-blue-400":"text-slate-400"}`}>{d}</div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={`e${i}`} className="py-2 px-1 border border-transparent" />;
              const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const evts = getEventsForDate(day);
              const isToday = dateKey === today.toISOString().slice(0,10);
              const isSel   = dateKey === selected;
              const dow = (firstDay + day - 1) % 7;
              return (
                <button key={day}
                  onClick={() => setSelected(dateKey)}
                  className={`relative flex flex-col items-center py-2 px-1 transition text-sm border border-transparent
                    ${isSel ? "bg-primary text-white rounded-xl shadow-md" : isToday ? "bg-primary/10 rounded-xl" : "hover:bg-slate-50"}`}
                >
                  <span className={`font-medium leading-none ${dow===0?"text-red-400":dow===6?"text-blue-400":""} ${isSel?"text-white":""}`}>{day}</span>
                  {evts.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {evts.slice(0,3).map((e,j) => {
                        const type = e.tipe || "LAINNYA";
                        return <span key={j} className={`w-1.5 h-1.5 rounded-full ${isSel?"bg-white":evtColor[type].dot}`}/>
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Selected date events */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-3">
              {new Date(selected+"T00:00:00").toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"})}
            </p>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">Tidak ada kegiatan</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((e,i) => {
                  const type = e.tipe || "LAINNYA";
                  return (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${evtColor[type].badge}`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${evtColor[type].dot}`}/>
                      {e.judul}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Events in View Month */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-3">Kegiatan Bulan Ini</p>
            {eventsInViewMonth.length === 0 ? (
              <p className="text-sm text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">Belum ada agenda</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {eventsInViewMonth.map((e,i) => {
                  const dStart = new Date(e.tanggal);
                  const dEnd = e.tanggalSelesai ? new Date(e.tanggalSelesai) : null;
                  const type = e.tipe || "LAINNYA";
                  
                  // Check if selected date falls in range
                  let isSel = false;
                  if (e.tanggalSelesai) {
                    isSel = selected >= e.tanggal.slice(0,10) && selected <= e.tanggalSelesai.slice(0,10);
                  } else {
                    isSel = e.tanggal.startsWith(selected);
                  }

                  return (
                    <button key={i} onClick={() => setSelected(e.tanggal.slice(0,10))} className={`w-full text-left flex items-start gap-3 group p-1.5 rounded-xl transition ${isSel ? "bg-slate-50" : "hover:bg-slate-50"}`}>
                      <div className="text-center flex-shrink-0 w-12 mt-0.5">
                        <p className="text-[10px] text-slate-400 leading-none uppercase font-bold">{MONTHS[dStart.getMonth()].slice(0,3)}</p>
                        <p className={`font-extrabold text-base leading-tight transition ${isSel ? "text-primary" : "text-text-primary group-hover:text-primary"}`}>
                          {dStart.getDate()}{dEnd && dEnd.getMonth() === dStart.getMonth() ? `-${dEnd.getDate()}` : ""}
                        </p>
                        {dEnd && dEnd.getMonth() !== dStart.getMonth() && (
                          <p className="text-[9px] text-slate-400 leading-none mt-1">s/d {dEnd.getDate()} {MONTHS[dEnd.getMonth()].slice(0,3)}</p>
                        )}
                      </div>
                      <div className={`flex-1 px-3 py-2 rounded-xl border text-xs font-medium shadow-sm transition-all hover:shadow-md ${evtColor[type].badge}`}>
                        {e.judul}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const colorMap = [
  { bg: "bg-blue-50",    icon: "bg-blue-100 text-blue-600",    badge: "bg-blue-100 text-blue-700",    border: "border-blue-100"    },
  { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-100 text-emerald-700", border: "border-emerald-100" },
  { bg: "bg-purple-50",  icon: "bg-purple-100 text-purple-600", badge: "bg-purple-100 text-purple-700",  border: "border-purple-100"  },
  { bg: "bg-orange-50",  icon: "bg-orange-100 text-orange-600", badge: "bg-orange-100 text-orange-700",  border: "border-orange-100"  },
];

// ─── Preview Modal ─────────────────────────────────────────────────────────────
function DocModal({ doc, onClose }) {
  const updatedDate = new Date(doc.updatedAt || doc.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4 text-white flex justify-between items-start">
          <div>
            <h2 className="font-bold text-base leading-snug">{doc.judul}</h2>
            <p className="text-white/60 text-xs mt-0.5">Diperbarui: {updatedDate}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition flex-shrink-0 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-text-secondary text-sm leading-relaxed mb-6">{doc.deskripsi || "Tidak ada deskripsi"}</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-600 text-sm font-bold text-center max-w-xs">{doc.judul}.pdf</p>
          </div>
          <div className="flex gap-3">
            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Lihat Dokumen
            </a>
            <a href={doc.fileUrl} download className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 border border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Broadcast Preview Modal ───────────────────────────────────────────────────
function BroadcastModal({ broadcast, onClose }) {
  const dateStr = new Date(broadcast.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
  const isPenting = broadcast.tipe === 'PENTING';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className={`px-6 py-4 flex justify-between items-start ${isPenting ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isPenting ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {isPenting ? 'PENGUMUMAN PENTING' : 'INFORMASI'}
              </span>
            </div>
            <h2 className="font-bold text-base leading-snug">{broadcast.judul}</h2>
            <p className="text-white/80 text-xs mt-1">{dateStr}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition flex-shrink-0 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{broadcast.pesan}</p>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function InformasiPage() {
  const [mainTab, setMainTab]           = useState("broadcast");
  const [activeCategory, setActiveCategory] = useState("semua");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [kalender, setKalender] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}`;
      const res = await fetch(`${baseUrl}/api/portal/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setKalender(data.kalender || []);
        setBroadcasts(data.broadcasts || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data informasi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4 py-8 space-y-6">
          <div className="bg-slate-200 h-32 rounded-2xl animate-pulse"></div>
          <div className="bg-slate-200 h-64 rounded-2xl animate-pulse"></div>
        </main>
      </div>
    );
  }

  // Pre-process documents mapping colors
  const allDocs = categories.flatMap((c, index) => 
    c.dokumen.map((d) => ({ 
      ...d, 
      categoryId: c.id, 
      color: colorMap[index % colorMap.length] 
    }))
  );

  // Sort kalender clone for grouping
  const kalenderClone = [...kalender];
  kalenderClone.sort((a,b) => {
    const mDiff = (a.markazId||0) - (b.markazId||0);
    if (mDiff !== 0) return mDiff;
    const jDiff = a.judul.localeCompare(b.judul);
    if (jDiff !== 0) return jDiff;
    return new Date(a.tanggal) - new Date(b.tanggal);
  });

  // Group contiguous calendar events to get the real count (excluding holidays)
  const groupedKalender = [];
  kalenderClone.forEach(e => {
    const last = groupedKalender[groupedKalender.length - 1];
    if (last && last.judul.trim() === e.judul.trim() && last.tipe === e.tipe && last.markazId === e.markazId) {
      const lastStr = (last.tanggalSelesai || last.tanggal).slice(0, 10);
      const currStr = e.tanggal.slice(0, 10);
      const lastDateObj = new Date(lastStr + "T00:00:00");
      const currDateObj = new Date(currStr + "T00:00:00");
      const diffDays = Math.round((currDateObj - lastDateObj) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        last.tanggalSelesai = e.tanggal;
        return;
      }
    }
    groupedKalender.push({ ...e, tanggalSelesai: e.tanggalSelesai || null });
  });

  const filtered = allDocs.filter((d) => {
    const matchCat = activeCategory === "semua" || d.categoryId === activeCategory;
    const matchSearch = d.judul.toLowerCase().includes(search.toLowerCase()) ||
                        (d.deskripsi && d.deskripsi.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto p-4 py-8 space-y-6 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl px-6 py-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="p-2.5 bg-white/20 rounded-xl shadow-sm backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Pusat Informasi</h1>
              <p className="text-white/70 text-xs font-medium">{allDocs.length} dokumen publik · {groupedKalender.length} agenda kegiatan</p>
            </div>
          </div>
          {/* Main Tab */}
          <div className="flex gap-2 relative z-10 overflow-x-auto pb-2 scrollbar-hide">
            {[{id:"broadcast",label:"📢 Broadcast"},{id:"dokumen",label:"📄 Dokumen"},{id:"kalender",label:"📅 Kalender Kegiatan"}].map(t=>(
              <button key={t.id} onClick={()=>setMainTab(t.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm ${
                  mainTab===t.id?"bg-white text-primary":"bg-white/10 text-white/80 hover:bg-white/20 border border-white/10"}`}>
                {t.label}
              </button>
            ))}
          </div>
          {/* Search (hanya untuk dokumen) */}
          {mainTab==="dokumen" && (
            <div className="mt-4 relative z-10 animate-in fade-in duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Cari dokumen, tata tertib, prosedur…" value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 text-sm font-medium focus:outline-none focus:bg-white/20 focus:border-white/30 transition shadow-inner"
              />
            </div>
          )}
        </div>

        {/* Kalender Tab */}
        {mainTab==="kalender" && <KalenderKegiatan events={kalender} />}

        {/* Broadcast Tab */}
        {mainTab==="broadcast" && (
          <div className="space-y-4">
            {broadcasts.length === 0 ? (
              <div className="bg-surface p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                <div className="text-slate-300 mb-4 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-700">Belum Ada Pengumuman</h3>
                <p className="text-slate-500 text-sm mt-1">Pengumuman penting atau informasi broadcast akan muncul di sini.</p>
              </div>
            ) : (
              broadcasts.map(b => (
                <button 
                  key={b.id} 
                  onClick={() => setSelectedBroadcast(b)}
                  className={`w-full text-left p-5 rounded-2xl border flex items-start gap-4 shadow-sm transition hover:shadow-md ${b.tipe === 'PENTING' ? 'bg-red-50/50 border-red-200 hover:bg-red-50' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className={`p-3 rounded-xl shrink-0 mt-1 ${b.tipe === 'PENTING' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {b.tipe === 'PENTING' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${b.tipe === 'PENTING' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {b.tipe === 'PENTING' ? 'PENTING' : 'INFO'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium shrink-0">{new Date(b.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <h3 className={`font-bold text-lg leading-tight truncate ${b.tipe === 'PENTING' ? 'text-red-900' : 'text-slate-800'}`}>{b.judul}</h3>
                    <p className={`text-xs mt-1.5 line-clamp-1 opacity-70 ${b.tipe === 'PENTING' ? 'text-red-800' : 'text-slate-600'}`}>Klik untuk membaca selengkapnya...</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Category filter — hanya untuk dokumen */}
        {mainTab==="dokumen" && <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("semua")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all shadow-sm
              ${activeCategory === "semua" ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-200 hover:border-primary/40 hover:bg-slate-50"}`}
          >
            🗂️ Semua
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeCategory === "semua" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
              {allDocs.length}
            </span>
          </button>
          {categories.map((cat, index) => (
            <button key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all shadow-sm
                ${activeCategory === cat.id ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-200 hover:border-primary/40 hover:bg-slate-50"}`}
            >
              {cat.ikon || "📝"} {cat.nama}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                {cat.dokumen.length}
              </span>
            </button>
          ))}
        </div>}

        {/* Document list — hanya untuk dokumen */}
        {mainTab==="dokumen" && (filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-surface rounded-2xl border border-dashed border-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="font-bold text-slate-500">Dokumen tidak ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {filtered.map((doc) => {
              const c = doc.color;
              const updatedDate = new Date(doc.updatedAt || doc.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
              
              return (
                <button key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`text-left p-5 bg-white rounded-2xl border ${c.border} shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${c.icon}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-text-primary text-sm leading-snug group-hover:text-primary transition">{doc.judul}</h3>
                      </div>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${c.badge}`}>{doc.tipeFile}</span>
                      <p className="text-xs text-text-secondary mt-2 leading-relaxed line-clamp-2">{doc.deskripsi || "Tidak ada deskripsi."}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span>{updatedDate}</span>
                    <span className="group-hover:text-primary transition flex items-center gap-1">
                      Lihat detail 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </main>

      {/* Modals */}
      {selectedDoc && (
        <DocModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
      {selectedBroadcast && (
        <BroadcastModal broadcast={selectedBroadcast} onClose={() => setSelectedBroadcast(null)} />
      )}
    </div>
  );
}
