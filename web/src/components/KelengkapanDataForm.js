"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KelengkapanDataForm({ registrationId, studentName, onSuccess }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [previousParents, setPreviousParents] = useState(null);
  const [previousSiblings, setPreviousSiblings] = useState([]);
  const [usePreviousParents, setUsePreviousParents] = useState(null); // null, true, false
  
  const [formData, setFormData] = useState({
    nickname: "",
    birthPlace: "",
    birthDate: "",
    noKk: "",
    nik: "",
    nisn: "",
    childNumber: "",
    siblingCount: "",
    achievements: "",
    medicalHistory: "",
    talents: "",
    
    fatherName: "",
    fatherAge: "",
    fatherEducation: "",
    fatherOccupation: "",
    fatherIncome: "",
    fatherAddress: "",
    
    motherName: "",
    motherAge: "",
    motherEducation: "",
    motherOccupation: "",
    motherIncome: "",
    motherAddress: "",
    
    parentStatus: "BERSAMA",
    
    siblings: [],
    mqSiblings: []
  });

  useEffect(() => {
    const fetchPreviousData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/previous-family-data`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.parents) {
            setPreviousParents(data.parents);
          }
          if (data.siblings && data.siblings.length > 0) {
            setPreviousSiblings(data.siblings);
          }
        }
      } catch (err) {
        console.error("Error fetching previous family data", err);
      }
    };
    fetchPreviousData();
  }, []);

  const handleUsePreviousParents = (use) => {
    setUsePreviousParents(use);
    if (use && previousParents) {
      setFormData(prev => ({
        ...prev,
        ...previousParents
      }));
    } else if (!use) {
      // Reset parents data
      setFormData(prev => ({
        ...prev,
        fatherName: "", fatherAge: "", fatherEducation: "", fatherOccupation: "", fatherIncome: "", fatherAddress: "",
        motherName: "", motherAge: "", motherEducation: "", motherOccupation: "", motherIncome: "", motherAddress: "",
        parentStatus: "BERSAMA"
      }));
    }
  };

  const handleSelectPreviousSibling = (sibling) => {
    setFormData(prev => ({
      ...prev,
      siblings: [...prev.siblings, { name: sibling.name, age: sibling.age || "", education: sibling.education || "", occupation: sibling.occupation || "" }]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Validasi angka untuk No.KK, NIK dan NISN
    if ((name === "noKk" || name === "nik" || name === "nisn" || name === "childNumber" || name === "siblingCount" || name === "fatherAge" || name === "motherAge") && value !== "") {
      if (!/^\d+$/.test(value)) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSiblingChange = (index, field, value) => {
    const newSiblings = [...formData.siblings];
    if (field === "age" && value !== "" && !/^\d+$/.test(value)) return;
    newSiblings[index][field] = value;
    setFormData(prev => ({ ...prev, siblings: newSiblings }));
  };

  const addSibling = () => {
    setFormData(prev => ({
      ...prev,
      siblings: [...prev.siblings, { name: "", age: "", education: "", occupation: "" }]
    }));
  };

  const removeSibling = (index) => {
    const newSiblings = formData.siblings.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, siblings: newSiblings }));
  };

  const handleMqSiblingChange = (index, field, value) => {
    const newMqSiblings = [...formData.mqSiblings];
    newMqSiblings[index][field] = value;
    setFormData(prev => ({ ...prev, mqSiblings: newMqSiblings }));
  };

  const addMqSibling = () => {
    setFormData(prev => ({
      ...prev,
      mqSiblings: [...prev.mqSiblings, { name: "", program: "SD", class: "" }]
    }));
  };

  const removeMqSibling = (index) => {
    const newMqSiblings = formData.mqSiblings.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, mqSiblings: newMqSiblings }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Prepare payload
    const payload = {
      registrationId,
      ...formData,
      childNumber: formData.childNumber ? parseInt(formData.childNumber) : null,
      siblingCount: formData.siblingCount ? parseInt(formData.siblingCount) : null,
      fatherAge: formData.fatherAge ? parseInt(formData.fatherAge) : null,
      motherAge: formData.motherAge ? parseInt(formData.motherAge) : null,
      birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
      siblings: formData.siblings.map(s => ({ ...s, age: s.age ? parseInt(s.age) : null })),
    };

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/kelengkapan-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal menyimpan data");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-text-primary mb-6 border-b pb-4">Formulir Kelengkapan Data</h2>
      
      {error && <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Data Anak */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">A. Data Calon Santri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input type="text" value={studentName} disabled className="w-full p-2 border border-slate-300 rounded-lg bg-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Panggilan</label>
              <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
              <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No. KK (Hanya Angka)</label>
              <input type="text" name="noKk" value={formData.noKk} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NIK (Hanya Angka)</label>
              <input type="text" name="nik" value={formData.nik} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NISN (Hanya Angka)</label>
              <input type="text" name="nisn" value={formData.nisn} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anak Ke</label>
              <input type="text" name="childNumber" value={formData.childNumber} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dari Berapa Bersaudara</label>
              <input type="text" name="siblingCount" value={formData.siblingCount} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1">Prestasi</label>
              <textarea name="achievements" value={formData.achievements} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" rows="2" placeholder="Sebutkan jika ada..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Riwayat Penyakit / Kelainan / Kebutuhan Khusus</label>
              <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" rows="2" placeholder="Sebutkan jika ada..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minat atau Bakat</label>
              <textarea name="talents" value={formData.talents} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" rows="2" placeholder="Sebutkan minat atau bakat anak..."></textarea>
            </div>
          </div>
        </section>

        {/* Prompt Data Sebelumnya */}
        {previousParents && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl space-y-3">
            <h4 className="font-bold text-emerald-800">Gunakan Data Orang Tua Sebelumnya?</h4>
            <p className="text-sm text-emerald-700">Kami menemukan data Ayah ({previousParents.fatherName}) dan Ibu ({previousParents.motherName}) dari pendaftaran anak Anda sebelumnya. Apakah Anda ingin menyalin data tersebut?</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => handleUsePreviousParents(true)} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${usePreviousParents === true ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50'}`}>
                Ya, Gunakan Data Ini
              </button>
              <button type="button" onClick={() => handleUsePreviousParents(false)} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${usePreviousParents === false ? 'bg-slate-600 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}>
                Tidak, Isi Data Baru
              </button>
            </div>
          </div>
        )}

        {/* Data Ayah */}
        <section className={`space-y-4 ${usePreviousParents === true ? 'opacity-60 pointer-events-none' : ''}`}>
          <h3 className="text-lg font-semibold text-primary">B. Data Ayah Kandung</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Ayah</label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Umur Ayah</label>
              <input type="text" name="fatherAge" value={formData.fatherAge} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pendidikan Terakhir Ayah</label>
              <input type="text" name="fatherEducation" value={formData.fatherEducation} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pekerjaan Ayah</label>
              <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Penghasilan Ayah (Per Bulan)</label>
              <select name="fatherIncome" value={formData.fatherIncome} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required>
                <option value="">Pilih Penghasilan</option>
                <option value="< 1 Juta">&lt; Rp 1.000.000</option>
                <option value="1-3 Juta">Rp 1.000.000 - Rp 3.000.000</option>
                <option value="3-5 Juta">Rp 3.000.000 - Rp 5.000.000</option>
                <option value="5-10 Juta">Rp 5.000.000 - Rp 10.000.000</option>
                <option value="> 10 Juta">&gt; Rp 10.000.000</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Alamat Ayah</label>
              <textarea name="fatherAddress" value={formData.fatherAddress} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" rows="2" required></textarea>
            </div>
          </div>
        </section>

        {/* Data Ibu */}
        <section className={`space-y-4 ${usePreviousParents === true ? 'opacity-60 pointer-events-none' : ''}`}>
          <h3 className="text-lg font-semibold text-primary">C. Data Ibu Kandung</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Ibu</label>
              <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Umur Ibu</label>
              <input type="text" name="motherAge" value={formData.motherAge} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pendidikan Terakhir Ibu</label>
              <input type="text" name="motherEducation" value={formData.motherEducation} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pekerjaan Ibu</label>
              <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Penghasilan Ibu (Per Bulan)</label>
              <select name="motherIncome" value={formData.motherIncome} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required>
                <option value="">Pilih Penghasilan</option>
                <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                <option value="< 1 Juta">&lt; Rp 1.000.000</option>
                <option value="1-3 Juta">Rp 1.000.000 - Rp 3.000.000</option>
                <option value="3-5 Juta">Rp 3.000.000 - Rp 5.000.000</option>
                <option value="5-10 Juta">Rp 5.000.000 - Rp 10.000.000</option>
                <option value="> 10 Juta">&gt; Rp 10.000.000</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Alamat Ibu</label>
              <textarea name="motherAddress" value={formData.motherAddress} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" rows="2" required></textarea>
            </div>
          </div>
        </section>

        {/* Status Orang Tua */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">D. Status Orang Tua</h3>
          <div>
            <select name="parentStatus" value={formData.parentStatus} onChange={handleChange} className="w-full md:w-1/2 p-2 border border-slate-300 rounded-lg" required>
              <option value="BERSAMA">Tinggal Bersama</option>
              <option value="CERAI">Bercerai</option>
            </select>
          </div>
        </section>

        {/* Data Saudara Kandung */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary">E. Data Saudara Kandung</h3>
            <button type="button" onClick={addSibling} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition">
              + Tambah Saudara Baru
            </button>
          </div>
          
          {previousSiblings && previousSiblings.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4">
              <p className="text-sm font-bold text-slate-700 mb-2">Pilih dari data sebelumnya:</p>
              <div className="flex flex-wrap gap-2">
                {previousSiblings.map((sib, i) => {
                  const isSelected = formData.siblings.some(s => s.name === sib.name);
                  return (
                    <button 
                      key={i} 
                      type="button" 
                      disabled={isSelected}
                      onClick={() => handleSelectPreviousSibling(sib)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition flex items-center gap-1 ${isSelected ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                    >
                      {isSelected && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      {sib.name} {isSelected ? '(Dipilih)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {formData.siblings.length === 0 ? (
            <p className="text-sm text-text-secondary italic">Tidak ada data saudara kandung. Klik tombol tambah jika memiliki saudara.</p>
          ) : (
            <div className="space-y-4">
              {formData.siblings.map((sibling, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg relative bg-slate-50">
                  <button type="button" onClick={() => removeSibling(idx)} className="absolute top-4 right-4 text-error hover:bg-error/10 p-1 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <h4 className="text-sm font-bold mb-3">Saudara #{idx + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                    <div>
                      <label className="block text-xs font-medium mb-1">Nama</label>
                      <input type="text" value={sibling.name} onChange={(e) => handleSiblingChange(idx, "name", e.target.value)} className="w-full p-2 text-sm border border-slate-300 rounded" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Umur</label>
                      <input type="text" value={sibling.age} onChange={(e) => handleSiblingChange(idx, "age", e.target.value)} className="w-full p-2 text-sm border border-slate-300 rounded" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Pendidikan</label>
                      <input type="text" value={sibling.education} onChange={(e) => handleSiblingChange(idx, "education", e.target.value)} className="w-full p-2 text-sm border border-slate-300 rounded" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Pekerjaan</label>
                      <input type="text" value={sibling.occupation} onChange={(e) => handleSiblingChange(idx, "occupation", e.target.value)} className="w-full p-2 text-sm border border-slate-300 rounded" required />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Data Saudara di MQ */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary">F. Saudara yang Aktif di MQ</h3>
            <button type="button" onClick={addMqSibling} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition">
              + Tambah Data
            </button>
          </div>

          {formData.mqSiblings.length === 0 ? (
            <p className="text-sm text-text-secondary italic">Tidak ada saudara yang aktif di MQ. Klik tombol tambah jika ada.</p>
          ) : (
            <div className="space-y-4">
              {formData.mqSiblings.map((sibling, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg relative bg-slate-50">
                  <button type="button" onClick={() => removeMqSibling(idx)} className="absolute top-4 right-4 text-error hover:bg-error/10 p-1 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <h4 className="text-sm font-bold mb-3">Saudara di MQ #{idx + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                    <div>
                      <label className="block text-xs font-medium mb-1">Nama</label>
                      <input type="text" value={sibling.name} onChange={(e) => handleMqSiblingChange(idx, "name", e.target.value)} className="w-full p-2 text-sm border border-slate-300 rounded" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Program</label>
                      <select value={sibling.program} onChange={(e) => handleMqSiblingChange(idx, "program", e.target.value)} className="w-full p-2 text-sm border border-slate-300 rounded" required>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA">SMA</option>
                        <option value="MAHAD_ALY">Ma'had Aly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Kelas</label>
                      <input type="text" value={sibling.class} onChange={(e) => handleMqSiblingChange(idx, "class", e.target.value)} className="w-full p-2 text-sm border border-slate-300 rounded" required />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="pt-6 border-t border-slate-200">
          <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-50">
            {loading ? "Menyimpan Data..." : "Simpan Kelengkapan Data"}
          </button>
        </div>
      </form>
    </div>
  );
}
