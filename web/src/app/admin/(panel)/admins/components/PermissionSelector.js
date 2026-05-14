"use client";

import { useState } from "react";

export const PERMISSIONS_SCHEMA = [
  {
    kategori: "Dashboard",
    icon: "📊",
    menus: [
      {
        nama: "Dashboard Organisasi",
        actions: [
          { id: "DASHBOARD_ORGANISASI_VIEW", label: "Lihat Dashboard Organisasi" }
        ]
      },
      {
        nama: "Dashboard Santri",
        actions: [
          { id: "DASHBOARD_SANTRI_VIEW", label: "Lihat Dashboard Santri" }
        ]
      }
    ]
  },
  {
    kategori: "Ruang Kerja Saya",
    icon: "💼",
    menus: [
      {
        nama: "Ruang Kerja",
        actions: [
          { id: "RUANGKERJA_CATATAN_VIEW", label: "Lihat Catatan" },
          { id: "RUANGKERJA_CATATAN_EDIT", label: "Kelola Catatan" },
          { id: "RUANGKERJA_RUTIN_VIEW", label: "Lihat Aktivitas Rutin" },
          { id: "RUANGKERJA_RUTIN_EDIT", label: "Tambah/Edit Aktivitas Rutin" }
        ]
      },
      {
        nama: "Ruang Khusus",
        actions: [
          { id: "WALI_KELAS_VIEW", label: "Akses Ruang Wali Kelas" },
          { id: "MUHAFFIDZ_VIEW", label: "Akses Ruang Muhaffidz" }
        ]
      }
    ]
  },
  {
    kategori: "Organisasi",
    icon: "🏢",
    menus: [
      {
        nama: "Menu Organisasi",
        actions: [
          { id: "ORGANISASI_VIEW", label: "Akses Menu Organisasi" },
          { id: "ORGANISASI_EDIT", label: "Kelola Organisasi" },
          { id: "ORGANISASI_TAB_OKR", label: "Tab: OKR & KPI" },
          { id: "ORGANISASI_TAB_STRUKTUR", label: "Tab: Struktur & Jobdesk" },
          { id: "ORGANISASI_TAB_PIVOT", label: "Tab: PIVOT" },
          { id: "ORGANISASI_TAB_PROJECT", label: "Tab: Manajemen Project" },
          { id: "ORGANISASI_TAB_RAPAT", label: "Tab: Rapat" }
        ]
      }
    ]
  },
  {
    kategori: "Direktorat Pusat",
    icon: "🏛️",
    menus: [
      {
        nama: "Sekretariat",
        actions: [
          { id: "SEKRETARIAT_VIEW", label: "Akses Menu Sekretariat" },
          { id: "SEKRETARIAT_EDIT", label: "Kelola Surat/Arsip" },
          { id: "SEKRETARIAT_TAB_SURAT", label: "Tab: Surat Menyurat" },
          { id: "SEKRETARIAT_TAB_ARSIP", label: "Tab: Arsip Dokumen" }
        ]
      },
      {
        nama: "Manajemen SDM",
        actions: [
          { id: "SDM_VIEW", label: "Akses Menu SDM" },
          { id: "SDM_EDIT", label: "Kelola Data SDM" },
          { id: "SDM_TAB_PEGAWAI", label: "Tab: Data Pegawai" },
          { id: "SDM_TAB_PENGGAJIAN", label: "Tab: Penggajian / Payroll" },
          { id: "SDM_TAB_KASBON", label: "Tab: Manajemen Kasbon" },
          { id: "SDM_TAB_REKRUTMEN", label: "Tab: Rekrutmen" },
          { id: "SDM_TAB_KINERJA", label: "Tab: Penilaian Kinerja" }
        ]
      },
      {
        nama: "Litbang & Budaya",
        actions: [
          { id: "LITBANG_VIEW", label: "Akses Menu Litbang" },
          { id: "LITBANG_EDIT", label: "Kelola Litbang" },
          { id: "LITBANG_TAB_PENELITIAN", label: "Tab: Penelitian & Inovasi" },
          { id: "LITBANG_TAB_SOP", label: "Tab: Penyusunan SOP" }
        ]
      },
      {
        nama: "Pengelolaan Keuangan",
        actions: [
          { id: "KEUANGAN_ANGGARAN_VIEW", label: "Akses Menu Keuangan Pusat" },
          { id: "KEUANGAN_PENGGAJIAN_VIEW", label: "Lihat Penggajian" },
          { id: "KEUANGAN_ANGGARAN_EDIT", label: "Kelola Anggaran" },
          { id: "KEUANGAN_TAB_ANGGARAN", label: "Tab: Anggaran Tahunan" },
          { id: "KEUANGAN_TAB_PENGGAJIAN", label: "Tab: Penggajian & Insentif" }
        ]
      },
      {
        nama: "Legal & Aset",
        actions: [
          { id: "LEGAL_VIEW", label: "Akses Menu Legal" },
          { id: "LEGAL_EDIT", label: "Kelola Aset/Legal" },
          { id: "PEMBANGUNAN_VIEW", label: "Lihat Daftar Proyek" },
          { id: "PEMBANGUNAN_CREATE", label: "Tambah/Edit Proyek" },
          { id: "PEMBANGUNAN_APPROVE", label: "Setujui Request Unit" },
          { id: "PEMBANGUNAN_DELETE", label: "Hapus Proyek" },
          { id: "LEGAL_TAB_PEMBANGUNAN", label: "Tab: Daftar Project Pembangunan" },
          { id: "LEGAL_TAB_INVENTARIS", label: "Tab: Inventaris & Aset" },
          { id: "LEGAL_TAB_IZIN", label: "Tab: Izin & Legalitas" }
        ]
      }
    ]
  },
  {
    kategori: "Administrasi Pembelajaran",
    icon: "📖",
    menus: [
      {
        nama: "Kurikulum & Jadwal",
        actions: [
          { id: "AKADEMIK_ADMIN_VIEW", label: "Lihat Jadwal/Kurikulum" },
          { id: "AKADEMIK_ADMIN_EDIT", label: "Kelola Jadwal/Kurikulum" }
        ]
      }
    ]
  },
  {
    kategori: "Manajemen SPMB",
    icon: "📋",
    menus: [
      {
        nama: "Data Peserta",
        actions: [
          { id: "SPMB_PESERTA_VIEW", label: "Lihat Daftar" },
          { id: "SPMB_PESERTA_CREATE", label: "Tambah Data" },
          { id: "SPMB_PESERTA_EDIT", label: "Edit Data" },
          { id: "SPMB_PESERTA_DELETE", label: "Hapus Data" }
        ]
      },
      {
        nama: "Data Survey",
        actions: [
          { id: "SPMB_SURVEY_VIEW", label: "Lihat Survey" },
          { id: "SPMB_SURVEY_EDIT", label: "Kelola Survey" }
        ]
      },
      {
        nama: "Pengaturan SPMB",
        actions: [
          { id: "SPMB_SETTINGS_VIEW", label: "Lihat Pengaturan" },
          { id: "SPMB_SETTINGS_EDIT", label: "Ubah Pengaturan" }
        ]
      }
    ]
  },
  {
    kategori: "Santri Aktif",
    icon: "🎓",
    menus: [
      {
        nama: "Data Santri",
        actions: [
          { id: "SANTRI_VIEW", label: "Lihat Daftar" },
          { id: "SANTRI_CREATE", label: "Tambah Santri" },
          { id: "SANTRI_EDIT", label: "Edit Santri" },
          { id: "SANTRI_DELETE", label: "Hapus Santri" }
        ]
      },
      {
        nama: "Kelengkapan Berkas",
        actions: [
          { id: "SANTRI_BERKAS_VIEW", label: "Lihat Berkas" },
          { id: "SANTRI_BERKAS_EDIT", label: "Validasi & Edit" }
        ]
      },
      {
        nama: "Pengaturan Santri",
        actions: [
          { id: "SANTRI_SETTINGS_VIEW", label: "Lihat Pengaturan" },
          { id: "SANTRI_SETTINGS_EDIT", label: "Ubah Pengaturan" }
        ]
      }
    ]
  },
  {
    kategori: "Akademik",
    icon: "📚",
    menus: [
      {
        nama: "Hafalan Qur'an",
        actions: [
          { id: "QURAN_VIEW", label: "Lihat Catatan" },
          { id: "QURAN_CREATE", label: "Tambah Hafalan" },
          { id: "QURAN_EDIT", label: "Edit Hafalan" },
          { id: "QURAN_DELETE", label: "Hapus" }
        ]
      },
      {
        nama: "Hafalan Matan",
        actions: [
          { id: "MATAN_VIEW", label: "Lihat Catatan" },
          { id: "MATAN_CREATE", label: "Tambah Hafalan" },
          { id: "MATAN_EDIT", label: "Edit Hafalan" },
          { id: "MATAN_DELETE", label: "Hapus" }
        ]
      },
      {
        nama: "Pelanggaran",
        actions: [
          { id: "PELANGGARAN_VIEW", label: "Lihat Kasus" },
          { id: "PELANGGARAN_CREATE", label: "Tambah Pelanggaran" },
          { id: "PELANGGARAN_EDIT", label: "Edit Pelanggaran" },
          { id: "PELANGGARAN_DELETE", label: "Hapus" }
        ]
      },
      {
        nama: "Prestasi",
        actions: [
          { id: "PRESTASI_VIEW", label: "Lihat Prestasi" },
          { id: "PRESTASI_CREATE", label: "Tambah Prestasi" },
          { id: "PRESTASI_EDIT", label: "Edit Prestasi" },
          { id: "PRESTASI_DELETE", label: "Hapus" }
        ]
      }
    ]
  },
  {
    kategori: "Keuangan",
    icon: "💳",
    menus: [
      {
        nama: "Setting Tagihan",
        actions: [
          { id: "KEUANGAN_SETTING_VIEW", label: "Lihat Setting" },
          { id: "KEUANGAN_SETTING_EDIT", label: "Ubah Setting" }
        ]
      },
      {
        nama: "Ringkasan Tagihan",
        actions: [
          { id: "KEUANGAN_RINGKASAN_VIEW", label: "Lihat Transaksi" },
          { id: "KEUANGAN_RINGKASAN_EDIT", label: "Konfirmasi & Edit" }
        ]
      },
      {
        nama: "Tagihan Khusus",
        actions: [
          { id: "KEUANGAN_KHUSUS_VIEW", label: "Lihat Tagihan" },
          { id: "KEUANGAN_KHUSUS_CREATE", label: "Buat Tagihan Baru" },
          { id: "KEUANGAN_KHUSUS_EDIT", label: "Edit Tagihan" }
        ]
      },
      {
        nama: "Manajemen Donasi",
        actions: [
          { id: "KEUANGAN_DONASI_VIEW", label: "Lihat Donasi" },
          { id: "KEUANGAN_DONASI_EDIT", label: "Kelola Donasi" }
        ]
      }
    ]
  },
  {
    kategori: "Layanan Umum",
    icon: "🏥",
    menus: [
      {
        nama: "Kesehatan (UKS)",
        actions: [
          { id: "KESEHATAN_VIEW", label: "Lihat Rekam Medis" },
          { id: "KESEHATAN_CREATE", label: "Tambah Rekam" },
          { id: "KESEHATAN_EDIT", label: "Edit Data" },
          { id: "KESEHATAN_DELETE", label: "Hapus" }
        ]
      },
      {
        nama: "Perizinan",
        actions: [
          { id: "PERIZINAN_VIEW", label: "Lihat Izin" },
          { id: "PERIZINAN_APPROVE", label: "Konfirmasi Izin" },
          { id: "PERIZINAN_EDIT", label: "Kelola/Edit" }
        ]
      },
      {
        nama: "Chat / Pesan",
        actions: [
          { id: "CHAT_VIEW", label: "Buka Pesan" },
          { id: "CHAT_REPLY", label: "Balas Pesan" },
          { id: "CHAT_DELETE", label: "Hapus Pesan" }
        ]
      }
    ]
  },
  {
    kategori: "Pusat Informasi",
    icon: "📢",
    menus: [
      {
        nama: "Dokumen",
        actions: [
          { id: "INFO_DOKUMEN_VIEW", label: "Lihat Dokumen" },
          { id: "INFO_DOKUMEN_CREATE", label: "Upload Dokumen" },
          { id: "INFO_DOKUMEN_DELETE", label: "Hapus Dokumen" }
        ]
      },
      {
        nama: "Kalender Kegiatan",
        actions: [
          { id: "INFO_KALENDER_VIEW", label: "Lihat Agenda" },
          { id: "INFO_KALENDER_EDIT", label: "Kelola Agenda" }
        ]
      },
      {
        nama: "Broadcast",
        actions: [
          { id: "INFO_BROADCAST_VIEW", label: "Lihat Riwayat" },
          { id: "INFO_BROADCAST_SEND", label: "Kirim Pesan Baru" }
        ]
      }
    ]
  },
  {
    kategori: "Administrator",
    icon: "🛡️",
    menus: [
      {
        nama: "Manajemen Aplikasi",
        actions: [
          { id: "MANAJEMEN_ADMIN", label: "Akses Superadmin (Penuh & Bypass)" }
        ]
      }
    ]
  }
];

