"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export default function AdminSurveyPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [editStatus, setEditStatus] = useState("MENUNGGU");
  const [editCatatan, setEditCatatan] = useState("");
  const [editRegistrationId, setEditRegistrationId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registrations, setRegistrations] = useState([]);

  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/survey`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSurveys(data.surveys || []);
      }
    } catch (err) {
      console.error("Error fetching surveys", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb?page=1&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      }
    } catch (err) {
      console.error("Error fetching registrations", err);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
    fetchRegistrations();
  }, [fetchSurveys, fetchRegistrations]);

  const openEditModal = (survey) => {
    setSelectedSurvey(survey);
    setEditStatus(survey.status || "MENUNGGU");
    setEditCatatan(survey.catatan || "");
    setEditRegistrationId(survey.registrationId || "");
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/survey/${selectedSurvey.id}/action`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          status: editStatus,
          catatan: (editStatus === 'TIDAK_DAFTAR' || editStatus === 'BATAL' || editStatus === 'LAINNYA') ? editCatatan : null,
          registrationId: editStatus === 'DAFTAR' ? editRegistrationId : null
        })
      });
      
      if (res.ok) {
        setEditModalOpen(false);
        fetchSurveys();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal mengupdate status");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 text-slate-500 dark:text-slate-400 transition-colors">Memuat data survei...</p></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-950/50 transition-colors">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Data Survey Kunjungan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Total {surveys.length} jadwal survei ditemukan.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider transition-colors">
                <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-800 transition-colors">Jadwal</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-800 transition-colors">Calon Santri</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-800 transition-colors">Program</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-800 transition-colors">Status</th>
                <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right transition-colors">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {surveys.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400 transition-colors">Belum ada data survei.</td>
                </tr>
              ) : surveys.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:bg-slate-950/50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 transition-colors">{formatDate(item.tanggal)}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{item.jam}</div>
                  </td>
                  <td className="p-4">
                    {item.status === 'DAFTAR' && item.registrationId ? (
                      <Link href={`/admin/ppdb/peserta/${item.registrationId}`} className="font-bold text-emerald-600 hover:underline">
                        {item.namaSantri} ↗
                      </Link>
                    ) : (
                      <div className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{item.namaSantri}</div>
                    )}
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{item.noHp || "-"}</div>
                    <div className="text-[10px] text-slate-400 mt-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block transition-colors">
                      Gender: {item.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-700 dark:text-slate-200 transition-colors">{item.program}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.status === 'DAFTAR' ? 'bg-emerald-100 text-emerald-700' :
                      (item.status === 'TIDAK_DAFTAR' || item.status === 'BATAL') ? 'bg-red-100 text-red-700' :
                      item.status === 'LAINNYA' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    } transition-colors`}>
                      {item.status === 'TIDAK_DAFTAR' ? 'TIDAK DAFTAR' : item.status === 'BATAL' ? 'BATAL SURVEI' : item.status}
                    </span>
                    {(item.status === 'TIDAK_DAFTAR' || item.status === 'BATAL' || item.status === 'LAINNYA') && item.catatan && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[150px] transition-colors" title={item.catatan}>
                        Catatan: {item.catatan}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editModalOpen && selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 transition-colors">Update Status Survei</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Status</label>
                <select 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="MENUNGGU">MENUNGGU</option>
                  <option value="DAFTAR">DAFTAR (Lanjut Registrasi)</option>
                  <option value="BATAL">BATAL (Tidak Jadi Survei)</option>
                  <option value="TIDAK_DAFTAR">TIDAK DAFTAR</option>
                  <option value="LAINNYA">LAINNYA</option>
                </select>
              </div>

              {editStatus === 'DAFTAR' && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 transition-colors">
                  <label className="block text-sm font-bold text-emerald-800 mb-1">Tautkan ke Data Pendaftar</label>
                  <p className="text-xs text-emerald-600 mb-2">Opsional. Pilih nama pendaftar untuk menautkan data survei ini.</p>
                  <select 
                    value={editRegistrationId}
                    onChange={(e) => setEditRegistrationId(e.target.value)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg outline-none focus:border-emerald-500 text-sm bg-white dark:bg-slate-900 transition-colors"
                  >
                    <option value="">-- Tidak Ditautkan --</option>
                    {registrations.map(reg => (
                      <option key={reg.id} value={reg.id}>{reg.studentName} ({reg.program})</option>
                    ))}
                  </select>
                </div>
              )}

              {(editStatus === 'TIDAK_DAFTAR' || editStatus === 'BATAL' || editStatus === 'LAINNYA') && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Catatan / Alasan</label>
                  <textarea 
                    required
                    rows="3"
                    value={editCatatan}
                    onChange={(e) => setEditCatatan(e.target.value)}
                    placeholder="Tuliskan catatan detail..."
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-colors"
                  ></textarea>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6 transition-colors">
                <button 
                  type="button" 
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
