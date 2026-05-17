"use client";

import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const REQUIRED_DOCS = [
  { type: 'KK',          label: 'Kartu Keluarga',    icon: '🏠' },
  { type: 'KTP_AYAH',   label: 'KTP Ayah',          icon: '👨' },
  { type: 'KTP_IBU',    label: 'KTP Ibu',           icon: '👩' },
  { type: 'AKTA',       label: 'Akta Kelahiran',     icon: '📋' },
  { type: 'IJAZAH',     label: 'Ijazah / SKL',      icon: '🎓' },
  { type: 'FOTO',       label: 'Pas Foto',           icon: '📸' },
  { type: 'SURAT_SEHAT',label: 'Surat Keterangan Sehat', icon: '🏥' },
  { type: 'SKKB',       label: 'SKKB',              icon: '📜' },
];

const STATUS_STYLE = {
  DITERIMA: 'bg-emerald-100 text-emerald-700',
  PENDING:  'bg-amber-100 text-amber-700',
  REVISI:   'bg-red-100 text-red-700',
  DITOLAK:  'bg-red-100 text-red-700',
};

function getToken() {
  return localStorage.getItem("admin_token");
}

// ── Komponen: Satu kartu dokumen ─────────────────────────────
function DocCard({ reqDoc, uploaded, onUpload, onDelete, onVerify, loading }) {
  const inputRef = useRef(null);
  const isImage = uploaded?.fileUrl ? /\.(jpg|jpeg|png|webp)$/i.test(uploaded.fileUrl) : false;
  const isPDF   = uploaded?.fileUrl ? /\.pdf$/i.test(uploaded.fileUrl) : false;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-base">{reqDoc.icon}</span>
          <h4 className="font-bold text-slate-700 text-sm">{reqDoc.label}</h4>
        </div>
        {!uploaded ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-500">BELUM UPLOAD</span>
        ) : (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${STATUS_STYLE[uploaded.status] || 'bg-slate-100 text-slate-500'}`}>
            {uploaded.status}
          </span>
        )}
      </div>

      {/* Preview Area */}
      <div className="p-3">
        {uploaded ? (
          <div className="space-y-2">
            {/* Preview thumbnail */}
            <div className="relative w-full h-36 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
              {isImage ? (
                <img src={uploaded.fileUrl} alt={reqDoc.label} className="w-full h-full object-cover" />
              ) : isPDF ? (
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <span className="text-4xl">📄</span>
                  <span className="text-xs font-medium">PDF Document</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <span className="text-3xl">📎</span>
                  <span className="text-xs">File tersedia</span>
                </div>
              )}
              {/* Overlay aksi */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100 gap-2">
                <a
                  href={uploaded.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white text-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold shadow hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  👁️ Preview
                </a>
              </div>
            </div>

            {/* Tombol aksi */}
            <div className="flex gap-1.5 flex-wrap">
              <a
                href={uploaded.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 rounded-lg text-xs font-semibold transition"
              >
                👁️ Buka
              </a>
              {uploaded.status !== 'DITERIMA' && (
                <button
                  onClick={() => onVerify(uploaded.id, 'DITERIMA')}
                  disabled={loading}
                  className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-500 hover:text-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  ✓ Terima
                </button>
              )}
              <button
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
                title="Upload ulang"
              >
                🔄
              </button>
              <button
                onClick={() => {
                  if (confirm(`Hapus berkas ${reqDoc.label}?`)) onDelete(uploaded.id);
                }}
                disabled={loading}
                className="py-1.5 px-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-xs font-bold transition disabled:opacity-50"
                title="Hapus berkas"
              >
                🗑️
              </button>
            </div>

            {/* Revisi notes */}
            {(uploaded.status === 'REVISI' || uploaded.status === 'DITOLAK') && uploaded.notes && (
              <div className="p-2 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-[10px] font-bold text-red-700 mb-0.5">Catatan:</p>
                <p className="text-xs text-red-600 italic">"{uploaded.notes}"</p>
              </div>
            )}
          </div>
        ) : (
          /* Belum upload */
          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-xl cursor-pointer transition-all group"
          >
            <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">📤</span>
            <p className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">Klik untuk Upload</p>
            <p className="text-[10px] text-slate-300 mt-0.5">JPG, PNG, PDF, max 10MB</p>
          </div>
        )}
      </div>

      {/* Hidden input file */}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,.webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files[0];
          if (file) onUpload(reqDoc.type, file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ── Halaman Utama ─────────────────────────────────────────────
export default function KelengkapanBerkasSantriPage() {
  const [santriList, setSantriList]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterMarkaz, setFilterMarkaz] = useState("SEMUA");
  const [markazList, setMarkazList]   = useState([]);
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  // Modal
  const [selectedSantri, setSelectedSantri]   = useState(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [docMap, setDocMap]                   = useState({});   // { type: document }
  const [actionLoading, setActionLoading]     = useState(false);
  const [uploadingType, setUploadingType]     = useState(null);

  // Preview (iframe)
  const [previewUrl, setPreviewUrl]   = useState(null);

  useEffect(() => { fetchSantri(); }, [filterMarkaz, page]);
  useEffect(() => { fetchMarkaz(); }, []);

  const fetchMarkaz = async () => {
    try {
      const res = await fetch(`${API}/api/admin/markaz`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMarkazList(data.markaz || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchSantri = async (q = search) => {
    setLoading(true);
    try {
      const url = new URL(`${API}/api/admin/santri`);
      url.searchParams.set("page", page);
      url.searchParams.set("limit", 20);
      if (filterMarkaz !== "SEMUA") url.searchParams.set("markazId", filterMarkaz);
      if (q) url.searchParams.set("search", q);
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (res.ok) {
        setSantriList(data.santri || []);
        if (data.pagination) setTotalPages(data.pagination.totalPages);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openModal = async (santri) => {
    setSelectedSantri(santri);
    setIsModalOpen(true);
    // Fetch dokumen terbaru
    await refreshDocs(santri.id);
  };

  const refreshDocs = async (santriId) => {
    try {
      const res = await fetch(`${API}/api/admin/santri/${santriId}/documents`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      const map = {};
      (data.documents || []).forEach(d => { map[d.type] = d; });
      setDocMap(map);
    } catch (e) { console.error(e); }
  };

  const handleUpload = async (type, file) => {
    if (!selectedSantri) return;
    setUploadingType(type);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API}/api/admin/santri/${selectedSantri.id}/documents/${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await refreshDocs(selectedSantri.id);
      fetchSantri(); // update progress bar di tabel
    } catch (e) {
      alert('Upload gagal: ' + e.message);
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = async (docId) => {
    if (!selectedSantri) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/santri/${selectedSantri.id}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await refreshDocs(selectedSantri.id);
      fetchSantri();
    } catch (e) {
      alert('Gagal hapus: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (docId, status, notes = '') => {
    if (!selectedSantri) return;
    const registrationId = selectedSantri.id;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/ppdb/${registrationId}/document/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status, notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await refreshDocs(selectedSantri.id);
      fetchSantri();
    } catch (e) {
      alert('Gagal verifikasi: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSantri(search);
  };

  // Progress berkas per santri
  const getProgress = (santri) => {
    const docs = santri.registration?.documents || [];
    const accepted = docs.filter(d => d.status === 'DITERIMA').length;
    return { accepted, total: REQUIRED_DOCS.length, pct: Math.round(accepted / REQUIRED_DOCS.length * 100) };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Kelengkapan Berkas Santri</h1>
          <p className="text-sm text-slate-500 mt-1">Upload, verifikasi, dan kelola berkas persyaratan santri aktif</p>
        </div>
        <div className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200">
          {santriList.length} santri ditampilkan
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition">
              Cari
            </button>
          </form>
          <select
            value={filterMarkaz}
            onChange={e => { setFilterMarkaz(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SEMUA">Semua Markaz</option>
            {markazList.map(m => (
              <option key={m.id} value={m.id}>{m.kode || m.nama}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Profil Santri</th>
                <th className="px-5 py-3">Markaz</th>
                <th className="px-5 py-3">Program</th>
                <th className="px-5 py-3">Progress Berkas</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Memuat data...
                  </div>
                </td></tr>
              ) : santriList.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">Tidak ada santri ditemukan</td></tr>
              ) : santriList.map(santri => {
                const { accepted, total, pct } = getProgress(santri);
                const isComplete = accepted === total;
                // Format markaz kode
                const markazKode = santri.markaz?.kode || santri.markaz?.nama?.replace('Markaz ', 'MQBS') || '-';

                return (
                  <tr key={santri.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {santri.registration?.studentName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{santri.registration?.studentName}</p>
                          <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{santri.nis || 'Belum ada NIS'}</code>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {markazKode}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">{santri.registration?.program || '-'}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 min-w-[140px]">
                        <div className="flex justify-between text-xs font-bold">
                          <span className={isComplete ? 'text-emerald-600' : 'text-slate-600'}>
                            {accepted}/{total} berkas diterima
                          </span>
                          <span className={isComplete ? 'text-emerald-600' : 'text-blue-600'}>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {isComplete && <p className="text-[10px] text-emerald-600 font-medium">✓ Lengkap</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => openModal(santri)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-600 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm"
                      >
                        📂 Kelola Berkas
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-sm text-slate-500">
          <span>Halaman {page} dari {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition text-xs font-semibold"
            >← Sebelumnya</button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition text-xs font-semibold"
            >Selanjutnya →</button>
          </div>
        </div>
      </div>

      {/* ── Modal Kelola Berkas ── */}
      {isModalOpen && selectedSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">📂 Kelola Berkas — {selectedSantri.registration?.studentName}</h3>
                <p className="text-blue-100 text-sm mt-0.5">
                  NIS: {selectedSantri.nis || '-'} &middot; {selectedSantri.registration?.program} &middot;{' '}
                  Markaz: {selectedSantri.markaz?.kode || selectedSantri.markaz?.nama || '-'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>

            {/* Progress Summary */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
              {(() => {
                const accepted = Object.values(docMap).filter(d => d.status === 'DITERIMA').length;
                const uploaded = Object.keys(docMap).length;
                const total = REQUIRED_DOCS.length;
                const pct = Math.round(accepted / total * 100);
                return (
                  <>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs font-bold text-slate-600 whitespace-nowrap">
                      {accepted}/{total} diterima &middot; {uploaded} diupload
                    </div>
                    {pct === 100 && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ LENGKAP</span>}
                  </>
                );
              })()}
            </div>

            {/* Body: Grid Kartu Dokumen */}
            <div className="flex-1 overflow-y-auto p-5">
              {(uploadingType || actionLoading) && (
                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0"></div>
                  {uploadingType ? `Mengupload ${REQUIRED_DOCS.find(d => d.type === uploadingType)?.label}...` : 'Memproses...'}
                </div>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {REQUIRED_DOCS.map(reqDoc => (
                  <DocCard
                    key={reqDoc.type}
                    reqDoc={reqDoc}
                    uploaded={docMap[reqDoc.type] || null}
                    onUpload={handleUpload}
                    onDelete={handleDelete}
                    onVerify={handleVerify}
                    loading={actionLoading || uploadingType === reqDoc.type}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button
                onClick={() => {
                  const accept = Object.values(docMap).filter(d => d.status !== 'DITERIMA');
                  if (accept.length === 0) { alert('Semua berkas sudah diterima!'); return; }
                  if (confirm(`Terima semua ${accept.length} berkas yang belum diterima?`)) {
                    accept.forEach(d => handleVerify(d.id, 'DITERIMA'));
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
              >
                ✓ Terima Semua
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
