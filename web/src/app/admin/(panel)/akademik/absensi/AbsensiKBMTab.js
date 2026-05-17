'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const STATUS_OPTS = [
  { value: 'IZIN',  label: 'Izin',  color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'SAKIT', label: 'Sakit', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'ALPA',  label: 'Alpa',  color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'TUGAS', label: 'Tugas', color: 'bg-purple-100 text-purple-700 border-purple-300' },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AbsensiKBMTab({ pegawaiId }) {
  const { data: session } = useSession();
  const [tanggal, setTanggal]   = useState(todayStr());
  const [sesiList, setSesiList] = useState([]);
  const [loadingSesi, setLoadingSesi] = useState(false);

  // State halaman detail (dalam satu sesi)
  const [activeSesi, setActiveSesi] = useState(null);
  const [santriList, setSantriList] = useState([]);   // [{ santriId, nama, absensi: {status, catatan} | null }]
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  // Fetch sesi mengajar hari ini
  const fetchSesi = useCallback(async () => {
    if (!pegawaiId) return;
    setLoadingSesi(true);
    setActiveSesi(null);
    setSantriList([]);
    try {
      const token = session?.token || localStorage.getItem('auth_token');
      const res = await fetch(`${API}/api/admin/absensi/kbm/sesi?tanggal=${tanggal}&guruId=${pegawaiId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSesiList(data.sesi || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSesi(false);
    }
  }, [tanggal, pegawaiId, session]);

  useEffect(() => { fetchSesi(); }, [fetchSesi]);

  // Fetch daftar santri ketika sesi dipilih
  const openSesi = async (sesi) => {
    setActiveSesi(sesi);
    setLoadingDetail(true);
    setSaved(false);
    try {
      const token = session?.token || localStorage.getItem('auth_token');
      const res = await fetch(`${API}/api/admin/absensi/kbm/santri?slotId=${sesi.id}&tanggal=${tanggal}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Build local state: satu object per santri, null = hadir
      setSantriList((data.santri || []).map(s => ({
        santriId: s.santriId,
        nis: s.nis,
        nama: s.nama,
        gender: s.gender,
        status: s.absensi?.status || null,
        catatan: s.absensi?.catatan || '',
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const setStatus = (idx, status) => {
    setSantriList(prev => prev.map((s, i) => i === idx ? { ...s, status: s.status === status ? null : status } : s));
  };
  const setCatatan = (idx, catatan) => {
    setSantriList(prev => prev.map((s, i) => i === idx ? { ...s, catatan } : s));
  };

  const handleSimpan = async () => {
    if (!activeSesi || !pegawaiId) return;
    setSaving(true);
    try {
      const token = session?.token || localStorage.getItem('auth_token');
      const res = await fetch(`${API}/api/admin/absensi/kbm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          slotId: activeSesi.id,
          tanggal,
          pencatatId: pegawaiId,
          absensi: santriList.map(s => ({ santriId: s.santriId, status: s.status, catatan: s.catatan }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSaved(true);
      fetchSesi(); // refresh badge "sudah diisi"
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const tidakHadirCount = santriList.filter(s => s.status).length;

  return (
    <div className="space-y-4">
      {/* ── Header & Tanggal ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Absensi KBM</h3>
          <p className="text-slate-500 text-sm">Rekam santri yang tidak hadir di setiap sesi</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">Tanggal:</label>
          <input
            type="date"
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {/* ── Panel Kiri: Daftar Sesi ── */}
        <div className="md:col-span-2 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sesi Mengajar</p>
          {loadingSesi ? (
            <div className="text-center py-8 text-slate-400 text-sm">Memuat jadwal...</div>
          ) : sesiList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Tidak ada jadwal mengajar hari ini
            </div>
          ) : (
            sesiList.map(sesi => (
              <button
                key={sesi.id}
                onClick={() => openSesi(sesi)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeSesi?.id === sesi.id
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        JP {sesi.jpKe}
                      </span>
                      <span className="text-xs text-slate-500">{sesi.jamMulai} – {sesi.jamSelesai}</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{sesi.mapel.nama}</p>
                    <p className="text-slate-500 text-xs">{sesi.kelas.nama} {sesi.kelas.markaz ? `· ${sesi.kelas.markaz}` : ''}</p>
                  </div>
                  {sesi.sudahDiisi ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">✓ Sudah</span>
                  ) : (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium shrink-0">Belum</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* ── Panel Kanan: Daftar Santri ── */}
        <div className="md:col-span-3">
          {!activeSesi ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200 py-16">
              ← Pilih sesi di kiri untuk mulai absen
            </div>
          ) : loadingDetail ? (
            <div className="text-center py-16 text-slate-400 text-sm">Memuat daftar santri...</div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {/* Header Panel */}
              <div className="bg-emerald-600 text-white p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{activeSesi.mapel.nama} — {activeSesi.kelas.nama}</p>
                    <p className="text-emerald-100 text-sm">JP {activeSesi.jpKe} · {activeSesi.jamMulai}–{activeSesi.jamSelesai}</p>
                  </div>
                  <div className="text-right text-sm text-emerald-100">
                    <p>{santriList.length} santri</p>
                    <p className="font-bold text-white">{tidakHadirCount} tidak hadir</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100 flex-wrap">
                <span className="text-xs text-slate-500 mr-1 self-center">Klik untuk tandai:</span>
                {STATUS_OPTS.map(s => (
                  <span key={s.value} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.color}`}>{s.label}</span>
                ))}
              </div>

              {/* Daftar Santri */}
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {santriList.map((santri, idx) => (
                  <div key={santri.santriId} className={`p-3 transition-colors ${santri.status ? 'bg-red-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs w-6 text-center shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${santri.status ? 'text-red-700' : 'text-slate-800'}`}>{santri.nama}</p>
                        <p className="text-xs text-slate-400">{santri.nis || '—'}</p>
                      </div>
                      {/* Status Buttons */}
                      <div className="flex gap-1 shrink-0">
                        {STATUS_OPTS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setStatus(idx, opt.value)}
                            title={opt.label}
                            className={`text-xs px-2 py-1 rounded-lg border font-bold transition-all ${
                              santri.status === opt.value
                                ? opt.color + ' ring-2 ring-offset-1 ring-current'
                                : 'border-slate-200 text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Catatan (hanya muncul jika ada status) */}
                    {santri.status && (
                      <div className="mt-2 ml-9">
                        <input
                          type="text"
                          value={santri.catatan}
                          onChange={e => setCatatan(idx, e.target.value)}
                          placeholder="Catatan (opsional)..."
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer: Simpan */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                {saved && (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <span>✓</span> Absensi tersimpan!
                  </p>
                )}
                {!saved && <p className="text-xs text-slate-400">{tidakHadirCount} dari {santriList.length} santri ditandai tidak hadir</p>}
                <button
                  onClick={handleSimpan}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition disabled:opacity-60 ml-auto"
                >
                  {saving ? 'Menyimpan...' : '💾 Simpan Absensi'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
