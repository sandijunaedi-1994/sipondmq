"use client";

import { useState, useEffect } from "react";
import { Users, Search, Edit2, Shield, X, Check } from "lucide-react";

export default function ManajemenHirarki() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Array of supervisor IDs for the selected user
  const [supervisorIds, setSupervisorIds] = useState([]);
  
  // Search state for modal
  const [modalSearch, setModalSearch] = useState("");

  useEffect(() => {
    fetchHierarchy();
  }, []);

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };
    if (showModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/hierarchy`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data hirarki:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    // Initialize supervisors
    const currentSupIds = user.supervisors ? user.supervisors.map(s => s.supervisor.id) : [];
    setSupervisorIds(currentSupIds);
    setModalSearch(""); // Reset modal search
    setShowModal(true);
  };

  const handleToggleSupervisor = (id) => {
    setSupervisorIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(sId => sId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}/api/admin/hierarchy`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          subordinateId: selectedUser.id,
          supervisorIds: supervisorIds
        })
      });

      if (res.ok) {
        setShowModal(false);
        fetchHierarchy();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Gagal menyimpan hirarki");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.namaLengkap || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Manajemen Hirarki</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Atur hubungan antara Atasan dan Bawahan untuk setiap staf.</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Cari nama staf atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider transition-colors">
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Nama / Staf</th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Peran</th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Daftar Atasan</th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500 dark:text-slate-400">Tidak ada pengguna ditemukan.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                        {(user.namaLengkap || user.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{user.namaLengkap || "-"}</div>
                        <div className="text-xs text-slate-400 font-normal">{user.email || user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-md text-[10px] font-bold tracking-wide">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.supervisors && user.supervisors.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.supervisors.map(sup => (
                          <div key={sup.supervisor.id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold border border-slate-200 dark:border-slate-700">
                            <Shield size={12} className="text-emerald-500" />
                            {sup.supervisor.namaLengkap || "Tanpa Nama"}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ada atasan</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(user)} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm font-bold shadow-sm transition-colors flex items-center gap-2 ml-auto">
                      <Edit2 size={14} /> Atur Hirarki
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Pilih Atasan</h3>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  Untuk: {selectedUser.namaLengkap || selectedUser.email}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium flex-1">Pilih satu atau lebih pengguna dari daftar di bawah ini untuk ditugaskan sebagai atasan dari <b>{selectedUser.namaLengkap}</b>.</p>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Cari atasan..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users
                  .filter(u => u.id !== selectedUser.id)
                  .filter(u => 
                    (u.namaLengkap || "").toLowerCase().includes(modalSearch.toLowerCase()) ||
                    (u.email || "").toLowerCase().includes(modalSearch.toLowerCase())
                  )
                  .map(u => {
                  const isSelected = supervisorIds.includes(u.id);
                  return (
                    <div 
                      key={u.id}
                      onClick={() => handleToggleSupervisor(u.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-transparent'
                      }`}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isSelected ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {u.namaLengkap || u.email}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {u.role}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                className="px-6 py-2.5 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <Check size={16} /> Simpan Atasan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
