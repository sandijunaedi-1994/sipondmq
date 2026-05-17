'use client';
import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

const STATUS_OPTS = [
  { value: 'IZIN',  label: 'Izin',  color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'SAKIT', label: 'Sakit', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'ALPA',  label: 'Alpa',  color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'TUGAS', label: 'Tugas', color: 'bg-purple-100 text-purple-700 border-purple-300' },
];

const WAKTU_INFO = {
  SUBUH:   { icon: '🌅', label: 'Subuh',   color: 'from-indigo-900 to-indigo-700' },
  DZUHUR:  { icon: '☀️',  label: 'Dzuhur',  color: 'from-amber-500 to-amber-400' },
  ASHAR:   { icon: '🌤️', label: 'Ashar',   color: 'from-orange-500 to-orange-400' },
  MAGHRIB: { icon: '🌇', label: 'Maghrib', color: 'from-rose-700 to-rose-500' },
  ISYA:    { icon: '🌙', label: 'Isya',    color: 'from-slate-800 to-slate-700' },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function padTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

export default function AbsensiShalatTab({ pegawaiId }) {
  const [tanggal, setTanggal]       = useState(todayStr());
  const [jadwalList, setJadwalList] = useState([]);
  const [loadingJadwal, setLoadingJadwal] = useState(false);
  const [now, setNow]               = useState(new Date());

  // Panel absensi aktif
  const [activeWaktu, setActiveWaktu]   = useState(null);
  const [santriList, setSantriList]     = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);

  // Check-in state
  const [checkingIn, setCheckingIn]     = useState(false);

  // Update jam setiap menit
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const fetchJadwal = useCallback(async () => {
    setLoadingJadwal(true);
    setActiveWaktu(null);
    setSantriList([]);
    try {
      const token = getToken();
      const pegawaiParam = pegawaiId ? `&pegawaiId=${pegawaiId}` : '';
      const res = await fetch(`${API}/api/admin/absensi/shalat/jadwal?tanggal=${tanggal}${pegawaiParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setJadwalList(data.jadwal || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingJadwal(false);
    }
  }, [tanggal, pegawaiId]);

  useEffect(() => { fetchJadwal(); }, [fetchJadwal]);

  const handleCheckIn = async (waktu) => {
    if (!pegawaiId) return alert('ID musyrif tidak ditemukan');
    setCheckingIn(waktu);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/admin/absensi/shalat/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ musyrifId: pegawaiId, tanggal, waktu })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchJadwal(); // refresh status
    } catch (e) {
      alert('Check-in gagal: ' + e.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const openAbsensi = async (waktu) => {
    setActiveWaktu(waktu);
    setLoadingDetail(true);
    setSaved(false);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/admin/absensi/shalat/santri?tanggal=${tanggal}&waktu=${waktu}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSantriList((data.santri || []).map(s => ({
        santriId: s.santriId,
        nis: s.nis,
        nama: s.nama,
        kelas: s.kelas,
        asrama: s.asrama,
        status: s.absensi?.status || null,
        catatan: s.absensi?.catatan || '',
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const setStatus  = (idx, status)  => setSantriList(prev => prev.map((s, i) => i === idx ? { ...s, status: s.status === status ? null : status } : s));
  const setCatatan = (idx, catatan) => setSantriList(prev => prev.map((s, i) => i === idx ? { ...s, catatan } : s));

  const handleSimpan = async () => {
    if (!activeWaktu || !pegawaiId) return;
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/admin/absensi/shalat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tanggal, waktu: activeWaktu, pencatatId: pegawaiId,
          absensi: santriList.map(s => ({ santriId: s.santriId, status: s.status, catatan: s.catatan }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSaved(true);
      fetchJadwal();
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const tidakHadirCount = santriList.filter(s => s.status).length;
  const nowMins = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Absensi Shalat Berjamaah</h3>
          <p className="text-slate-500 text-sm">Musyrif check-in dahulu sebelum input absensi santri</p>
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

      {loadingJadwal ? (
        <div className="text-center py-12 text-slate-400">Mengambil jadwal shalat...</div>
      ) : (
        <div className="grid md:grid-cols-5 gap-4">
          {/* ── Panel Kiri: 5 Waktu Shalat ── */}
          <div className="md:col-span-2 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Waktu Shalat</p>
            {jadwalList.map(item => {
              const info = WAKTU_INFO[item.waktu];
              const isActive = activeWaktu === item.waktu;
              const checkedIn = !!item.checkIn;
              const canInput = checkedIn || !pegawaiId; // non-musyrif bisa langsung input

              // Status window
              const [h, m] = item.jam.split(':').map(Number);
              const adzan = h * 60 + m;
              const isWindowBuka = item.windowStatus === 'BUKA';
              const isTodayTanggal = tanggal === todayStr();

              return (
                <div
                  key={item.waktu}
                  className={`rounded-xl border overflow-hidden ${isActive ? 'border-emerald-500 shadow-md' : 'border-slate-200'}`}
                >
                  {/* Header waktu */}
                  <div className={`bg-gradient-to-r ${info.color} text-white p-3 flex justify-between items-center`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{info.icon}</span>
                      <div>
                        <p className="font-bold text-sm">{info.label}</p>
                        <p className="text-xs opacity-80">{item.jam} WIB</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      {item.sudahAbsen ? (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">✓ Selesai</span>
                      ) : (
                        <span className="bg-white/10 px-2 py-0.5 rounded-full">Belum</span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="bg-white p-3 space-y-2">
                    {/* Check-in musyrif */}
                    {pegawaiId && (
                      <div>
                        {checkedIn ? (
                          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
                            <span>✓</span>
                            <span>Check-in {new Date(item.checkIn.waktuCheckIn).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})} — {item.checkIn.status === 'TEPAT_WAKTU' ? 'Tepat Waktu' : 'Terlambat'}</span>
                          </div>
                        ) : (
                          <div>
                            {isWindowBuka ? (
                              <button
                                onClick={() => handleCheckIn(item.waktu)}
                                disabled={checkingIn === item.waktu}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-lg transition disabled:opacity-60"
                              >
                                {checkingIn === item.waktu ? 'Memproses...' : `✓ Check-In Musyrif (${item.windowOpen}–${item.windowClose})`}
                              </button>
                            ) : (
                              <div className="text-xs text-slate-400 text-center py-1">
                                {item.windowStatus === 'BELUM_BUKA'
                                  ? `⏳ Window buka pukul ${item.windowOpen}`
                                  : `🔒 Window check-in tutup`}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tombol input absensi */}
                    <button
                      onClick={() => openAbsensi(item.waktu)}
                      disabled={!canInput}
                      className={`w-full text-xs font-semibold py-1.5 rounded-lg border transition ${
                        isActive
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                          : canInput
                            ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                            : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {canInput ? '📋 Input Absensi Santri' : '🔒 Check-in dulu'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Panel Kanan: Daftar Santri ── */}
          <div className="md:col-span-3">
            {!activeWaktu ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200 py-20">
                ← Pilih waktu shalat untuk input absensi
              </div>
            ) : loadingDetail ? (
              <div className="text-center py-16 text-slate-400">Memuat daftar santri...</div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div className={`bg-gradient-to-r ${WAKTU_INFO[activeWaktu].color} text-white p-4`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{WAKTU_INFO[activeWaktu].icon} {WAKTU_INFO[activeWaktu].label}</p>
                      <p className="text-white/80 text-sm">{jadwalList.find(j => j.waktu === activeWaktu)?.jam} WIB · {tanggal}</p>
                    </div>
                    <div className="text-right text-sm text-white/80">
                      <p>{santriList.length} santri</p>
                      <p className="font-bold text-white">{tidakHadirCount} tidak hadir</p>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100 flex-wrap">
                  <span className="text-xs text-slate-500 mr-1 self-center">Tandai tidak hadir:</span>
                  {STATUS_OPTS.map(s => (
                    <span key={s.value} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.color}`}>{s.label}</span>
                  ))}
                </div>

                {/* Filter cari */}
                <div className="px-4 py-2 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Cari nama santri..."
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={e => {
                      const q = e.target.value.toLowerCase();
                      // Just visual filter — handled below
                      document.querySelectorAll('[data-santri-row]').forEach(el => {
                        el.style.display = el.dataset.santriNama?.toLowerCase().includes(q) ? '' : 'none';
                      });
                    }}
                  />
                </div>

                {/* Daftar */}
                <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto">
                  {santriList.map((santri, idx) => (
                    <div
                      key={santri.santriId}
                      data-santri-row
                      data-santri-nama={santri.nama}
                      className={`p-3 transition-colors ${santri.status ? 'bg-red-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-xs w-6 text-center shrink-0">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${santri.status ? 'text-red-700' : 'text-slate-800'}`}>{santri.nama}</p>
                          <p className="text-xs text-slate-400">{santri.kelas || '—'}{santri.asrama ? ` · ${santri.asrama}` : ''}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {STATUS_OPTS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setStatus(idx, opt.value)}
                              className={`text-xs px-2 py-1 rounded-lg border font-bold transition-all ${
                                santri.status === opt.value
                                  ? opt.color + ' ring-2 ring-offset-1 ring-current'
                                  : 'border-slate-200 text-slate-400 hover:border-slate-300'
                              }`}
                            >{opt.label}</button>
                          ))}
                        </div>
                      </div>
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

                {/* Footer simpan */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                  {saved && <p className="text-sm text-green-600 font-medium">✓ Absensi tersimpan!</p>}
                  {!saved && <p className="text-xs text-slate-400">{tidakHadirCount} dari {santriList.length} santri tidak hadir</p>}
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
      )}
    </div>
  );
}
