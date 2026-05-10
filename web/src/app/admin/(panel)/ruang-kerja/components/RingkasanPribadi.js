"use client";

import { useEffect, useState, useRef } from "react";
import { Send, CheckCircle2, Circle, Clock, Plus } from "lucide-react";
import AddActivityModal from "./AddActivityModal";

export default function RingkasanPribadi() {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [chatMessages, setChatMessages] = useState([]);
  const [newChat, setNewChat] = useState("");
  const [loadingChat, setLoadingChat] = useState(true);
  const chatEndRef = useRef(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    // Get User ID from Token
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId || payload.id);
      } catch (e) {
        console.error("Failed to parse token", e);
      }
    }

    fetchTasks();
    fetchChat();

    // Auto-refresh chat every 10 seconds
    const interval = setInterval(fetchChat, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chatMessages]);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/dashboard/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/group-chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingChat(false);
    }
  };

  const sendChat = async (e) => {
    e.preventDefault();
    if (!newChat.trim()) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/group-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newChat })
      });
      if (res.ok) {
        setNewChat("");
        fetchChat();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus, isUserTask) => {
    // Optimistic UI
    const newStatus = currentStatus === "SELESAI" ? "PENDING" : "SELESAI";
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const token = localStorage.getItem("admin_token");
      let url = `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/schedules/${taskId}/status`;
      
      if (isUserTask) {
        url = `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/routines/initiative/${taskId}/status`;
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      // Revert on error
      console.error(error);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: currentStatus } : t));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Daftar Tugas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[500px]">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-t-2xl flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock className="text-emerald-500" size={20} />
                Daftar Tugas Anda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tugas yang tertunda dan harus diselesaikan hari ini.
              </p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-800/60 rounded-lg transition-colors flex shrink-0"
              title="Tambah Aktivitas"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-3">
            {loadingTasks ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>)}
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-4xl mb-3">🎉</span>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Luar biasa! Tidak ada tugas yang tertunda.</p>
              </div>
            ) : (
              tasks.map(task => {
                const isDone = task.status === 'SELESAI';
                const isOverdue = new Date(task.taskDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                
                return (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTaskStatus(task.id, task.status, task.isUserTask)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 group ${
                      isDone 
                        ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 opacity-60' 
                        : isOverdue
                          ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                          : 'bg-white border-emerald-100 hover:border-emerald-300 dark:bg-slate-900 dark:border-emerald-900'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Circle size={18} className={`transition-colors ${isOverdue ? 'text-red-400' : 'text-slate-300 group-hover:text-emerald-400'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-bold transition-colors ${isDone ? 'text-slate-500 line-through' : isOverdue ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {task.McRoutineTask?.aktivitas}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isDone 
                            ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700' 
                            : isOverdue
                              ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-800/30 dark:text-red-400 dark:border-red-700'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        }`}>
                          {task.isUserTask ? 'Tugas / Inisiatif' : 'Rutinitas'}
                        </span>
                        {isOverdue && !isDone && (
                          <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                            Terlewat! ({new Date(task.taskDate).toLocaleDateString('id-ID')})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Keluarga Besar MQBS (Chat) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[500px]">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/30 rounded-t-2xl">
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <span className="text-2xl">☕</span>
              Keluarga Besar MQBS
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
              Ruang obrolan internal hari ini. Mari saling menyapa dan memotivasi!
            </p>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {loadingChat ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <span className="text-3xl mb-2">👋</span>
                <p className="text-sm">Jadilah yang pertama menyapa hari ini!</p>
              </div>
            ) : (
              chatMessages.map(msg => {
                const isMe = msg.user.id === currentUserId;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      isMe 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm'
                    }`}>
                      {!isMe && (
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                          {msg.user.namaLengkap}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={sendChat} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl flex gap-2">
            <input 
              type="text" 
              value={newChat}
              onChange={e => setNewChat(e.target.value)}
              placeholder="Tulis pesan..." 
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm transition-all outline-none"
            />
            <button 
              type="submit" 
              disabled={!newChat.trim()}
              className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:hover:bg-emerald-600"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
      
      {showAddModal && (
        <AddActivityModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTasks(); // Refresh list after adding
          }}
        />
      )}
    </div>
  );
}
