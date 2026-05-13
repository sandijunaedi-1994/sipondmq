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
      const resPegawai = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/sdm/pegawai`, {
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

  const renderUnit = (unit, level = 0) => {
    const isExpanded = expandedUnits[unit.id];
    const hasChildren = unit.children && unit.children.length > 0;
    
    const kepala = unit.posisi.find(p => p.isKepala);
    const stafList = unit.posisi.filter(p => !p.isKepala);

    return (
      <div key={unit.id} className="relative">
        {/* Unit Card */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mb-3 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors ${level > 0 ? 'ml-6 md:ml-12 relative' : ''}`}>
          
          {/* Connector Line for Sub-units */}
          {level > 0 && (
            <div className="absolute -left-6 md:-left-12 top-1/2 w-6 md:w-12 h-px bg-slate-200 dark:bg-slate-700"></div>
          )}
          {level > 0 && (
            <div className="absolute -left-6 md:-left-12 bottom-1/2 w-px h-[calc(100%+12px)] bg-slate-200 dark:bg-slate-700"></div>
          )}

          <div className="flex items-start md:items-center gap-4">
            <button 
              onClick={() => toggleExpand(unit.id)}
              className={`p-2 rounded-xl transition-colors ${hasChildren || stafList.length > 0 ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400' : 'opacity-0 pointer-events-none'}`}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Building size={16} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{unit.nama}</h3>
              </div>
              
              {kepala ? (
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 py-1.5 px-3 rounded-lg border border-slate-100 dark:border-slate-800 inline-flex">
                  <UserCircle2 size={16} className="text-emerald-500" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{kepala.nama}</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span>{kepala.pegawai ? kepala.pegawai.namaLengkap : <span className="italic text-slate-400">(Kosong)</span>}</span>
                  <button onClick={() => handleDeletePosisi(kepala.id)} className="ml-2 text-rose-400 hover:text-rose-500"><Trash2 size={14}/></button>
                </div>
              ) : (
                <div className="mt-2 inline-flex">
                  <button 
                    onClick={() => handleAddPosisi(unit.id, true)}
                    className="text-xs font-semibold px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> Set Kepala Unit
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2 md:pl-0 pl-14">
            <button 
              onClick={() => handleAddPosisi(unit.id, false)}
              className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-xl transition-colors flex items-center gap-1"
            >
              <Briefcase size={14} /> + Staf
            </button>
            <button 
              onClick={() => handleAddUnit(unit.id)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1"
            >
              <Building size={14} /> + Sub Unit
            </button>
            <button 
              onClick={() => handleDeleteUnit(unit.id)}
              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Expanded Content (Staf & Sub-units) */}
        {isExpanded && (
          <div className="mb-4">
            {/* Staf List */}
            {stafList.length > 0 && (
              <div className={`ml-12 md:ml-[5.5rem] mb-3 space-y-2 relative`}>
                <div className="absolute -left-6 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
                {stafList.map(staf => (
                  <div key={staf.id} className="relative flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="absolute -left-6 top-1/2 w-6 h-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500 overflow-hidden">
                        {staf.pegawai?.fotoUrl ? (
                          <img src={staf.pegawai.fotoUrl} alt="foto" className="w-full h-full object-cover" />
                        ) : <UserCircle2 size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{staf.nama}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{staf.pegawai ? staf.pegawai.namaLengkap : <span className="italic text-rose-400">Posisi Kosong</span>}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeletePosisi(staf.id)} className="p-1.5 text-rose-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Sub Units Recursion */}
            {hasChildren && (
              <div className="relative">
                {unit.children.map(child => renderUnit(child, level + 1))}
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
