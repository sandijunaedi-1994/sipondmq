"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, UserCircle2, ChevronRight, ChevronDown, Building, Briefcase } from "lucide-react";
import Swal from "sweetalert2";

export default function TabStruktur() {
  const [units, setUnits] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      
      // Fetch Units
      const resUnit = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/organisasi/unit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resUnit.ok) throw new Error("Gagal mengambil data unit");
      const dataUnit = await resUnit.json();
      setUnits(dataUnit.units || []);

      // Fetch Pegawai (for dropdown)
      const resPegawai = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resPegawai.ok) {
        const dataPegawai = await resPegawai.json();
        setPegawaiList(dataPegawai.data || []);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.message,
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (unitId) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleAddUnit = async (parentId = null) => {
    const { value: formValues } = await Swal.fire({
      title: 'Tambah Unit Baru',
      html: `
        <div class="text-left">
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Unit</label>
          <input id="swal-nama" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
      customClass: {
        popup: 'rounded-2xl border border-slate-200 dark:border-slate-800',
        confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-bold bg-indigo-500 hover:bg-indigo-600',
        cancelButton: 'rounded-xl px-5 py-2.5 text-sm font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
      },
      preConfirm: () => {
        return {
          nama: document.getElementById('swal-nama').value,
        }
      }
    });

    if (formValues && formValues.nama) {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/organisasi/unit`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ nama: formValues.nama, parentId })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Gagal menyimpan unit');
        }
        Swal.fire({
          title: 'Berhasil!',
          text: 'Unit telah ditambahkan.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
          customClass: { popup: 'rounded-2xl border border-slate-200 dark:border-slate-800' }
        });
        if (parentId) {
          setExpandedUnits(prev => ({ ...prev, [parentId]: true }));
        }
        fetchData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: err.message,
          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        });
      }
    }
  };

  const handleAddPosisi = async (unitId, isKepala) => {
    let pegawaiOptions = `<option value="">-- Pilih Pegawai (Opsional) --</option>`;
    pegawaiList.forEach(p => {
      pegawaiOptions += `<option value="${p.id}">${p.namaLengkap}</option>`;
    });

    const { value: formValues } = await Swal.fire({
      title: isKepala ? 'Tentukan Kepala Unit' : 'Tambah Staf',
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Jabatan/Posisi</label>
            <input id="swal-posisi-nama" placeholder="${isKepala ? 'Contoh: Direktur Pendidikan' : 'Contoh: Staf Admin'}" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Pegawai yang Menjabat</label>
            <select id="swal-posisi-pegawai" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200">
              ${pegawaiOptions}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
      customClass: {
        popup: 'rounded-2xl border border-slate-200 dark:border-slate-800 overflow-visible',
        confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-bold bg-indigo-500 hover:bg-indigo-600',
        cancelButton: 'rounded-xl px-5 py-2.5 text-sm font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
      },
      preConfirm: () => {
        return {
          nama: document.getElementById('swal-posisi-nama').value,
          pegawaiId: document.getElementById('swal-posisi-pegawai').value,
        }
      }
    });

    if (formValues && formValues.nama) {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/organisasi/posisi`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            nama: formValues.nama, 
            unitId, 
            isKepala, 
            pegawaiId: formValues.pegawaiId || null 
          })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Gagal menyimpan posisi');
        }
        Swal.fire({
          title: 'Berhasil!',
          text: 'Posisi telah ditambahkan.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
          customClass: { popup: 'rounded-2xl border border-slate-200 dark:border-slate-800' }
        });
        setExpandedUnits(prev => ({ ...prev, [unitId]: true }));
        fetchData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: err.message,
          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        });
      }
    }
  };

  const handleDeleteUnit = async (unitId) => {
    const result = await Swal.fire({
      title: 'Hapus Unit?',
      text: "Seluruh staf dan sub-unit tidak dapat dihapus jika unit ini masih memilikinya.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
      customClass: {
        popup: 'rounded-2xl border border-slate-200 dark:border-slate-800',
        confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-bold',
        cancelButton: 'rounded-xl px-5 py-2.5 text-sm font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
      }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/organisasi/unit/${unitId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Gagal menghapus unit');
        }
        fetchData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: err.message,
          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        });
      }
    }
  };

  const handleDeletePosisi = async (posisiId) => {
    const result = await Swal.fire({
      title: 'Hapus Posisi?',
      text: "Data staf/kepala di posisi ini akan dihapus dari struktur.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
      customClass: {
        popup: 'rounded-2xl border border-slate-200 dark:border-slate-800',
        confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-bold',
        cancelButton: 'rounded-xl px-5 py-2.5 text-sm font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
      }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/organisasi/posisi/${posisiId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Gagal menghapus posisi');
        fetchData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: err.message,
          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        });
      }
    }
  };

  const handleJobdesk = async (posisi) => {
    const { value: formValues } = await Swal.fire({
      title: `Detail Jobdesk: ${posisi.nama}`,
      html: `
        <div class="text-left space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Peran Utama</label>
            <textarea id="swal-peran" rows="3" placeholder="Deskripsikan peran utama dari jabatan ini..." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-200">${posisi.peran || ''}</textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggung Jawab</label>
            <textarea id="swal-tanggungjawab" rows="4" placeholder="Sebutkan tanggung jawab spesifik..." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-200">${posisi.tanggungJawab || ''}</textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Wewenang</label>
            <textarea id="swal-wewenang" rows="3" placeholder="Sebutkan wewenang dari jabatan ini..." class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-200">${posisi.wewenang || ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Tutup',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
      customClass: {
        popup: 'rounded-2xl border border-slate-200 dark:border-slate-800 w-[500px]',
        confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-bold bg-indigo-500 hover:bg-indigo-600',
        cancelButton: 'rounded-xl px-5 py-2.5 text-sm font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
      },
      preConfirm: () => {
        return {
          peran: document.getElementById('swal-peran').value,
          tanggungJawab: document.getElementById('swal-tanggungjawab').value,
          wewenang: document.getElementById('swal-wewenang').value,
        }
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/organisasi/posisi/${posisi.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(formValues)
        });
        if (!res.ok) throw new Error('Gagal menyimpan jobdesk');
        
        Swal.fire({
          title: 'Tersimpan!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
          customClass: { popup: 'rounded-2xl border border-slate-200 dark:border-slate-800' }
        });
        fetchData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: err.message,
          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        });
      }
    }
  };

  const renderUnit = (unit, level = 0) => {
    const isExpanded = expandedUnits[unit.id];
    const hasChildren = unit.children && unit.children.length > 0;
    
    const kepala = unit.posisi.find(p => p.isKepala);
    const stafList = unit.posisi.filter(p => !p.isKepala);

    return (
      <div key={unit.id} className="relative mb-2">
        {/* Unit Card */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors relative z-10`}>
          <div className="flex items-start md:items-center gap-3">
            <button 
              onClick={() => toggleExpand(unit.id)}
              className={`p-1.5 rounded-lg transition-colors ${hasChildren || stafList.length > 0 ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400' : 'opacity-0 pointer-events-none'}`}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-md">
                  <Building size={14} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{unit.nama}</h3>
              </div>
              
              {kepala ? (
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 py-1 px-2.5 rounded-md border border-slate-100 dark:border-slate-800 inline-flex group cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors" onClick={() => handleJobdesk(kepala)}>
                  <UserCircle2 size={14} className="text-emerald-500" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{kepala.nama}</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span>{kepala.pegawai ? kepala.pegawai.namaLengkap : <span className="italic text-slate-400">(Kosong)</span>}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePosisi(kepala.id); }} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-500"><Trash2 size={12}/></button>
                </div>
              ) : (
                <div className="mt-1.5 inline-flex">
                  <button 
                    onClick={() => handleAddPosisi(unit.id, true)}
                    className="text-[11px] font-semibold px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Plus size={10} /> Set Kepala Unit
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 md:mt-0 flex items-center gap-1.5 md:pl-0 pl-11">
            <button 
              onClick={() => handleAddPosisi(unit.id, false)}
              className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-lg transition-colors flex items-center gap-1"
            >
              <Briefcase size={12} /> + Staf
            </button>
            <button 
              onClick={() => handleAddUnit(unit.id)}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Building size={12} /> + Sub Unit
            </button>
            <button 
              onClick={() => handleDeleteUnit(unit.id)}
              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Expanded Content (Staf & Sub-units) */}
        {isExpanded && (
          <div className="ml-6 pl-4 border-l-2 border-dashed border-slate-200 dark:border-slate-800 mt-2 space-y-2">
            {/* Staf List */}
            {stafList.length > 0 && (
              <div className="space-y-1.5">
                {stafList.map(staf => (
                  <div key={staf.id} onClick={() => handleJobdesk(staf)} className="relative flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors group">
                    <div className="absolute -left-[18px] top-1/2 w-4 h-[2px] border-b-2 border-dashed border-slate-200 dark:border-slate-800"></div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500 overflow-hidden">
                        {staf.pegawai?.fotoUrl ? (
                          <img src={staf.pegawai.fotoUrl} alt="foto" className="w-full h-full object-cover" />
                        ) : <UserCircle2 size={14} />}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{staf.nama}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{staf.pegawai ? staf.pegawai.namaLengkap : <span className="italic text-rose-400">Posisi Kosong</span>}</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletePosisi(staf.id); }} className="p-1 text-rose-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Sub Units Recursion */}
            {hasChildren && (
              <div className="pt-1">
                {unit.children.map(child => (
                  <div key={child.id} className="relative">
                    <div className="absolute -left-[18px] top-6 w-4 h-[2px] border-b-2 border-dashed border-slate-200 dark:border-slate-800 z-0"></div>
                    {renderUnit(child, level + 1)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Memuat Struktur Organisasi...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Struktur Organisasi</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kelola hierarki unit dan penempatan staf</p>
        </div>
        <button 
          onClick={() => handleAddUnit(null)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors text-sm"
        >
          <Plus size={16} /> Unit Root Baru
        </button>
      </div>

      {units.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl border-dashed">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Belum Ada Struktur</h3>
          <p className="text-slate-500 dark:text-slate-500 mt-2 max-w-sm mx-auto mb-6">
            Mulai dengan menambahkan unit level tertinggi (Root) seperti Yayasan atau Pesantren.
          </p>
          <button 
            onClick={() => handleAddUnit(null)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} /> Buat Unit Root
          </button>
        </div>
      ) : (
        <div className="bg-slate-50/50 dark:bg-slate-900/20 p-2 md:p-6 rounded-3xl">
          {units.map(unit => renderUnit(unit, 0))}
        </div>
      )}
    </div>
  );
}
