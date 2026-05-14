"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileText, Trash2, Send, Loader2, Bot, User, File, X } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function LiterasiPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const fileInputRef = useRef(null);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/spmb/literasi/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat dokumen");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    if (!file) return toast.error("Pilih file terlebih dahulu");

    const formData = new FormData();
    formData.append("document", file);
    if (uploadTitle) formData.append("title", uploadTitle);

    try {
      setIsUploading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/spmb/literasi/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const newDoc = await res.json();
        toast.success("Dokumen berhasil diunggah & diekstrak!");
        setDocuments([newDoc, ...documents]);
        setUploadTitle("");
        fileInputRef.current.value = "";
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal mengunggah dokumen");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Hapus dokumen ini?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/spmb/literasi/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
        if (selectedDoc?.id === id) {
          setSelectedDoc(null);
          setMessages([]);
        }
        toast.success("Dokumen dihapus");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const selectDocument = (doc) => {
    if (selectedDoc?.id === doc.id) return;
    setSelectedDoc(doc);
    setMessages([{
      role: 'model',
      content: `Halo! Saya sudah membaca dokumen "${doc.title}". Apa yang ingin Anda tanyakan mengenai dokumen ini?`
    }]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedDoc || isSending) return;

    const userMsg = inputMessage.trim();
    setInputMessage("");
    
    // Add optimistic user message
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsSending(true);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/spmb/literasi/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          message: userMsg,
          history: messages // sending previous context
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: 'model', content: data.reply }]);
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal mendapatkan balasan AI");
        setMessages([...newMessages, { role: 'model', content: "Maaf, terjadi kesalahan pada server AI." }]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      <Toaster position="top-right" />
      
      {/* KIRI: Manajemen Dokumen */}
      <div className="w-1/3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText size={18} className="text-emerald-500" />
            Sumber Pengetahuan
          </h2>
          <p className="text-xs text-slate-500 mt-1">Upload PDF, DOCX, TXT untuk di-chat</p>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <form onSubmit={handleFileUpload} className="space-y-3">
            <div>
              <input 
                type="text" 
                placeholder="Judul Dokumen (Opsional)" 
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".pdf,.docx,.txt"
                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-500/20 dark:file:text-emerald-400"
              />
            </div>
            <button 
              type="submit" 
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {isUploading ? 'Mengekstrak Teks...' : 'Upload Dokumen'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {loadingDocs ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-emerald-500" /></div>
          ) : documents.length === 0 ? (
            <div className="text-center p-6 text-slate-400 text-sm">
              Belum ada dokumen. Upload dokumen pertama Anda!
            </div>
          ) : (
            documents.map(doc => (
              <div 
                key={doc.id}
                onClick={() => selectDocument(doc)}
                className={`p-3 rounded-xl cursor-pointer flex items-start gap-3 transition-colors border ${selectedDoc?.id === doc.id ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className={`p-2 rounded-lg ${selectedDoc?.id === doc.id ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <File size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate ${selectedDoc?.id === doc.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {doc.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">
                      {doc.fileType}
                    </p>
                    <button 
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Hapus Dokumen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* KANAN: Chat Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative">
        {selectedDoc ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Literasi AI</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Chatting dengan: {selectedDoc.title}</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedDoc(null); setMessages([]); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Tutup Chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'user' ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form onSubmit={sendMessage} className="flex items-center gap-3 relative">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={`Tanya AI tentang "${selectedDoc.title}"...`}
                  className="flex-1 bg-slate-100 dark:bg-slate-950 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 px-5 py-3 rounded-full text-sm outline-none transition-all pr-12"
                  disabled={isSending}
                />
                <button 
                  type="submit"
                  disabled={isSending || !inputMessage.trim()}
                  className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-full transition-colors disabled:cursor-not-allowed shadow-md"
                >
                  <Send size={16} className={isSending ? "opacity-0" : ""} />
                  {isSending && <Loader2 size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />}
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400 font-medium">AI Literasi menggunakan model Gemini 1.5 Pro</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Bot size={40} className="text-emerald-500/50" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih Dokumen Literasi</h3>
            <p className="text-sm max-w-sm">Klik dokumen di panel sebelah kiri untuk mulai membaca dan berinteraksi dengan AI.</p>
          </div>
        )}
      </div>
    </div>
  );
}
