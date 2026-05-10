"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChat, setNewChat] = useState("");
  const [loadingChat, setLoadingChat] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef(null);
  
  // Store previous message count to detect new unread messages
  const prevMsgCountRef = useRef(0);

  const fetchChat = async (isInitial = false) => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/group-chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
        
        // Calculate unread count based on difference in message length
        if (!isOpen && !isInitial && data.length > prevMsgCountRef.current) {
          setUnreadCount(prev => prev + (data.length - prevMsgCountRef.current));
        }
        
        prevMsgCountRef.current = data.length;
      }
    } catch (error) {
      console.error("Failed to fetch chat", error);
    } finally {
      if (isInitial) setLoadingChat(false);
    }
  };

  useEffect(() => {
    fetchChat(true);
    // Poll chat every 30 seconds
    const interval = setInterval(() => fetchChat(), 30000);
    return () => clearInterval(interval);
  }, [isOpen]); // We include isOpen so when it changes, polling still happens, but unreadCount updates correctly

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isOpen]);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!newChat.trim()) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/group-chat`, {
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

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all transform hover:scale-105 z-50 flex items-center justify-center ${
          isOpen 
            ? "bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rotate-90" 
            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/40"
        }`}
      >
        {isOpen ? <X size={24} className="-rotate-90 transition-transform" /> : <MessageCircle size={24} />}
        
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[500px] max-h-[70vh] z-50 animate-in slide-in-from-bottom-10 fade-in duration-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-lg">
              ☕
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-400 leading-tight">
                Keluarga Besar MQBS
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">
                Ruang obrolan internal
              </p>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
            {loadingChat ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <span className="text-4xl mb-2">👋</span>
                <p className="text-sm font-medium">Jadilah yang pertama menyapa hari ini!</p>
              </div>
            ) : (
              chatMessages.map(msg => {
                // Ensure timezone safety for display
                const msgDate = new Date(msg.createdAt);
                
                return (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <User size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate pr-2">
                          {msg.user?.namaLengkap || 'Sistem'}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {msgDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm text-sm text-slate-600 dark:text-slate-300">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={sendChat} className="flex gap-2">
              <input 
                type="text" 
                value={newChat}
                onChange={e => setNewChat(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white"
              />
              <button 
                type="submit"
                disabled={!newChat.trim()}
                className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