export default function PermissionSelector({ selectedPermissions, onChange }) {
  const [activeTab, setActiveTab] = useState(PERMISSIONS_SCHEMA[0].kategori);

  const handleToggle = (permId) => {
    if (selectedPermissions.includes(permId)) {
      onChange(selectedPermissions.filter(p => p !== permId));
    } else {
      onChange([...selectedPermissions, permId]);
    }
  };

  const handleSelectAllCategory = (kategori) => {
    const cat = PERMISSIONS_SCHEMA.find(c => c.kategori === kategori);
    const allIds = cat.menus.flatMap(m => m.actions.map(a => a.id));
    
    // Check if all are already selected
    const allSelected = allIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Unselect all
      onChange(selectedPermissions.filter(p => !allIds.includes(p)));
    } else {
      // Select all (merge)
      const newPerms = [...new Set([...selectedPermissions, ...allIds])];
      onChange(newPerms);
    }
  };

  const isCategorySelectedAll = (kategori) => {
    const cat = PERMISSIONS_SCHEMA.find(c => c.kategori === kategori);
    const allIds = cat.menus.flatMap(m => m.actions.map(a => a.id));
    return allIds.length > 0 && allIds.every(id => selectedPermissions.includes(id));
  };

  return (
    <div className="flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-colors">
      {/* Sidebar Tabs */}
      <div className="md:w-1/3 bg-slate-50 dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-row md:flex-col overflow-x-auto transition-colors">
        {PERMISSIONS_SCHEMA.map(cat => (
          <button
            key={cat.kategori}
            type="button"
            onClick={() => setActiveTab(cat.kategori)}
            className={`flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-colors whitespace-nowrap text-left
              ${activeTab === cat.kategori 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 md:border-b-0 md:border-l-4 border-emerald-500' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border-b-2 md:border-b-0 md:border-l-4 border-transparent'
              }
            `}
          >
            <span className="text-lg">{cat.icon}</span>
            {cat.kategori}
          </button>
        ))}
      </div>

      {/* Content Sub-tabs */}
      <div className="md:w-2/3 p-5 flex flex-col gap-6">
        {PERMISSIONS_SCHEMA.map(cat => {
          if (cat.kategori !== activeTab) return null;
          return (
            <div key={cat.kategori} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">{cat.kategori}</h4>
                <button 
                  type="button"
                  onClick={() => handleSelectAllCategory(cat.kategori)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  {isCategorySelectedAll(cat.kategori) ? 'Batalkan Semua' : 'Pilih Semua'}
                </button>
              </div>

              <div className="space-y-5">
                {cat.menus.map(menu => (
                  <div key={menu.nama} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{menu.nama}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {menu.actions.map(action => (
                        <label key={action.id} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors group">
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={selectedPermissions.includes(action.id)}
                            onChange={() => handleToggle(action.id)} 
                          />
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${selectedPermissions.includes(action.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover:border-emerald-400'}`}>
                            {selectedPermissions.includes(action.id) && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors">{action.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{action.id}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
