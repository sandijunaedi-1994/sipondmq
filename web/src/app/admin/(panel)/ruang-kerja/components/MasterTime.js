"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, CalendarDays, X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import AddActivityModal from "./AddActivityModal";

export default function MasterTime() {
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]); // Kalender Kegiatan events
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("monthly"); // daily, weekly, monthly
  
  const [selectedDate, setSelectedDate] = useState(null); // For Detail Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalDate, setAddModalDate] = useState(new Date());
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, taskId: null, isUserTask: false, isDeleting: false });

  useEffect(() => {
    fetchData();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      // Fetch Schedules
      const resSched = fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/schedules?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch Kalender Kegiatan (It fetches all, we can filter client-side or just use all)
      const resEvent = fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/kalender`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const [schedResponse, eventResponse] = await Promise.all([resSched, resEvent]);
      
      if (schedResponse.ok) {
        const schedData = await schedResponse.json();
        setSchedules(schedData);
      }
      
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        // Filter events for the current month/year to save memory if needed, but for now just set it
        setEvents(eventData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (scheduleId, currentStatus, isUserTask) => {
    try {
      const newStatus = currentStatus === "SELESAI" ? "PENDING" : "SELESAI";
      const token = localStorage.getItem("admin_token");
      
      let url = `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/schedules/${scheduleId}/status`;
      if (isUserTask) {
        url = `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/initiative/${scheduleId}/status`;
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setSchedules(schedules.map(s => s.id === scheduleId ? { ...s, status: newStatus } : s));
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate status: " + error.message);
    }
  };

  const confirmDelete = (taskId, isUserTask, e) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, taskId, isUserTask, isDeleting: false });
  };

  const executeDelete = async () => {
    const { taskId, isUserTask } = deleteConfirm;
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const token = localStorage.getItem("admin_token");
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/routines/schedules/${taskId}`;
      
      if (isUserTask) {
        url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/routines/initiative/${taskId}`;
      }

      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete task");
      }

      setSchedules(schedules.filter(s => s.id !== taskId));
      setDeleteConfirm({ show: false, taskId: null, isUserTask: false, isDeleting: false });
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus tugas: " + error.message);
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Calendar Helpers
  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'weekly') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'monthly') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'weekly') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const getDayItems = (date) => {
    const dString = date.toDateString();
    const daySchedules = schedules.filter(s => new Date(s.taskDate).toDateString() === dString);
    const dayEvents = events.filter(e => new Date(e.tanggal).toDateString() === dString);
    return { daySchedules, dayEvents };
  };

  // Rendering Weekly View
  const renderWeeklyView = () => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const startOfWeek = new Date(d.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      
      const { daySchedules, dayEvents } = getDayItems(dayDate);
      
      days.push(
        <div key={i} 
             onClick={() => setSelectedDate(dayDate)}
             className="flex flex-col border-r border-slate-200 dark:border-slate-800 last:border-0 min-h-[400px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
          <div className="p-3 text-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="text-xs font-bold text-slate-500 uppercase">{dayDate.toLocaleDateString('id-ID', { weekday: 'short' })}</div>
            <div className={`text-xl font-black mt-1 ${dayDate.toDateString() === new Date().toDateString() ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
              {dayDate.getDate()}
            </div>
          </div>
          <div className="p-2 flex-1 space-y-1">
            {/* Render Holidays */}
            {dayEvents.filter(ev => ev.isLibur).length > 0 && (
              <div className="flex gap-1 flex-wrap mb-2 px-1">
                {dayEvents.filter(ev => ev.isLibur).map(ev => (
                  <div key={`ev-${ev.id}`} className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" title={`${ev.judul} (Libur)`}></div>
                ))}
              </div>
            )}
            {/* Render Schedules */}
            {daySchedules.map(sch => (
              <div 
                key={sch.id} 
                className={`text-[10px] p-1.5 rounded-md border transition-colors flex items-start gap-1.5 ${
                  sch.status === 'SELESAI' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 opacity-60' 
                    : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {sch.status === 'SELESAI' ? (
                  <CheckCircle2 size={12} className="shrink-0 mt-0.5 text-emerald-500" />
                ) : (
                  <Circle size={12} className="shrink-0 mt-0.5 text-slate-400" />
                )}
                <span className="truncate">{sch.McRoutineTask?.aktivitas}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto custom-scrollbar bg-white dark:bg-slate-900">
        <div className="grid grid-cols-7 min-w-[800px]">
          {days}
        </div>
      </div>
    );
  };

  // Rendering Monthly View
  const renderMonthlyView = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    
    const blanks = Array.from({ length: firstDay }).map((_, i) => (
      <div key={`blank-${i}`} className="min-h-[120px] bg-slate-50 dark:bg-slate-950/50 border-r border-b border-slate-100 dark:border-slate-800/50 p-2"></div>
    ));
    
    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const dayDate = new Date(y, m, i + 1);
      const isToday = dayDate.toDateString() === new Date().toDateString();
      const { daySchedules, dayEvents } = getDayItems(dayDate);
      const totalItems = daySchedules.length;
      
      return (
        <div key={`day-${i+1}`} 
             onClick={() => setSelectedDate(dayDate)}
             className="min-h-[120px] bg-white dark:bg-slate-900 border-r border-b border-slate-100 dark:border-slate-800/50 p-2 flex flex-col cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors'}`}>
              {i + 1}
            </span>
            {totalItems > 0 && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {totalItems}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-1 overflow-hidden">
            {dayEvents.filter(ev => ev.isLibur).length > 0 && (
              <div className="flex gap-1 flex-wrap mb-1 px-1">
                {dayEvents.filter(ev => ev.isLibur).map(ev => (
                  <div key={`ev-${ev.id}`} className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" title={`${ev.judul} (Libur)`}></div>
                ))}
              </div>
            )}
            {daySchedules.slice(0, 3).map(sch => (
              <div key={sch.id} className={`text-[10px] px-1.5 py-1 rounded border truncate flex items-center gap-1 ${
                  sch.status === 'SELESAI' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-500 opacity-60' 
                    : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                }`}>
                {sch.status === 'SELESAI' && <CheckCircle2 size={10} className="shrink-0" />}
                <span className="truncate">{sch.McRoutineTask?.aktivitas}</span>
              </div>
            ))}
            {totalItems > 3 && (
              <div className="text-[10px] font-bold text-slate-400 px-1 pt-0.5">+{totalItems - 3} lainnya...</div>
            )}
          </div>
        </div>
      );
    });

    const totalSlots = [...blanks, ...days];
    const rows = [];
    let cells = [];

    totalSlots.forEach((slot, i) => {
      if (i % 7 !== 0) {
        cells.push(slot);
      } else {
        rows.push(cells);
        cells = [];
        cells.push(slot);
      }
      if (i === totalSlots.length - 1) {
        while(cells.length < 7) {
          cells.push(<div key={`pad-${cells.length}`} className="min-h-[120px] bg-slate-50 dark:bg-slate-950/50 border-r border-b border-slate-100 dark:border-slate-800/50 p-2"></div>);
        }
        rows.push(cells);
      }
    });

    const monthlyEvents = events.filter(ev => {
      const evDate = new Date(ev.tanggal);
      return evDate.getMonth() === m && evDate.getFullYear() === y;
    });

    const groupedMonthlyEvents = [];
    monthlyEvents.sort((a,b) => new Date(a.tanggal) - new Date(b.tanggal)).forEach(e => {
      const matchingGroupIndex = groupedMonthlyEvents.findIndex(g => {
        if (g.judul !== e.judul || g.tipe !== e.tipe || g.markazId !== e.markazId) return false;
        const lastDate = new Date(g.tanggalSelesai || g.tanggal);
        const currDate = new Date(e.tanggal);
        lastDate.setHours(0,0,0,0);
        currDate.setHours(0,0,0,0);
        const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));
        return diffDays === 1;
      });

      if (matchingGroupIndex >= 0) {
        groupedMonthlyEvents[matchingGroupIndex].tanggalSelesai = e.tanggal;
      } else {
        groupedMonthlyEvents.push({ ...e, tanggalSelesai: null });
      }
    });

    return (
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Kalender 2/3 */}
        <div className="lg:w-2/3">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto custom-scrollbar bg-white dark:bg-slate-900 shadow-sm">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                  <div key={d} className="p-3 text-center text-xs font-bold text-slate-500 uppercase border-r border-slate-200 dark:border-slate-800 last:border-0">{d}</div>
                ))}
              </div>
              {rows.map((row, i) => i > 0 && (
                <div key={`row-${i}`} className="grid grid-cols-7">
                  {row}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Agenda Global 1/3 */}
        <div className="lg:w-1/3 flex flex-col">
          {groupedMonthlyEvents.length > 0 ? (
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 shadow-sm flex-1">
              <h4 className="text-sm font-extrabold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-500" />
                Ringkasan Agenda Global
              </h4>
              <div className="flex flex-col gap-3">
                {groupedMonthlyEvents.map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-white dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0 shadow-sm shadow-blue-500/50"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{ev.judul}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(ev.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                        {ev.tanggalSelesai && ` - ${new Date(ev.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`}
                      </p>
                      {ev.markaz && (
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 mt-2 bg-blue-100 dark:bg-blue-900/50 inline-block px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          {ev.markaz.kode || ev.markaz.nama}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center flex-1 text-center">
              <CalendarDays size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tidak ada agenda global di bulan ini.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Rendering Daily View
  const renderDailyView = () => {
    const { daySchedules, dayEvents } = getDayItems(currentDate);
    const totalItems = daySchedules.length + dayEvents.length;
    
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {totalItems === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-slate-500 font-medium">Tidak ada jadwal atau kegiatan untuk hari ini.</p>
          </div>
        ) : (
          <>
            {/* Events Section */}
            {dayEvents.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays size={16} /> Agenda Global
                </h3>
                {dayEvents.map(ev => (
                  <div key={ev.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/50 rounded-xl relative">
                    <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                      {ev.markaz?.kode || 'Semua Markaz'}
                    </span>
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-lg pr-24">📌 {ev.judul}</h4>
                    {ev.deskripsi && <p className="text-blue-600 dark:text-blue-400 mt-1 text-sm pr-24">{ev.deskripsi}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Routines Section */}
            {daySchedules.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={16} /> Aktivitas Rutin
                </h3>
                <div className="space-y-3">
                  {daySchedules.map(sch => (
                    <ScheduleCard key={sch.id} schedule={sch} onToggle={toggleStatus} onDelete={confirmDelete} size="lg" />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const getDisplayDate = () => {
    if (viewMode === 'monthly') {
      return currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'weekly') {
      const d = new Date(currentDate);
      const day = d.getDay();
      const diff = d.getDate() - day;
      const startOfWeek = new Date(d.setDate(diff));
      const endOfWeek = new Date(d.setDate(d.getDate() + 6));
      return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${currentDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors relative w-full max-w-full overflow-hidden">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Master Time Calendar</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Pantau dan kelola jadwal rutinitas serta agenda global.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button onClick={() => { setAddModalDate(new Date()); setShowAddModal(true); }} className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-2 w-full sm:w-auto">
            <span>➕</span> Tambah Aktivitas
          </button>
          <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-full sm:w-auto overflow-x-auto hide-scrollbar">
            {['daily', 'weekly', 'monthly'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  viewMode === mode 
                    ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-between sm:justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 w-full sm:w-auto">
            <button onClick={prevPeriod} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold min-w-[140px] text-center text-slate-700 dark:text-slate-200">
              {getDisplayDate()}
            </span>
            <button onClick={nextPeriod} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Area */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          {viewMode === 'monthly' && renderMonthlyView()}
          {viewMode === 'weekly' && renderWeeklyView()}
          {viewMode === 'daily' && renderDailyView()}
        </div>
      )}

      {/* Detail Modal */}
      {selectedDate && (
        <DayDetailModal 
          date={selectedDate} 
          onClose={() => setSelectedDate(null)} 
          schedules={schedules.filter(s => new Date(s.taskDate).toDateString() === selectedDate.toDateString())}
          events={events.filter(e => new Date(e.tanggal).toDateString() === selectedDate.toDateString())}
          onToggle={toggleStatus}
          onDelete={confirmDelete}
          onAddActivity={() => { setAddModalDate(selectedDate); setShowAddModal(true); }}
        />
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <AddActivityModal 
          date={addModalDate} 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => { setShowAddModal(false); fetchData(); }} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Hapus Aktivitas?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Apakah Anda yakin ingin menghapus aktivitas ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirm({ show: false, taskId: null, isUserTask: false, isDeleting: false })}
                disabled={deleteConfirm.isDeleting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={executeDelete}
                disabled={deleteConfirm.isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {deleteConfirm.isDeleting ? (
                  <><Loader2 size={16} className="animate-spin" /> Menghapus</>
                ) : (
                  <><Trash2 size={16} /> Hapus</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DayDetailModal({ date, onClose, schedules, events, onToggle, onDelete, onAddActivity }) {
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Detail Hari</h3>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onAddActivity} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors">
              + Aktivitas
            </button>
            <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {(events.length === 0 && schedules.length === 0) ? (
             <div className="text-center p-8 text-slate-400">Tidak ada agenda.</div>
          ) : (
            <>
              {/* Events */}
              {events.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarDays size={14} /> Agenda Global
                  </h4>
                  <div className="space-y-2">
                    {events.map(ev => (
                      <div key={ev.id} className="p-3 bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 rounded-xl relative">
                        <span className="absolute top-3 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                          {ev.markaz?.kode || 'Semua Markaz'}
                        </span>
                        <div className="font-bold text-blue-800 dark:text-blue-300 text-sm pr-20">📌 {ev.judul}</div>
                        {ev.deskripsi && <div className="text-blue-600 dark:text-blue-400 mt-1 text-xs pr-20">{ev.deskripsi}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedules */}
              {schedules.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Aktivitas Rutin
                  </h4>
                  <div className="space-y-2">
                    {schedules.map(sch => (
                      <ScheduleCard key={sch.id} schedule={sch} onToggle={onToggle} onDelete={onDelete} size="md" />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for Daily & Weekly Views and Modal
function ScheduleCard({ schedule, onToggle, onDelete, size = "sm" }) {
  const isDone = schedule.status === 'SELESAI';
  const task = schedule.McRoutineTask;
  
  // Cek apakah tanggal jadwal sudah lewat (sebelum hari ini)
  const getLocalDateString = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const isPast = getLocalDateString(schedule.taskDate) < getLocalDateString(new Date());
  
  const handleToggle = (e) => {
    e.stopPropagation();
    if (isPast) {
      alert("Aktivitas yang sudah lewat tanggalnya tidak dapat diubah.");
      return;
    }
    onToggle(schedule.id, schedule.status, schedule.isUserTask);
  };
  
  return (
    <div 
      onClick={handleToggle}
      className={`p-3 rounded-xl border transition-all flex items-start gap-3 group ${
        isPast ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
      } ${
        isDone 
          ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 opacity-60' 
          : isPast
            ? 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            : 'bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 dark:bg-slate-900 dark:border-emerald-900 dark:hover:border-emerald-700'
      }`}
    >
      <div className="mt-0.5 relative">
        {isDone ? (
          <CheckCircle2 size={size === "lg" ? 24 : 18} className={`text-emerald-500 ${isPast && 'opacity-50'}`} />
        ) : (
          <Circle size={size === "lg" ? 24 : 18} className={`text-slate-300 ${!isPast && 'group-hover:text-emerald-400'} transition-colors`} />
        )}
      </div>
      <div className="flex-1">
        <h4 className={`${size === "lg" ? "text-base" : "text-sm"} font-bold transition-colors ${isDone ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
          {task?.aktivitas}
        </h4>
        <div className="flex items-center gap-3 mt-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
            isDone || isPast
              ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
          }`}>
            {(task?.jamMulai || task?.jamSelesai) ? `${task.jamMulai || '--:--'} - ${task.jamSelesai || '--:--'}` : 'Sepanjang Hari'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7-7z" /></svg>
            {schedule.petugas || 'Semua'}
          </span>
        </div>
      </div>
      {onDelete && !isDone && !isPast && (
        <button 
          onClick={(e) => onDelete(schedule.id, schedule.isUserTask, e)} 
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Hapus aktivitas"
        >
          <Trash2 size={size === "lg" ? 18 : 16} />
        </button>
      )}
    </div>
  );
}
