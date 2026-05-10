"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useChild } from "../../context/ChildContext";

// ─── Mock Contacts & Messages ───────────────────────────────────────────────
const mockContacts = [
  { id: "ust1", name: "Ust. Abdullah (Wali Kelas)", role: "Wali Kelas 10", avatar: "👨‍🏫", lastMsg: "Alhamdulillah, hafalan ananda lancar.", time: "10:30", unread: 2 },
  { id: "ust2", name: "Ust. Fulan (Pengampu Tahfidz)", role: "Pengampu Tahfidz", avatar: "👳", lastMsg: "Target setoran besok juz 29 ya pak.", time: "Kemarin", unread: 0 },
  { id: "adm1", name: "Admin Keuangan MQ", role: "Keuangan", avatar: "🏢", lastMsg: "Terima kasih, pembayaran SPP sudah kami terima.", time: "Selasa", unread: 0 },
  { id: "ks", name: "Ust. Zaid (Kepala Kepengasuhan)", role: "Kepala Kepengasuhan", avatar: "🕌", lastMsg: "Jazakumullah khairan atas kerjasamanya.", time: "Senin", unread: 0 },
];

const mockChatHistory = {
  ust1: [
    { id: 1, sender: "ust1", text: "Assalamu'alaikum Bapak/Ibu.", time: "10:20", isMe: false },
    { id: 2, sender: "ust1", text: "Alhamdulillah, hafalan ananda hari ini lancar dan sudah mencapai target harian.", time: "10:21", isMe: false },
    { id: 3, sender: "me", text: "Wa'alaikumussalam ustadz. Alhamdulillah, terima kasih atas bimbingannya.", time: "10:25", isMe: true },
    { id: 4, sender: "ust1", text: "Sama-sama pak, mohon doanya agar ananda istiqomah.", time: "10:30", isMe: false },
  ],
  ust2: [
    { id: 1, sender: "ust2", text: "Target setoran besok juz 29 ya pak.", time: "Kemarin", isMe: false },
  ],
  adm1: [
    { id: 1, sender: "me", text: "Assalamu'alaikum, saya sudah transfer SPP bulan ini.", time: "Selasa 08:00", isMe: true },
    { id: 2, sender: "adm1", text: "Wa'alaikumussalam. Terima kasih, pembayaran SPP sudah kami terima dan kami update di sistem.", time: "Selasa 09:15", isMe: false },
  ],
  ks: [
    { id: 1, sender: "ks", text: "Jazakumullah khairan atas kerjasamanya dalam membimbing santri saat liburan.", time: "Senin", isMe: false },
  ]
};

export default function ChatPage() {
  const { selectedSantri, loading } = useChild();
  const [activeContact, setActiveContact] = useState(mockContacts[0].id);
  const [messages, setMessages] = useState(mockChatHistory[mockContacts[0].id]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const contact = mockContacts.find(c => c.id === activeContact);

  useEffect(() => {
    if (activeContact) {
      setMessages(mockChatHistory[activeContact] || []);
    }
  }, [activeContact]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: inputText,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isMe: true
    };
    
    setMessages([...messages, newMsg]);
    setInputText("");

    // Simulate reply after 1.5s
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: activeContact,
        text: "Baik, pesan Anda sudah kami terima. InsyaAllah akan segera ditindaklanjuti.",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isMe: false
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 py-8 h-[calc(100vh-80px)]">
        <div className="bg-slate-200 w-full h-full rounded-2xl animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="max-w-6xl w-full mx-auto flex-1 flex p-2 md:p-6 overflow-hidden max-h-[calc(100vh-64px)]">
        
        {/* Main Chat Container */}
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* ─── Sidebar Contacts ─── */}
          <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
            {/* Header Sidebar */}
            <div className="p-5 border-b border-slate-100 bg-white">
              <h1 className="font-bold text-xl text-text-primary tracking-tight">Pesan</h1>
              <div className="mt-3 relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Cari percakapan..." className="w-full bg-slate-100 pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>
            
            {/* Contact List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {mockContacts.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveContact(c.id)}
                  className={`w-full flex items-start gap-3 p-4 transition-all duration-200 border-l-4 
                    ${activeContact === c.id 
                      ? "bg-white border-primary shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] relative z-10" 
                      : "border-transparent hover:bg-white/60"}`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0 relative">
                    {c.avatar}
                    {c.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`font-bold text-sm truncate ${c.unread > 0 ? "text-slate-900" : "text-slate-700"}`}>{c.name}</h3>
                      <span className={`text-[10px] whitespace-nowrap ml-2 ${c.unread > 0 ? "font-bold text-primary" : "text-slate-400"}`}>{c.time}</span>
                    </div>
                    <p className={`text-xs truncate ${c.unread > 0 ? "font-semibold text-slate-700" : "text-slate-500"}`}>{c.lastMsg}</p>
                    <p className="text-[10px] text-primary/70 font-medium mt-1 uppercase tracking-wider">{c.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Chat Area ─── */}
          <div className="flex-1 flex flex-col bg-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            
            {/* Chat Header */}
            {contact && (
              <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shadow-sm">
                    {contact.avatar}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-base">{contact.name}</h2>
                    <p className="text-xs text-primary font-medium">{contact.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!selectedSantri && (
                <div className="mx-auto max-w-sm bg-yellow-50 text-yellow-800 text-xs font-medium text-center p-3 rounded-xl border border-yellow-200 mb-6 shadow-sm">
                  Anda sedang dalam Mode Pratinjau. Fitur chat ini merupakan simulasi interaksi dengan pihak pesantren.
                </div>
              )}
              
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">Hari Ini</span>
              </div>

              {messages.map((msg, idx) => {
                const showAvatar = !msg.isMe && (idx === 0 || messages[idx-1]?.isMe);
                return (
                  <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"} items-end gap-2 group`}>
                    {!msg.isMe && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${showAvatar ? "bg-slate-100 shadow-sm" : "opacity-0"}`}>
                        {contact.avatar}
                      </div>
                    )}
                    
                    <div className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${msg.isMe 
                          ? "bg-gradient-to-br from-primary to-primary-dark text-white rounded-br-sm" 
                          : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"}`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-medium px-1 flex items-center gap-1">
                        {msg.time}
                        {msg.isMe && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-end gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                <button type="button" className="p-2.5 text-slate-400 hover:text-primary transition rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="Ketik pesan..."
                  className="flex-1 bg-transparent py-3 px-2 text-sm outline-none resize-none max-h-32 min-h-[44px]"
                  rows={1}
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </form>
            
          </div>
        </div>
      </main>
    </div>
  );
}
