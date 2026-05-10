"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/auth/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        const resChildren = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/children`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 401 || resChildren.status === 401) {
          localStorage.removeItem("auth_token");
          router.push("/login");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        }
        
        if (resChildren.ok) {
          const dataChildren = await resChildren.json();
          setChildren(dataChildren.children || []);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const reg = profile?.registrations?.[0];
  const regData = reg?.registrationData;

  const handleUpdateHubungan = async (santriId, newHubungan) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/portal/children/${santriId}/hubungan`, {
        method: 'PUT',
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ hubungan: newHubungan })
      });
      if (res.ok) {
        setChildren(prev => prev.map(child => 
          child.id === santriId ? { ...child, hubungan: newHubungan } : child
        ));
        alert("Hubungan Wali berhasil diperbarui");
      } else {
        alert("Gagal memperbarui Hubungan Wali");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto p-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-primary-dark">Profil Wali Santri</h1>

        <div className="bg-surface p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-primary mb-4 border-b pb-2">Informasi Akun</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Email</p>
              <p className="font-medium text-text-primary">{profile?.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Nomor Telepon</p>
              <p className="font-medium text-text-primary">{profile?.phone || "-"}</p>
            </div>
          </div>
        </div>

        {children.length > 0 && (
          <div className="bg-surface p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4 border-b pb-2">Santri Aktif</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map(child => (
                <div key={child.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{child.nama}</h3>
                    <p className="text-sm text-slate-500">NIS: {child.nis || "-"}</p>
                    <p className="text-sm text-slate-500">Kelas: {child.kelas || "-"} | Asrama: {child.asrama || "-"}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <label className="text-xs text-slate-500 font-semibold mb-1 block">Status Hubungan Anda:</label>
                    <select 
                      value={child.hubungan}
                      onChange={(e) => handleUpdateHubungan(child.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="AYAH">Sebagai Ayah</option>
                      <option value="IBU">Sebagai Ibu</option>
                      <option value="WALI">Sebagai Wali (Lainnya)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {regData ? (
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-primary mb-4 border-b pb-2">Data Calon Santri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><p className="text-sm text-text-secondary">Nama Lengkap</p><p className="font-medium">{reg?.studentName}</p></div>
                <div><p className="text-sm text-text-secondary">Nama Panggilan</p><p className="font-medium">{regData.nickname}</p></div>
                <div><p className="text-sm text-text-secondary">TTL</p><p className="font-medium">{regData.birthPlace}, {new Date(regData.birthDate).toLocaleDateString('id-ID')}</p></div>
                <div><p className="text-sm text-text-secondary">No. KK</p><p className="font-medium">{regData.noKk}</p></div>
                <div><p className="text-sm text-text-secondary">NIK</p><p className="font-medium">{regData.nik}</p></div>
                <div><p className="text-sm text-text-secondary">NISN</p><p className="font-medium">{regData.nisn}</p></div>
                <div><p className="text-sm text-text-secondary">Anak Ke</p><p className="font-medium">{regData.childNumber} dari {regData.siblingCount} bersaudara</p></div>
                <div className="col-span-full"><p className="text-sm text-text-secondary">Prestasi</p><p className="font-medium">{regData.achievements || "-"}</p></div>
                <div className="col-span-full"><p className="text-sm text-text-secondary">Riwayat Medis</p><p className="font-medium">{regData.medicalHistory || "-"}</p></div>
                <div className="col-span-full"><p className="text-sm text-text-secondary">Minat/Bakat</p><p className="font-medium">{regData.talents || "-"}</p></div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-primary mb-4 border-b pb-2">Data Orang Tua</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-slate-700 mb-3">Ayah</h3>
                  <div className="space-y-2">
                    <div><p className="text-sm text-text-secondary">Nama</p><p className="font-medium">{regData.fatherName}</p></div>
                    <div><p className="text-sm text-text-secondary">Umur</p><p className="font-medium">{regData.fatherAge} tahun</p></div>
                    <div><p className="text-sm text-text-secondary">Pendidikan</p><p className="font-medium">{regData.fatherEducation}</p></div>
                    <div><p className="text-sm text-text-secondary">Pekerjaan</p><p className="font-medium">{regData.fatherOccupation}</p></div>
                    <div><p className="text-sm text-text-secondary">Penghasilan</p><p className="font-medium">{regData.fatherIncome}</p></div>
                    <div><p className="text-sm text-text-secondary">Alamat</p><p className="font-medium">{regData.fatherAddress}</p></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 mb-3">Ibu</h3>
                  <div className="space-y-2">
                    <div><p className="text-sm text-text-secondary">Nama</p><p className="font-medium">{regData.motherName}</p></div>
                    <div><p className="text-sm text-text-secondary">Umur</p><p className="font-medium">{regData.motherAge} tahun</p></div>
                    <div><p className="text-sm text-text-secondary">Pendidikan</p><p className="font-medium">{regData.motherEducation}</p></div>
                    <div><p className="text-sm text-text-secondary">Pekerjaan</p><p className="font-medium">{regData.motherOccupation}</p></div>
                    <div><p className="text-sm text-text-secondary">Penghasilan</p><p className="font-medium">{regData.motherIncome}</p></div>
                    <div><p className="text-sm text-text-secondary">Alamat</p><p className="font-medium">{regData.motherAddress}</p></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-sm text-text-secondary">Status Orang Tua</p>
                <p className="font-medium">{regData.parentStatus === "BERSAMA" ? "Tinggal Bersama" : "Bercerai"}</p>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-primary mb-4 border-b pb-2">Data Saudara Kandung</h2>
              {regData.siblings?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {regData.siblings.map((sib, i) => (
                    <div key={sib.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <p className="font-bold text-sm mb-2">Saudara #{i + 1}</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-slate-500">Nama:</span> {sib.name}</p>
                        <p><span className="text-slate-500">Umur:</span> {sib.age} tahun</p>
                        <p><span className="text-slate-500">Pendidikan:</span> {sib.education}</p>
                        <p><span className="text-slate-500">Pekerjaan:</span> {sib.occupation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Tidak ada data saudara kandung.</p>
              )}
            </div>

            <div className="bg-surface p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-primary mb-4 border-b pb-2">Saudara Aktif di MQ</h2>
              {regData.mqSiblings?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {regData.mqSiblings.map((sib, i) => (
                    <div key={sib.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <p className="font-bold text-sm mb-2">Saudara #{i + 1}</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-slate-500">Nama:</span> {sib.name}</p>
                        <p><span className="text-slate-500">Program:</span> {sib.program}</p>
                        <p><span className="text-slate-500">Kelas:</span> {sib.class}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Tidak ada saudara yang aktif di MQ.</p>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-surface p-8 rounded-xl border border-slate-200 text-center shadow-sm">
            <p className="text-text-secondary">Anda belum mengisi Kelengkapan Data.</p>
          </div>
        )}
      </main>
    </div>
  );
}
