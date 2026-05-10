"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function AdminPPDBDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [reg, setReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("BIODATA");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [kelulusanModalOpen, setKelulusanModalOpen] = useState(false);
  const [kelulusanAction, setKelulusanAction] = useState(null);
  const [kelulusanLoading, setKelulusanLoading] = useState(false);
  const [kelulusanNominal, setKelulusanNominal] = useState("15000000"); // Default nominal 15 Juta
  const [sppNominal, setSppNominal] = useState("1900000"); // Default SPP
  const [kelulusanPeriodeNama, setKelulusanPeriodeNama] = useState("");
  const [dropoutAction, setDropoutAction] = useState("");

  const [editDataModalOpen, setEditDataModalOpen] = useState(false);
  const [editDataForm, setEditDataForm] = useState({});
  const [editDataLoading, setEditDataLoading] = useState(false);

  const openEditDataModal = () => {
    setEditDataForm({
      ...reg.registrationData,
      studentName: reg.studentName || "",
      program: reg.program || "",
      gender: reg.gender || "LAKI_LAKI",
      academicYear: reg.academicYear || "",
      markazId: reg.markazId || "",
      previousSchool: reg.previousSchool || "",
      isLanjutan: reg.program === 'SMA' && reg.previousSchool === "SMP Madinatul Qur'an (Lanjutan Internal)",
      siblings: reg.registrationData?.siblings || [],
      mqSiblings: reg.registrationData?.mqSiblings || []
    });
    setEditDataModalOpen(true);
  };

  const handleEditDataChange = (e) => {
    const { name, value } = e.target;
    if ((name === "noKk" || name === "nik" || name === "nisn" || name === "childNumber" || name === "siblingCount" || name === "fatherAge" || name === "motherAge") && value !== "") {
      if (!/^\d+$/.test(value)) return;
    }
    setEditDataForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSiblingChange = (index, field, value) => {
    const newSiblings = [...editDataForm.siblings];
    if (field === "age" && value !== "" && !/^\d+$/.test(value)) return;
    newSiblings[index][field] = value;
    setEditDataForm(prev => ({ ...prev, siblings: newSiblings }));
  };

  const addSibling = () => {
    setEditDataForm(prev => ({
      ...prev,
      siblings: [...(prev.siblings || []), { name: "", age: "", education: "", occupation: "" }]
    }));
  };

  const removeSibling = (index) => {
    const newSiblings = editDataForm.siblings.filter((_, i) => i !== index);
    setEditDataForm(prev => ({ ...prev, siblings: newSiblings }));
  };

  const handleMqSiblingChange = (index, field, value) => {
    const newMqSiblings = [...editDataForm.mqSiblings];
    newMqSiblings[index][field] = value;
    setEditDataForm(prev => ({ ...prev, mqSiblings: newMqSiblings }));
  };

  const addMqSibling = () => {
    setEditDataForm(prev => ({
      ...prev,
      mqSiblings: [...(prev.mqSiblings || []), { name: "", program: "SD", class: "" }]
    }));
  };

  const removeMqSibling = (index) => {
    const newMqSiblings = editDataForm.mqSiblings.filter((_, i) => i !== index);
    setEditDataForm(prev => ({ ...prev, mqSiblings: newMqSiblings }));
  };

  // States for Uang Masuk Deadline & Payment
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");
  const [waiverFileUrl, setWaiverFileUrl] = useState("");
  const [isUpdatingDeadline, setIsUpdatingDeadline] = useState(false);

  const [ubahNominalModalOpen, setUbahNominalModalOpen] = useState(false);
  const [newNominal, setNewNominal] = useState("");
  const [newSppNominal, setNewSppNominal] = useState("");
  const [isUpdatingNominal, setIsUpdatingNominal] = useState(false);

  const [manualPaymentModalOpen, setManualPaymentModalOpen] = useState(false);
  const [manualNominal, setManualNominal] = useState("");
  const [manualMetode, setManualMetode] = useState("TUNAI");
  const [manualBuktiUrl, setManualBuktiUrl] = useState("");
  const [manualCatatan, setManualCatatan] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // States for Evaluation
  const [evalSantriRecom, setEvalSantriRecom] = useState("");
  const [evalSantriNotes, setEvalSantriNotes] = useState("");
  const [evalParentRecom, setEvalParentRecom] = useState("");
  const [evalParentNotes, setEvalParentNotes] = useState("");
  const [evalSaving, setEvalSaving] = useState(false);

  const [testMethod, setTestMethod] = useState("OFFLINE");
  const [testDate, setTestDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewerId, setInterviewerId] = useState("");
  const [academicYears, setAcademicYears] = useState([]);
  const [isEditingScheduleAdmin, setIsEditingScheduleAdmin] = useState(false);

  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [pengujiList, setPengujiList] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [santriRubricAnswers, setSantriRubricAnswers] = useState({});
  const [parentRubricAnswers, setParentRubricAnswers] = useState({});
  
  const [markazList, setMarkazList] = useState([]);

  const [permissions, setPermissions] = useState([]);
  const [adminName, setAdminName] = useState("Penguji");
  const hasFullPpdbAccess = permissions.includes("PPDB");
  const hasWawancaraAccess = permissions.includes("PPDB_WAWANCARA");

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem("admin_permissions") || "[]");
    setPermissions(perms);
    setAdminName(localStorage.getItem("admin_name") || "Penguji");
    fetchDetail();
    fetchQuestions();
    fetchRubrics();
    fetchMarkazList();
    fetchAcademicYears();
    if (perms.includes("PPDB")) {
      fetchPengujiList();
    }
  }, [id]);

  const fetchAcademicYears = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/ppdb/academic-years`);
      if (res.ok) {
        const data = await res.json();
        setAcademicYears(data);
      }
    } catch (err) {
      console.error("Failed to fetch academic years", err);
    }
  };

  const fetchMarkazList = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/markaz`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMarkazList(data.markaz || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPengujiList = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/penguji`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPengujiList(data.penguji || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/interview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInterviewQuestions(data.questions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRubrics = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb-settings/interviewer-rubric`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter out inactive rubrics
        setRubrics((data.rubrics || []).filter(r => r.isActive));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReg(data.registration);
        
        if (data.registration.testMethod) setTestMethod(data.registration.testMethod);
        if (data.registration.testDate) setTestDate(new Date(data.registration.testDate).toISOString().slice(0,16));
        if (data.registration.interviewDate) setInterviewDate(new Date(data.registration.interviewDate).toISOString().slice(0,16));
        if (data.registration.interviewerId) setInterviewerId(data.registration.interviewerId);
        
        if (data.registration.interviewerEvaluation) {
          const ev = data.registration.interviewerEvaluation;
          setEvalSantriRecom(ev.santriRecommendation || "");
          setEvalSantriNotes(ev.santriNotes || "");
          setEvalParentRecom(ev.parentRecommendation || "");
          setEvalParentNotes(ev.parentNotes || "");
          if (ev.santriRubricAnswers) setSantriRubricAnswers(ev.santriRubricAnswers);
          if (ev.parentRubricAnswers) setParentRubricAnswers(ev.parentRubricAnswers);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRegPayment = async () => {
    if (!confirm("Validasi pembayaran pendaftaran Rp 300.000 secara manual? Status akan otomatis berubah menjadi Kelengkapan Data.")) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}/manual-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nominal: 300000,
          metode: "TRANSFER_BANK",
          catatan: "Validasi manual via WA / Admin",
          isRegistrationFee: true
        })
      });
      if (res.ok) {
        alert("Validasi pembayaran berhasil!");
        fetchDetail();
      } else {
        const data = await res.json();
        alert(`Gagal: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDataSubmit = async (e) => {
    e.preventDefault();
    setEditDataLoading(true);
    try {
      const payload = { ...editDataForm };
      if (payload.program === 'SMA' && payload.isLanjutan) {
        payload.previousSchool = "SMP Madinatul Qur'an (Lanjutan Internal)";
      }
      
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditDataModalOpen(false);
        fetchDetail();
        alert("Data berhasil diperbarui");
      } else {
        alert("Gagal memperbarui data");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setEditDataLoading(false);
    }
  };

  const handleDocumentAction = async (docId, status, notes = "") => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}/document/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        setSuccess("Status dokumen diperbarui");
        fetchDetail();
      }
    } catch (err) {
      console.error(err);
      setError("Gagal update dokumen");
    }
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ testMethod, testDate, interviewDate, interviewerId })
      });
      if (res.ok) {
        setSuccess("Jadwal Tes & Wawancara berhasil diatur. Status pendaftar maju ke TES_WAWANCARA.");
        fetchDetail();
      }
    } catch (err) {
      console.error(err);
      setError("Gagal update jadwal");
    }
  };

  const handleKelulusanClick = async (action) => {
    setKelulusanAction(action);
    setKelulusanModalOpen(true);
    
    if (action === "LULUS" && reg?.academicYear && reg?.program && reg?.createdAt) {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/finance/settings/calculate?academicYear=${reg.academicYear}&program=${reg.program}&date=${reg.createdAt}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setKelulusanNominal(data.uangPangkal.toString());
          setSppNominal(data.spp.toString());
          setKelulusanPeriodeNama(data.namaPeriode);
        }
      } catch(e) {
        console.error("Failed to fetch calculation", e);
      }
    }
  };

  const handleRubricChange = (target, topicId, field, value) => {
    if (target === 'SANTRI') {
      setSantriRubricAnswers(prev => ({
        ...prev,
        [topicId]: { ...prev[topicId], [field]: value }
      }));
    } else {
      setParentRubricAnswers(prev => ({
        ...prev,
        [topicId]: { ...prev[topicId], [field]: value }
      }));
    }
  };

  const renderRubricForm = (target) => {
    const targetRubrics = rubrics.filter(r => r.target === target);
    if (targetRubrics.length === 0) return null;

    const answers = target === 'SANTRI' ? santriRubricAnswers : parentRubricAnswers;

    return (
      <div className="mt-6 space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6 transition-colors">
        <h5 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider transition-colors">Topik Penilaian Terstruktur</h5>
        {targetRubrics.map(r => {
          const currentAns = answers[r.id] || { score: null, notes: "" };
          return (
            <div key={r.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 transition-colors">{r.topic}</p>
              {r.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic transition-colors">{r.description}</p>}
              
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { score: 1, label: r.option1, selectedClass: 'bg-red-50 border-red-400', badgeClass: 'bg-red-100 text-red-700', textClass: 'text-red-800' },
                  { score: 2, label: r.option2, selectedClass: 'bg-amber-50 border-amber-400', badgeClass: 'bg-amber-100 text-amber-700', textClass: 'text-amber-800' },
                  { score: 3, label: r.option3, selectedClass: 'bg-emerald-50 border-emerald-400', badgeClass: 'bg-emerald-100 text-emerald-700', textClass: 'text-emerald-800' }
                ].map(opt => (
                  <label key={opt.score} className={`cursor-pointer border rounded-xl p-3 transition-all ${currentAns.score === opt.score ? opt.selectedClass + ' shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:bg-slate-800'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <input type="radio" name={`${target}_${r.id}`} value={opt.score} checked={currentAns.score === opt.score} onChange={() => handleRubricChange(target, r.id, 'score', opt.score)} className="w-4 h-4" />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${opt.badgeClass}`}>SKOR {opt.score}</span>
                    </div>
                    <p className={`text-xs ${currentAns.score === opt.score ? 'font-semibold ' + opt.textClass : 'text-slate-600 dark:text-slate-300'} transition-colors`}>{opt.label}</p>
                  </label>
                ))}
              </div>
              
              <input type="text" placeholder={`Catatan opsional untuk: ${r.topic}...`} value={currentAns.notes} onChange={(e) => handleRubricChange(target, r.id, 'notes', e.target.value)} className="w-full p-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-400 bg-slate-50 dark:bg-slate-950 transition-colors" />
            </div>
          );
        })}
      </div>
    );
  };

  const saveEvaluation = async () => {
    setEvalSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}/evaluation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          santriRecommendation: evalSantriRecom || null,
          santriNotes: evalSantriNotes || null,
          santriInterviewer: adminName,
          parentRecommendation: evalParentRecom || null,
          parentNotes: evalParentNotes || null,
          parentInterviewer: adminName,
          santriRubricAnswers,
          parentRubricAnswers
        })
      });
      if (res.ok) {
        setSuccess("Penilaian pewawancara berhasil disimpan!");
        fetchDetail();
      } else {
        setError("Gagal menyimpan penilaian");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan penilaian");
    } finally {
      setEvalSaving(false);
    }
  };

  const confirmKelulusan = async () => {
    setKelulusanLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}/action`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          action: kelulusanAction, 
          uangMasukNominal: kelulusanAction === 'LULUS' ? Number(kelulusanNominal) : undefined,
          sppNominal: kelulusanAction === 'LULUS' ? Number(sppNominal) : undefined
        })
      });
      if (res.ok) {
        setSuccess(`Kandidat berhasil di set ${kelulusanAction.replace('_', ' ')}`);
        fetchDetail();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal memproses kelulusan.");
      }
    } catch (err) {
      setError("Kesalahan jaringan");
    } finally {
      setKelulusanLoading(false);
      setKelulusanModalOpen(false);
    }
  };

  const handleUpdateDeadline = async () => {
    if (!newDeadline) return alert("Pilih tanggal deadline.");
    setIsUpdatingDeadline(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}/uang-masuk-deadline`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deadline: newDeadline, waiverFileUrl: waiverFileUrl || "Belum ada file" })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Deadline berhasil diperbarui.");
        setDeadlineModalOpen(false);
        fetchDetail();
      } else {
        setError(data.message || "Gagal memperbarui deadline");
      }
    } catch (err) {
      setError("Kesalahan jaringan");
    } finally {
      setIsUpdatingDeadline(false);
    }
  };

  const handleSubmitManualPayment = async () => {
    if (!manualNominal || isNaN(manualNominal) || Number(manualNominal) <= 0) {
      return alert("Nominal pembayaran tidak valid");
    }
    if (manualMetode === "TRANSFER_BANK" && !manualBuktiUrl) {
      return alert("Bukti transfer wajib dilampirkan");
    }

    setIsSubmittingPayment(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}/manual-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nominal: Number(manualNominal),
          metode: manualMetode,
          buktiUrl: manualBuktiUrl || null,
          catatan: manualCatatan
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Pembayaran berhasil dicatat.");
        setManualPaymentModalOpen(false);
        setManualNominal("");
        setManualBuktiUrl("");
        setManualCatatan("");
        fetchDetail();
      } else {
        setError(data.message || "Gagal mencatat pembayaran");
      }
    } catch (err) {
      setError("Kesalahan jaringan");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleUpdateNominal = async () => {
    if ((!newNominal && !newSppNominal) || isNaN(newNominal) || isNaN(newSppNominal)) {
      return alert("Masukkan nominal yang valid.");
    }
    setIsUpdatingNominal(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`}`}`}/api/admin/ppdb/${id}/uang-masuk-nominal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          nominal: newNominal ? Number(newNominal) : undefined,
          sppNominal: newSppNominal ? Number(newSppNominal) : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Nominal uang masuk berhasil diperbarui.");
        setUbahNominalModalOpen(false);
        fetchDetail();
      } else {
        setError(data.message || "Gagal memperbarui nominal");
      }
    } catch (err) {
      setError("Kesalahan jaringan");
    } finally {
      setIsUpdatingNominal(false);
    }
  };

  const getExecutiveSummary = () => {
    if (!reg) return null;
    
    let cbtScore = 0;
    let cbtPassed = false;
    let cbtAttempted = false;
    
    if (reg.user?.examAttempts?.length > 0) {
      cbtAttempted = true;
      const bestAttempt = reg.user.examAttempts.reduce((prev, current) => (prev.score > current.score) ? prev : current);
      cbtScore = bestAttempt.score;
      cbtPassed = cbtScore >= (bestAttempt.exam?.passingGrade || 70);
    }

    const evalSantri = reg.interviewerEvaluation?.santriRecommendation;
    const evalParent = reg.interviewerEvaluation?.parentRecommendation;
    
    let recommendationScore = 0;
    if (evalSantri === 'DIREKOMENDASIKAN') recommendationScore += 2;
    else if (evalSantri === 'DIPERTIMBANGKAN') recommendationScore += 1;
    
    if (evalParent === 'DIREKOMENDASIKAN') recommendationScore += 2;
    else if (evalParent === 'DIPERTIMBANGKAN') recommendationScore += 1;
    
    let summaryTitle = "";
    let summaryColor = "";
    let summaryText = "";

    if (!cbtAttempted || !evalSantri || !evalParent) {
      summaryTitle = "Data Belum Lengkap";
      summaryColor = "amber";
      summaryText = "Proses tes (CBT) atau Wawancara belum sepenuhnya selesai. Disarankan untuk menunggu hingga seluruh data terkumpul sebelum mengambil keputusan.";
    } else if (cbtPassed && recommendationScore >= 3) {
      summaryTitle = "Sangat Direkomendasikan";
      summaryColor = "emerald";
      summaryText = `Kandidat memperoleh nilai CBT yang memuaskan (${cbtScore}) dan mendapatkan rekomendasi positif dari tim wawancara. Kandidat ini sangat layak untuk diluluskan.`;
    } else if (cbtPassed && recommendationScore > 0) {
      summaryTitle = "Layak Dipertimbangkan";
      summaryColor = "blue";
      summaryText = `Kandidat lulus ujian CBT (${cbtScore}), namun ada catatan "Dipertimbangkan" atau "Tidak Direkomendasikan" pada sesi wawancara. Silakan periksa catatan evaluasi penguji sebelum memutuskan.`;
    } else if (!cbtPassed && recommendationScore >= 3) {
      summaryTitle = "Perlu Kebijakan Khusus";
      summaryColor = "indigo";
      summaryText = `Kandidat direkomendasikan dengan baik pada wawancara, namun nilai CBT (${cbtScore}) di bawah standar kelulusan. Keputusan kelulusan membutuhkan pertimbangan khusus/kebijakan.`;
    } else {
      summaryTitle = "Tidak Disarankan";
      summaryColor = "red";
      summaryText = `Kandidat tidak memenuhi standar nilai CBT (${cbtScore}) dan kurang mendapatkan rekomendasi dari pewawancara. Tidak disarankan untuk diluluskan.`;
    }

    let alerts = [];
    const regData = reg.registrationData;
    if (regData) {
      const achievements = regData.achievements?.trim();
      const medicalHistory = regData.medicalHistory?.trim();
      
      if (achievements && achievements.toLowerCase() !== 'tidak ada' && achievements !== '-') {
        alerts.push({ type: 'emerald', icon: '🌟', text: `Memiliki riwayat prestasi: ${achievements}` });
      }
      if (medicalHistory && medicalHistory.toLowerCase() !== 'tidak ada' && medicalHistory !== '-') {
        alerts.push({ type: 'amber', icon: '🏥', text: `Perhatian riwayat medis: ${medicalHistory}` });
      }
      if (regData.parentStatus === 'CERAI') {
        alerts.push({ type: 'indigo', icon: '⚠️', text: `Status Orang Tua: Cerai (Pastikan kesiapan penanggung jawab pembiayaan dan komunikasi)` });
      }
    }

    return { summaryTitle, summaryColor, summaryText, alerts };
  };

  const execSummary = getExecutiveSummary();

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-64 bg-slate-200 rounded-2xl w-full"></div></div>;
  if (!reg) return <div>Data tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      
      {/* ── Header Card ── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between md:items-end gap-4 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-bl-full -z-10 transition-colors"></div>
        <div className="flex gap-5">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-3xl text-slate-400 border border-slate-200 dark:border-slate-800 shadow-inner transition-colors">
            {(reg.studentName || reg.registrationData?.nickname || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">{reg.studentName || "Belum ada nama"}</h1>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase transition-colors">
                {reg.program}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors">
              <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> {reg.user?.phone}</span>
              <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {reg.user?.email}</span>
            </div>
          </div>
        </div>
        
        <div className="text-left md:text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status Saat Ini</p>
          <div className="inline-flex items-center px-4 py-1.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-bold shadow-sm transition-colors">
            {reg.status.replace(/_/g, " ")}
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm border border-red-200">{error}</div>}
      {success && <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl font-medium text-sm border border-emerald-200 transition-colors">{success}</div>}

      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide transition-colors">
        {["BIODATA", "TES_WAWANCARA", "KELULUSAN", ...((reg.status === 'DAFTAR_ULANG' || reg.status === 'SELESAI') && hasFullPpdbAccess ? ["DAFTAR_ULANG"] : [])].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
              ${activeTab === tab ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-200"}`}>
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="bg-white dark:bg-slate-900 rounded-b-2xl rounded-tr-2xl p-6 border border-slate-200 dark:border-slate-800 border-t-0 shadow-sm min-h-[400px] transition-colors">
        
        {/* BIODATA */}
        {activeTab === "BIODATA" && (
          <div className="space-y-8">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b pb-2 transition-colors">Informasi Pendaftaran</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div><p className="text-xs text-slate-400 uppercase font-bold">Sumber Informasi</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.source || "-"}</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-bold">Alasan Memilih</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.motivation || "-"}</p></div>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">Biodata Pendaftar</h3>
              {hasFullPpdbAccess && (
                <button 
                  onClick={openEditDataModal}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  Edit Data
                </button>
              )}
            </div>
            {!reg.registrationData ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Pendaftar belum mengisi form kelengkapan data biodata.</p>
            ) : (
              <div className="space-y-8">
                {/* Data Santri */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Nama Panggilan</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.nickname || "-"}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">TTL</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.birthPlace || "-"}, {reg.registrationData.birthDate ? new Date(reg.registrationData.birthDate).toLocaleDateString("id-ID") : "-"}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">NIK / NISN</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{hasFullPpdbAccess ? `${reg.registrationData.nik || "-"} / ${reg.registrationData.nisn || "-"}` : <span className="text-slate-400 italic font-normal text-xs mt-1 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>Disembunyikan (Privasi)</span>}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Nomor KK</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{hasFullPpdbAccess ? (reg.registrationData.noKk || "-") : <span className="text-slate-400 italic font-normal text-xs mt-1 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>Privasi</span>}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Asal Sekolah</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.previousSchool || "-"}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Anak Ke / Dari</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.childNumber || "-"} dari {reg.registrationData.siblingCount || "-"} bersaudara</p></div>
                </div>

                {/* Riwayat Tambahan */}
                <div className="grid md:grid-cols-3 gap-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Riwayat Penyakit</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.medicalHistory || "Tidak ada"}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Bakat / Minat</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.talents || "Tidak ada"}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Prestasi</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.achievements || "Tidak ada"}</p></div>
                </div>

                {/* Data Orang Tua */}
                <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl inline-block">
                  <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest mb-1">Status Hubungan Orang Tua</p>
                  <p className="font-bold text-indigo-900">{reg.registrationData.parentStatus === 'BERSAMA' ? 'Bersama (Menikah)' : reg.registrationData.parentStatus === 'CERAI' ? 'Cerai' : 'Belum diisi'}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200 transition-colors">Data Ayah</h4>
                    <div><p className="text-xs text-slate-400 uppercase font-bold">Nama Lengkap</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.fatherName || "-"}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase font-bold">Pendidikan</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.fatherEducation || "-"}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase font-bold">Pekerjaan</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.fatherOccupation || "-"}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase font-bold">Penghasilan</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.fatherIncome || "-"}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase font-bold">Alamat</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.fatherAddress || "-"}</p></div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200 transition-colors">Data Ibu</h4>
                    <div><p className="text-xs text-slate-400 uppercase font-bold">Nama Lengkap</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.motherName || "-"}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase font-bold">Pendidikan</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.motherEducation || "-"}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase font-bold">Pekerjaan</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.motherOccupation || "-"}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase font-bold">Penghasilan</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.motherIncome || "-"}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase font-bold">Alamat</p><p className="font-medium text-slate-800 dark:text-slate-100 transition-colors">{reg.registrationData.motherAddress || "-"}</p></div>
                  </div>
                </div>

                {/* Data Saudara */}
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b pb-2 pt-4 transition-colors">Data Saudara</h3>
                {(!reg.registrationData.siblings || reg.registrationData.siblings.length === 0) ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Tidak ada data saudara yang diisi.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 transition-colors">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Nama</th>
                          <th className="px-4 py-2 font-semibold">Pendidikan</th>
                          <th className="px-4 py-2 font-semibold">Pekerjaan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reg.registrationData.siblings.map((sib, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800 transition-colors">
                            <td className="px-4 py-3">{sib.name}</td>
                            <td className="px-4 py-3">{sib.education || '-'}</td>
                            <td className="px-4 py-3">{sib.occupation || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DOKUMEN */}
        {activeTab === "DOKUMEN" && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">Verifikasi Dokumen Kelengkapan</h3>
            {(!reg.documents || reg.documents.length === 0) ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Belum ada dokumen yang diunggah.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {reg.documents.map(doc => (
                  <div key={doc.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex flex-col gap-3 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm transition-colors">{doc.type}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1
                          ${doc.status==='DITERIMA' ? 'bg-emerald-100 text-emerald-700' : 
                            doc.status==='DITOLAK' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {doc.status}
                        </span>
                      </div>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 hover:text-primary transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </a>
                    </div>
                    {doc.status === 'PENDING' && hasFullPpdbAccess && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleDocumentAction(doc.id, 'DITERIMA')} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition">Terima</button>
                        <button onClick={() => handleDocumentAction(doc.id, 'DITOLAK', 'Dokumen tidak sesuai standar')} className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition">Tolak / Revisi</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TES WAWANCARA */}
        {activeTab === "TES_WAWANCARA" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* KOLOM KIRI: JADWAL TES */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">Pengaturan Jadwal Tes</h3>
                  {/* Tombol Edit Jadwal dihapus sesuai permintaan agar admin hanya bisa menugaskan penguji */}
                </div>
                
                {!reg.testMethod && !hasFullPpdbAccess ? (
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm w-full transition-colors">
                    Jadwal tes belum diatur oleh Admin Pusat.
                  </div>
                ) : !reg.testMethod || isEditingScheduleAdmin ? (
                  <form onSubmit={handleUpdateSchedule} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 w-full transition-colors">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 transition-colors">Metode Tes</label>
                      <select value={testMethod} onChange={(e) => setTestMethod(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors">
                        <option value="OFFLINE">Offline (Hadir ke MQ)</option>
                        <option value="ONLINE">Online (CBT & Zoom)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 transition-colors">Jadwal Ujian Tulis (CBT)</label>
                        <input type="datetime-local" value={testDate} onChange={e => setTestDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 transition-colors">Jadwal Wawancara</label>
                        <input type="datetime-local" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors"/>
                      </div>
                    </div>
                    {hasFullPpdbAccess && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 transition-colors">Penguji Wawancara</label>
                        <select value={interviewerId} onChange={(e) => setInterviewerId(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors">
                          <option value="">-- Pilih Penguji --</option>
                          {pengujiList.map(p => (
                            <option key={p.id} value={p.id}>{p.namaLengkap} ({p.email})</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition">
                        Simpan Jadwal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 w-full transition-colors">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 transition-colors">Metode Ujian</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 transition-colors">{reg.testMethod}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 transition-colors">Jadwal CBT</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 transition-colors">{reg.testDate ? new Date(reg.testDate).toLocaleString("id-ID") : "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 transition-colors">Jadwal Wawancara</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 transition-colors">{reg.interviewDate ? new Date(reg.interviewDate).toLocaleString("id-ID") : "-"}</p>
                      </div>
                      {hasFullPpdbAccess ? (
                        <div className="col-span-2 mt-2 pt-3 border-t border-slate-200 dark:border-slate-800 transition-colors">
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 transition-colors">Penugasan Penguji Wawancara</label>
                          <div className="flex gap-2">
                            <select 
                              value={interviewerId} 
                              onChange={(e) => setInterviewerId(e.target.value)} 
                              className="flex-1 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-emerald-500 transition-colors"
                            >
                              <option value="">-- Belum Ditugaskan --</option>
                              {pengujiList.map(p => (
                                <option key={p.id} value={p.id}>{p.namaLengkap} ({p.email})</option>
                              ))}
                            </select>
                            <button 
                              onClick={handleUpdateSchedule}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition shadow-sm"
                            >
                              Simpan Penugasan
                            </button>
                          </div>
                        </div>
                      ) : reg.interviewer ? (
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 transition-colors">Ditugaskan Kepada</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-100 transition-colors">{reg.interviewer.namaLengkap}</p>
                        </div>
                      ) : null}
                    </div>
                    {reg.testMethod === 'OFFLINE' && (
                      <div className="mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 transition-colors">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 transition-colors">Info Check-in Offline</p>
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-800 text-center min-w-[80px] transition-colors">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">KODE</p>
                            <p className="font-black text-lg tracking-widest text-slate-700 dark:text-slate-200 transition-colors">{reg.offlineCode || "-"}</p>
                          </div>
                          <div>
                            <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded uppercase ${
                              reg.attendance === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                              reg.attendance === 'NO_SHOW' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {reg.attendance === 'PRESENT' ? 'Hadir' : reg.attendance === 'NO_SHOW' ? 'Tidak Hadir' : 'Menunggu Check-in'}
                            </span>
                            {reg.attendance === 'PRESENT' && reg.attendanceTime && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Hadir pada: {new Date(reg.attendanceTime).toLocaleString('id-ID')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KOLOM KANAN: HASIL CBT */}
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4 transition-colors">Hasil Ujian CBT</h3>
                {(!reg.examAttempts || reg.examAttempts.length === 0) ? (
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm w-full transition-colors">
                    Pendaftar belum menyelesaikan Ujian CBT.
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden w-full max-h-[600px] overflow-y-auto transition-colors">
                    {reg.examAttempts.map((attempt, idx) => (
                      <div key={attempt.id || idx} className="border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                        <div className="p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 transition-colors">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{attempt.exam?.title || "Ujian CBT"}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Nilai Passing Grade: {attempt.exam?.passingGrade || 70}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-2xl font-black ${attempt.score >= (attempt.exam?.passingGrade || 70) ? 'text-emerald-600' : 'text-red-600'}`}>
                              {attempt.score}
                            </span>
                          </div>
                        </div>
                        
                        {attempt.answers && attempt.answers.length > 0 && (
                          <div className="p-5 space-y-6 bg-white dark:bg-slate-900 transition-colors">
                            {attempt.answers.map((ans, i) => {
                              const optionsArr = typeof ans.question?.options === 'string' 
                                ? JSON.parse(ans.question.options) 
                                : ans.question?.options;
                                
                              return (
                                <div key={ans.id || i} className="pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 transition-colors">
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 leading-relaxed transition-colors">
                                    <span className="text-slate-400 mr-1">{i + 1}.</span> {ans.question?.text || "Pertanyaan tidak ditemukan"}
                                  </p>
                                  {optionsArr ? (
                                    <div className="space-y-2 ml-5">
                                      {optionsArr.map((opt, optIdx) => {
                                        const isCorrect = optIdx === ans.question.correctOption;
                                        const isSelected = optIdx === ans.selectedOption;
                                        
                                        let btnClass = "border-slate-100 bg-white text-slate-600";
                                        if (isCorrect) btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-500/20";
                                        else if (isSelected && !isCorrect) btnClass = "border-red-300 bg-red-50 text-red-800 line-through opacity-70";
                                        
                                        return (
                                          <div key={optIdx} className={`text-xs p-2.5 rounded-lg border flex items-start gap-2 ${btnClass}`}>
                                            <span className="font-bold opacity-50 shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                                            <span className="flex-1">{opt}</span>
                                            {isCorrect && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">✓ Kunci</span>}
                                            {isSelected && !isCorrect && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">✗ Dijawab</span>}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">Opsi tidak tersedia</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4 transition-colors">Hasil Wawancara Wali (Online)</h3>
              {!reg.parentInterview ? (
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm max-w-xl transition-colors">
                  Pendaftar belum mengisi Form Wawancara Wali.
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[280px] overflow-y-auto custom-scrollbar transition-colors">
                  {reg.parentInterview.answers ? (
                    // New dynamic JSON answers format
                    Object.entries(reg.parentInterview.answers).map(([key, value], idx) => {
                      const questionObj = interviewQuestions.find(q => q.id === key);
                      const questionText = questionObj ? questionObj.questionText : `Pertanyaan Tambahan (${idx + 1})`;
                      return (
                        <div key={key} className="pb-4 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0 transition-colors">
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 transition-colors">{questionText}</p>
                          <p className="text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">{value || "-"}</p>
                        </div>
                      );
                    })
                  ) : (
                    // Old static answer1..15 fallback
                    Object.keys(reg.parentInterview).filter(k => k.startsWith('answer')).map((key, idx) => (
                      <div key={key} className="pb-4 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0 transition-colors">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 transition-colors">Pertanyaan {idx + 1}</p>
                        <p className="text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">{reg.parentInterview[key]}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* FORM PENILAIAN PEWAWANCARA ATAU RINGKASAN */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 transition-colors">
              {hasWawancaraAccess ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">Penilaian Penguji Wawancara</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Isi hasil evaluasi calon santri dan orang tua.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Evaluasi Santri */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-colors">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    Evaluasi Calon Santri
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 transition-colors">Rekomendasi</label>
                      <select value={evalSantriRecom} onChange={(e) => setEvalSantriRecom(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold transition-colors">
                        <option value="">-- Pilih Rekomendasi --</option>
                        <option value="DIREKOMENDASIKAN">Direkomendasikan</option>
                        <option value="DIPERTIMBANGKAN">Dipertimbangkan</option>
                        <option value="TIDAK_DIREKOMENDASIKAN">Tidak Direkomendasikan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 transition-colors">Catatan Evaluasi</label>
                      <textarea value={evalSantriNotes} onChange={(e) => setEvalSantriNotes(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm min-h-[100px] transition-colors" placeholder="Kelebihan, kelemahan, dll..."></textarea>
                    </div>
                    {renderRubricForm('SANTRI')}
                  </div>
                </div>

                {/* Evaluasi Orang Tua */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-colors">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                    Evaluasi Orang Tua (Wali)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 transition-colors">Rekomendasi</label>
                      <select value={evalParentRecom} onChange={(e) => setEvalParentRecom(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold transition-colors">
                        <option value="">-- Pilih Rekomendasi --</option>
                        <option value="DIREKOMENDASIKAN">Direkomendasikan</option>
                        <option value="DIPERTIMBANGKAN">Dipertimbangkan</option>
                        <option value="TIDAK_DIREKOMENDASIKAN">Tidak Direkomendasikan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 transition-colors">Catatan Evaluasi</label>
                      <textarea value={evalParentNotes} onChange={(e) => setEvalParentNotes(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm min-h-[100px] transition-colors" placeholder="Kesiapan bayar, kepedulian, dll..."></textarea>
                    </div>
                    {renderRubricForm('WALI')}
                  </div>
                </div>
              </div>
              
                  <div className="flex justify-end">
                    <button 
                      onClick={saveEvaluation}
                      disabled={evalSaving}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                    >
                      {evalSaving ? "Menyimpan..." : "Simpan Penilaian Wawancara"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {reg.interviewerEvaluation ? (
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
                      <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4 uppercase text-sm tracking-wider flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Hasil Penilaian Penguji
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Calon Santri */}
                        <div className={`p-4 rounded-xl border ${
                          reg.interviewerEvaluation.santriRecommendation === 'DIREKOMENDASIKAN' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200' :
                          reg.interviewerEvaluation.santriRecommendation === 'TIDAK_DIREKOMENDASIKAN' ? 'bg-red-50 border-red-200' :
                          reg.interviewerEvaluation.santriRecommendation === 'DIPERTIMBANGKAN' ? 'bg-amber-50 border-amber-200' :
                          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        } transition-colors`}>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 transition-colors">Calon Santri ({reg.interviewerEvaluation.santriInterviewer || 'Tanpa Nama'})</p>
                          <p className={`font-black text-lg mb-2 ${
                            reg.interviewerEvaluation.santriRecommendation === 'DIREKOMENDASIKAN' ? 'text-emerald-700' :
                            reg.interviewerEvaluation.santriRecommendation === 'TIDAK_DIREKOMENDASIKAN' ? 'text-red-700' :
                            reg.interviewerEvaluation.santriRecommendation === 'DIPERTIMBANGKAN' ? 'text-amber-700' :
                            'text-slate-700 dark:text-slate-200'
                          } transition-colors`}>
                            {reg.interviewerEvaluation.santriRecommendation ? reg.interviewerEvaluation.santriRecommendation.replace(/_/g, ' ') : 'BELUM DINILAI'}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/50 p-2 rounded border border-white/20 italic transition-colors">
                            "{reg.interviewerEvaluation.santriNotes || 'Tidak ada catatan'}"
                          </p>
                        </div>

                        {/* Orang Tua */}
                        <div className={`p-4 rounded-xl border ${
                          reg.interviewerEvaluation.parentRecommendation === 'DIREKOMENDASIKAN' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200' :
                          reg.interviewerEvaluation.parentRecommendation === 'TIDAK_DIREKOMENDASIKAN' ? 'bg-red-50 border-red-200' :
                          reg.interviewerEvaluation.parentRecommendation === 'DIPERTIMBANGKAN' ? 'bg-amber-50 border-amber-200' :
                          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        } transition-colors`}>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 transition-colors">Orang Tua ({reg.interviewerEvaluation.parentInterviewer || 'Tanpa Nama'})</p>
                          <p className={`font-black text-lg mb-2 ${
                            reg.interviewerEvaluation.parentRecommendation === 'DIREKOMENDASIKAN' ? 'text-emerald-700' :
                            reg.interviewerEvaluation.parentRecommendation === 'TIDAK_DIREKOMENDASIKAN' ? 'text-red-700' :
                            reg.interviewerEvaluation.parentRecommendation === 'DIPERTIMBANGKAN' ? 'bg-amber-50 border-amber-200' :
                            'text-slate-700 dark:text-slate-200'
                          } transition-colors`}>
                            {reg.interviewerEvaluation.parentRecommendation ? reg.interviewerEvaluation.parentRecommendation.replace(/_/g, ' ') : 'BELUM DINILAI'}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/50 p-2 rounded border border-white/20 italic transition-colors">
                            "{reg.interviewerEvaluation.parentNotes || 'Tidak ada catatan'}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 transition-colors">
                      <p className="text-sm font-semibold">Belum ada penilaian dari tim penguji wawancara.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* KELULUSAN */}
        {activeTab === "KELULUSAN" && (
          <div className="grid lg:grid-cols-2 gap-8 py-8">
            {/* LEFT COLUMN: KEPUTUSAN & SUMMARY */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                {(reg.status === 'DAFTAR_ULANG' || reg.status === 'SELESAI' || reg.status === 'DITOLAK') ? (
                  <div className={`p-6 rounded-2xl border ${reg.status === 'DITOLAK' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200'} transition-colors`}>
                    <h3 className={`font-black text-3xl mb-2 ${reg.status === 'DITOLAK' ? 'text-red-600' : 'text-emerald-600'}`}>
                      KEPUTUSAN AKHIR SPMB: {reg.status === 'DITOLAK' ? 'TIDAK LULUS' : 'LULUS'}
                    </h3>
                    <p className={`text-sm font-semibold ${reg.status === 'DITOLAK' ? 'text-red-700/70' : 'text-emerald-700/70'}`}>
                      Status kandidat sudah final dan dapat dilihat di dashboard wali santri.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4 border border-blue-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h3 className="font-black text-2xl text-slate-800 dark:text-slate-100 transition-colors">Keputusan Akhir SPMB</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed transition-colors">
                      Keputusan ini akan mengubah status kandidat dan akan ditampilkan secara langsung di dashboard wali santri. Pastikan seluruh proses tes dan wawancara telah selesai dinilai.
                    </p>
                  </>
                )}
              </div>

              {/* EXECUTIVE SUMMARY */}
              {execSummary && (
                <div className={`p-6 rounded-2xl border bg-${execSummary.summaryColor}-50 border-${execSummary.summaryColor}-200`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-${execSummary.summaryColor}-100 text-${execSummary.summaryColor}-600`}>
                      {execSummary.summaryColor === 'emerald' && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {execSummary.summaryColor === 'amber' && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {execSummary.summaryColor === 'red' && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {execSummary.summaryColor === 'blue' && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {execSummary.summaryColor === 'indigo' && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                    </div>
                    <div>
                      <h4 className={`font-black text-lg text-${execSummary.summaryColor}-700 mb-1`}>{execSummary.summaryTitle}</h4>
                      <p className={`text-sm text-${execSummary.summaryColor}-600 leading-relaxed font-medium`}>{execSummary.summaryText}</p>
                      
                      {execSummary.alerts && execSummary.alerts.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {execSummary.alerts.map((alert, idx) => (
                            <div key={idx} className={`flex items-start gap-2 p-3 rounded-xl bg-${alert.type}-100/50 border border-${alert.type}-200`}>
                              <span className="text-lg leading-none">{alert.icon}</span>
                              <p className={`text-xs font-semibold text-${alert.type}-700 leading-snug`}>{alert.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: EVALUATION & ACTIONS */}
            <div className="space-y-8">
              {/* RINGKASAN EVALUASI */}
              {reg.interviewerEvaluation && (
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4 uppercase text-sm tracking-wider flex items-center gap-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Ringkasan Penilaian Penguji
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Calon Santri */}
                    <div className={`p-4 rounded-xl border ${
                      reg.interviewerEvaluation.santriRecommendation === 'DIREKOMENDASIKAN' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200' :
                      reg.interviewerEvaluation.santriRecommendation === 'TIDAK_DIREKOMENDASIKAN' ? 'bg-red-50 border-red-200' :
                      reg.interviewerEvaluation.santriRecommendation === 'DIPERTIMBANGKAN' ? 'bg-amber-50 border-amber-200' :
                      'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    } transition-colors`}>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 transition-colors">Calon Santri ({reg.interviewerEvaluation.santriInterviewer || 'Tanpa Nama'})</p>
                      <p className={`font-black text-lg mb-2 ${
                        reg.interviewerEvaluation.santriRecommendation === 'DIREKOMENDASIKAN' ? 'text-emerald-700' :
                        reg.interviewerEvaluation.santriRecommendation === 'TIDAK_DIREKOMENDASIKAN' ? 'text-red-700' :
                        reg.interviewerEvaluation.santriRecommendation === 'DIPERTIMBANGKAN' ? 'text-amber-700' :
                        'text-slate-700 dark:text-slate-200'
                      } transition-colors`}>
                        {reg.interviewerEvaluation.santriRecommendation ? reg.interviewerEvaluation.santriRecommendation.replace(/_/g, ' ') : 'BELUM DINILAI'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/50 p-2 rounded border border-white/20 italic transition-colors">
                        "{reg.interviewerEvaluation.santriNotes || 'Tidak ada catatan'}"
                      </p>
                    </div>

                    {/* Orang Tua */}
                    <div className={`p-4 rounded-xl border ${
                      reg.interviewerEvaluation.parentRecommendation === 'DIREKOMENDASIKAN' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200' :
                      reg.interviewerEvaluation.parentRecommendation === 'TIDAK_DIREKOMENDASIKAN' ? 'bg-red-50 border-red-200' :
                      reg.interviewerEvaluation.parentRecommendation === 'DIPERTIMBANGKAN' ? 'bg-amber-50 border-amber-200' :
                      'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    } transition-colors`}>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 transition-colors">Orang Tua ({reg.interviewerEvaluation.parentInterviewer || 'Tanpa Nama'})</p>
                      <p className={`font-black text-lg mb-2 ${
                        reg.interviewerEvaluation.parentRecommendation === 'DIREKOMENDASIKAN' ? 'text-emerald-700' :
                        reg.interviewerEvaluation.parentRecommendation === 'TIDAK_DIREKOMENDASIKAN' ? 'text-red-700' :
                        reg.interviewerEvaluation.parentRecommendation === 'DIPERTIMBANGKAN' ? 'text-amber-700' :
                        'text-slate-700 dark:text-slate-200'
                      } transition-colors`}>
                        {reg.interviewerEvaluation.parentRecommendation ? reg.interviewerEvaluation.parentRecommendation.replace(/_/g, ' ') : 'BELUM DINILAI'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/50 p-2 rounded border border-white/20 italic transition-colors">
                        "{reg.interviewerEvaluation.parentNotes || 'Tidak ada catatan'}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {hasFullPpdbAccess ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* LULUS */}
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition">
                    <h4 className="font-black text-emerald-700 text-lg mb-2">LULUS</h4>
                    <p className="text-xs text-emerald-600 mb-6">Kandidat memenuhi syarat. Status akan diubah menjadi <strong className="font-black">DAFTAR_ULANG</strong>.</p>
                    <button 
                      onClick={() => handleKelulusanClick("LULUS")}
                      disabled={reg.status === 'DAFTAR_ULANG' || reg.status === 'SELESAI'}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition disabled:opacity-50"
                    >
                      Nyatakan Lulus
                    </button>
                  </div>

                  {/* TIDAK LULUS */}
                  <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition">
                    <h4 className="font-black text-red-700 text-lg mb-2">TIDAK LULUS</h4>
                    <p className="text-xs text-red-600 mb-6">Kandidat tidak memenuhi syarat. Status akan diubah menjadi <strong className="font-black">DITOLAK</strong>.</p>
                    <button 
                      onClick={() => handleKelulusanClick("TIDAK_LULUS")}
                      disabled={reg.status === 'DITOLAK'}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition disabled:opacity-50"
                    >
                      Tolak Pendaftaran
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 transition-colors">
                  <p className="text-sm font-semibold">Anda tidak memiliki hak akses (SPMB) untuk melakukan eksekusi kelulusan.</p>
                </div>
              )}

              {/* JADI SANTRI */}
              {hasFullPpdbAccess && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
                  <h4 className="font-black text-white text-lg mb-2 relative z-10">TETAPKAN SEBAGAI SANTRI AKTIF</h4>
                  <p className="text-xs text-slate-400 mb-6 relative z-10 max-w-md">
                    Klik tombol ini <span className="font-bold text-white">HANYA JIKA</span> kandidat telah menyelesaikan Daftar Ulang. Sistem akan membuatkan data Santri Aktif dan mengizinkan wali login ke portal penuh.
                  </p>
                  <button 
                    onClick={() => handleKelulusanClick("JADI_SANTRI")}
                    disabled={reg.status !== 'DAFTAR_ULANG'}
                    className="w-full max-w-xs py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl transition disabled:opacity-50 shadow-lg shadow-amber-500/20 relative z-10"
                  >
                    Tetapkan & Generate Akun Wali
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DAFTAR ULANG */}
        {activeTab === "DAFTAR_ULANG" && (
          <div className="space-y-8">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b pb-2 transition-colors">Status Daftar Ulang</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Box Tagihan Keuangan */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
                <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-5 py-3 transition-colors">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 transition-colors">Tagihan Keuangan (Uang Masuk)</h4>
                </div>
                <div className="p-5 space-y-4">
                  {(() => {
                    const nominalTagihan = reg.uangMasukNominal ? Number(reg.uangMasukNominal) : 15000000;
                    const lunasPayments = (reg.pembayaran || []).filter(p => p.status === 'LUNAS');
                    const totalDibayar = lunasPayments.reduce((sum, p) => sum + Number(p.totalNominal), 0);
                    const isLunas = totalDibayar >= nominalTagihan;
                    
                    return (
                      <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tenggat Waktu</p>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors">
                                {reg.uangMasukDeadline ? new Date(reg.uangMasukDeadline).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tagihan Awal</p>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-black text-emerald-600">
                                  Rp {nominalTagihan.toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SPP Bulanan</p>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-black text-blue-600">
                                  Rp {reg.sppNominal ? Number(reg.sppNominal).toLocaleString('id-ID') : '1.900.000'}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 items-start">
                              <button onClick={() => setDeadlineModalOpen(true)} className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-2 py-1 rounded font-bold transition">
                                Atur Tenggat
                              </button>
                              {reg.status !== 'SELESAI' && (
                                <button onClick={() => { 
                                  setNewNominal(nominalTagihan.toString()); 
                                  setNewSppNominal(reg.sppNominal ? reg.sppNominal.toString() : "1900000");
                                  setUbahNominalModalOpen(true); 
                                }} className="text-[10px] text-blue-600 hover:underline">
                                  (Ubah Nominal)
                                </button>
                              )}
                            </div>
                      </div>
                    );
                  })()}
                  
                  {reg.uangMasukWaiverFileUrl && (
                    <a href={reg.uangMasukWaiverFileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline mt-1 inline-block">
                      Lihat Surat Keringanan
                    </a>
                  )}

                  {/* Manual Payment Button */}
                  {hasFullPpdbAccess && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors">
                      <button onClick={() => setManualPaymentModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Catat Pembayaran Manual (Kasir)
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 dark:text-slate-400 italic transition-colors">Catatan: Terintegrasi dengan Midtrans Payment Gateway. Wali santri juga dapat membayar mandiri lewat dashboard mereka.</p>
                </div>
              </div>

              {/* Box Kelengkapan Berkas */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
                <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex justify-between items-center transition-colors">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 transition-colors">Kelengkapan Berkas</h4>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded transition-colors">
                    {reg.documents?.filter(d => d.status === 'DITERIMA').length || 0} / 8 Berkas
                  </span>
                </div>
                <div className="p-0">
                  <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {[
                      {type: 'KK', label: 'Kartu Keluarga'},
                      {type: 'KTP_AYAH', label: 'KTP Ayah'},
                      {type: 'KTP_IBU', label: 'KTP Ibu'},
                      {type: 'AKTA', label: 'Akta Kelahiran'},
                      {type: 'IJAZAH', label: 'Ijazah / SKL'},
                      {type: 'FOTO', label: 'Pas Foto'},
                      {type: 'SURAT_SEHAT', label: 'Surat Keterangan Sehat'},
                      {type: 'SKKB', label: 'SKKB dari Sekolah Asal'}
                    ].map(reqDoc => {
                      const uploaded = reg.documents?.find(d => d.type === reqDoc.type);
                      return (
                        <li key={reqDoc.type} className="px-5 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:bg-slate-50 dark:bg-slate-950 border-b border-slate-50 last:border-0 transition-colors">
                          <div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block transition-colors">{reqDoc.label}</span>
                            {uploaded ? (
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  uploaded.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700' :
                                  uploaded.status === 'DITOLAK' || uploaded.status === 'REVISI' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {uploaded.status}
                                </span>
                                {uploaded.notes && <span className="text-[10px] text-red-500 italic">"{uploaded.notes}"</span>}
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mt-1 inline-block transition-colors">BELUM UPLOAD</span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {uploaded && (
                              <>
                                <a href={uploaded.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded text-xs font-bold transition">
                                  Lihat
                                </a>
                                {uploaded.status !== 'DITERIMA' && hasFullPpdbAccess && (
                                  <button onClick={() => handleDocumentAction(uploaded.id, 'DITERIMA')} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 rounded text-xs font-bold transition">
                                    Terima
                                  </button>
                                )}
                                {(uploaded.status === 'PENDING' || uploaded.status === 'DITERIMA') && hasFullPpdbAccess && (
                                  <button onClick={() => handleDocumentAction(uploaded.id, 'REVISI', prompt("Alasan revisi/penolakan:"))} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 rounded text-xs font-bold transition">
                                    Revisi
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VALIDASI BAYAR REGISTRASI MANUAL */}
        {hasFullPpdbAccess && reg.status === 'PEMBAYARAN_REGISTRASI' && (
          <div className="mt-8 bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-amber-800 mb-1">Validasi Pembayaran Registrasi (Bypass)</h3>
              <p className="text-xs text-amber-700">Jika orang tua telah transfer secara manual (misal via WhatsApp) tanpa melalui Midtrans, Anda bisa meluluskan tahapan ini secara paksa.</p>
            </div>
            <button 
              onClick={handleManualRegPayment}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/20 transition-all whitespace-nowrap flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Terima Pembayaran Manual
            </button>
          </div>
        )}

        {/* PENGUNDURAN DIRI / UBAH STATUS MANUAL */}
        {hasFullPpdbAccess && !['DITOLAK', 'SELESAI'].includes(reg.status) && (
          <div className="mt-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors">Ubah Status / Pengunduran Diri</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 transition-colors">Gunakan aksi ini jika pendaftar memutuskan untuk mundur, atau jika Anda perlu mengembalikan status pendaftar (undo) ke tahap aktif.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={dropoutAction} 
                onChange={(e) => setDropoutAction(e.target.value)} 
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-slate-500 transition-colors"
              >
                <option value="">-- Pilih Status Baru --</option>
                <optgroup label="Pengunduran Diri (Batal)">
                  <option value="TIDAK_LANJUT_BAYAR_REGISTRASI">Batal - Bayar Registrasi</option>
                  <option value="TIDAK_LANJUT_TES">Batal - Tes & Wawancara</option>
                  <option value="TIDAK_LANJUT_DAFTAR_ULANG">Batal - Daftar Ulang</option>
                  <option value="TIDAK_LANJUT_JADI_SANTRI">Batal - Jadi Santri</option>
                  <option value="NO_LEAD_DOUBLE">Batal - No Lead / Double</option>
                </optgroup>
                <optgroup label="Kembalikan ke Tahap Aktif (Undo)">
                  <option value="PENDAFTARAN">Tahap: Pendaftaran</option>
                  <option value="PEMBAYARAN_REGISTRASI">Tahap: Pembayaran Registrasi</option>
                  <option value="KELENGKAPAN_DATA">Tahap: Kelengkapan Data</option>
                  <option value="TES_WAWANCARA">Tahap: Tes & Wawancara</option>
                  <option value="PENGUMUMAN">Tahap: Pengumuman</option>
                  <option value="DAFTAR_ULANG">Tahap: Daftar Ulang</option>
                </optgroup>
              </select>
              <button 
                onClick={() => {
                  if(!dropoutAction) return alert('Pilih status baru terlebih dahulu');
                  handleKelulusanClick(dropoutAction);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-sm transition"
              >
                Proses Perubahan
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal Kelulusan */}
      {kelulusanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-100 transition-transform">
            <div className={`p-6 border-b flex justify-between items-center ${
              kelulusanAction === 'LULUS' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 text-emerald-800' :
              (kelulusanAction === 'TIDAK_LULUS' || (kelulusanAction?.startsWith('TIDAK_LANJUT_') || kelulusanAction === 'NO_LEAD_DOUBLE')) ? 'bg-red-50 border-red-100 text-red-800' :
              ['PENDAFTARAN', 'PEMBAYARAN_REGISTRASI', 'KELENGKAPAN_DATA', 'TES_WAWANCARA', 'PENGUMUMAN', 'DAFTAR_ULANG'].includes(kelulusanAction) ? 'bg-blue-50 border-blue-100 text-blue-800' :
              'bg-amber-50 border-amber-100 text-amber-800'
            } transition-colors`}>
              <h3 className="font-bold text-lg flex items-center gap-2">
                {kelulusanAction === 'LULUS' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                )}
                {(kelulusanAction === 'TIDAK_LULUS' || (kelulusanAction?.startsWith('TIDAK_LANJUT_') || kelulusanAction === 'NO_LEAD_DOUBLE')) && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                )}
                {['PENDAFTARAN', 'PEMBAYARAN_REGISTRASI', 'KELENGKAPAN_DATA', 'TES_WAWANCARA', 'PENGUMUMAN', 'DAFTAR_ULANG'].includes(kelulusanAction) && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                )}
                {kelulusanAction === 'JADI_SANTRI' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" /></svg>
                )}
                Konfirmasi Tindakan
              </h3>
              <button onClick={() => setKelulusanModalOpen(false)} className="text-current opacity-50 hover:opacity-100 transition-opacity bg-white dark:bg-slate-900/50 p-1.5 rounded-lg hover:bg-white dark:bg-slate-900/80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300 transition-colors">
                Apakah Anda yakin ingin memproses pendaftar <strong className="text-slate-800 dark:text-slate-100 transition-colors">{reg?.studentName}</strong> menjadi 
                <span className={`font-black ml-1 px-2 py-0.5 rounded text-xs ${
                  kelulusanAction === 'LULUS' ? 'bg-emerald-100 text-emerald-700' : 
                  (kelulusanAction === 'TIDAK_LULUS' || (kelulusanAction?.startsWith('TIDAK_LANJUT_') || kelulusanAction === 'NO_LEAD_DOUBLE')) ? 'bg-red-100 text-red-700' : 
                  ['PENDAFTARAN', 'PEMBAYARAN_REGISTRASI', 'KELENGKAPAN_DATA', 'TES_WAWANCARA', 'PENGUMUMAN', 'DAFTAR_ULANG'].includes(kelulusanAction) ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {kelulusanAction === 'JADI_SANTRI' ? 'SANTRI AKTIF' : kelulusanAction?.replace(/_/g, ' ')}
                </span>?
              </p>
              
              {kelulusanAction === 'LULUS' && (
                  <div className="p-6 border-b flex flex-col gap-4">
                    {kelulusanPeriodeNama && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between text-blue-800 text-sm">
                        <span className="font-semibold">Berdasarkan Tgl Daftar:</span>
                        <span className="font-black bg-white dark:bg-slate-900 px-2 py-1 rounded transition-colors">{kelulusanPeriodeNama}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-emerald-800 mb-2">Tentukan Nominal Uang Masuk / Pangkal (Rp)</label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 transition-colors">Nominal awal otomatis ditarik dari pengaturan Gelombang pendaftaran. Anda dapat mengubah nominal ini secara khusus untuk pendaftar ini sebelum menyatakannya lulus.</p>
                      <input 
                        type="number" 
                        value={kelulusanNominal} 
                        onChange={(e) => setKelulusanNominal(e.target.value)} 
                        className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-emerald-50 dark:bg-emerald-500/10/30 text-emerald-900 font-black text-lg transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-800 mb-2">Tentukan Nominal SPP Bulanan (Rp)</label>
                      <input 
                        type="number" 
                        value={sppNominal} 
                        onChange={(e) => setSppNominal(e.target.value)} 
                        className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-blue-50/30 text-blue-900 font-black text-lg transition-all"
                      />
                    </div>
                  </div>
              )}
              {kelulusanAction === 'TIDAK_LULUS' && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-sm text-red-600 shadow-sm">
                  <p>Tindakan ini akan mengakhiri proses pendaftaran kandidat ini dan mengubah statusnya menjadi <strong>DITOLAK</strong> secara permanen.</p>
                </div>
              )}
              {(kelulusanAction?.startsWith('TIDAK_LANJUT_') || kelulusanAction === 'NO_LEAD_DOUBLE') && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-sm text-red-600 shadow-sm">
                  <p>Tindakan ini akan menandai bahwa pendaftar telah <strong>MENGUNDURKAN DIRI / BATAL</strong> pada tahap ini. Status pendaftaran akan diakhiri secara permanen.</p>
                </div>
              )}
              {['PENDAFTARAN', 'PEMBAYARAN_REGISTRASI', 'KELENGKAPAN_DATA', 'TES_WAWANCARA', 'PENGUMUMAN', 'DAFTAR_ULANG'].includes(kelulusanAction) && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-sm text-blue-700 shadow-sm">
                  <p>Tindakan ini akan mengembalikan status pendaftar ke tahap aktif: <strong>{kelulusanAction.replace(/_/g, ' ')}</strong>. Pastikan ini adalah tindakan yang disengaja.</p>
                </div>
              )}
              {kelulusanAction === 'JADI_SANTRI' && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm text-amber-700 shadow-sm">
                  <p>Sistem akan memindahkan data pendaftar ini ke pangkalan data <strong>Santri Aktif</strong> dan membuatkan akun portal wali secara permanen. Pastikan administrasi Daftar Ulang telah tuntas.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3 transition-colors">
              <button 
                onClick={() => setKelulusanModalOpen(false)}
                disabled={kelulusanLoading}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:bg-slate-800 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={confirmKelulusan}
                disabled={kelulusanLoading}
                className={`px-5 py-2.5 rounded-xl font-bold text-white transition shadow-md disabled:opacity-50 flex items-center gap-2 ${
                  kelulusanAction === 'LULUS' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' :
                  (kelulusanAction === 'TIDAK_LULUS' || (kelulusanAction?.startsWith('TIDAK_LANJUT_') || kelulusanAction === 'NO_LEAD_DOUBLE')) ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' :
                  ['PENDAFTARAN', 'PEMBAYARAN_REGISTRASI', 'KELENGKAPAN_DATA', 'TES_WAWANCARA', 'PENGUMUMAN', 'DAFTAR_ULANG'].includes(kelulusanAction) ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30' :
                  'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                }`}
              >
                {kelulusanLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Konfirmasi {kelulusanAction === 'JADI_SANTRI' ? 'Penetapan' : (kelulusanAction?.startsWith('TIDAK_LANJUT_') || kelulusanAction === 'NO_LEAD_DOUBLE') ? 'Batal' : kelulusanAction?.replace(/_/g, ' ')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Deadline Uang Masuk */}
      {deadlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-100 transition-transform">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">Sesuaikan Deadline</h3>
              <button onClick={() => setDeadlineModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Pilih Tanggal Baru</label>
                <input 
                  type="date" 
                  value={newDeadline} 
                  onChange={(e) => setNewDeadline(e.target.value)} 
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Lampiran Surat Keringanan</label>
                <input 
                  type="text" 
                  value={waiverFileUrl} 
                  onChange={(e) => setWaiverFileUrl(e.target.value)} 
                  placeholder="URL File Surat (contoh: https://drive.google...)"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-colors"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Sertakan URL dokumen bukti keputusan/disposisi keringanan waktu.</p>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 dark:bg-slate-950 flex justify-end gap-3 transition-colors">
              <button onClick={() => setDeadlineModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 rounded-lg transition">Batal</button>
              <button onClick={handleUpdateDeadline} disabled={isUpdatingDeadline || !newDeadline} className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-50">
                {isUpdatingDeadline ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pembayaran Manual */}
      {manualPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-100 transition-transform">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-50 border-indigo-100 text-indigo-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Catat Pembayaran Manual
              </h3>
              <button onClick={() => setManualPaymentModalOpen(false)} className="text-indigo-400 hover:text-indigo-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Nominal (Rp)</label>
                <input 
                  type="number" 
                  value={manualNominal} 
                  onChange={(e) => setManualNominal(e.target.value)} 
                  placeholder="Contoh: 5000000"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Metode Pembayaran</label>
                <select 
                  value={manualMetode} 
                  onChange={(e) => setManualMetode(e.target.value)} 
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                >
                  <option value="TUNAI">Tunai (Kasir)</option>
                  <option value="TRANSFER_BANK">Transfer Bank Manual</option>
                </select>
              </div>
              {manualMetode === "TRANSFER_BANK" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Bukti Transfer</label>
                  <input 
                    type="text" 
                    value={manualBuktiUrl} 
                    onChange={(e) => setManualBuktiUrl(e.target.value)} 
                    placeholder="URL Bukti Transfer (G-Drive / Link Gambar)"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Catatan / Keterangan</label>
                <textarea 
                  value={manualCatatan} 
                  onChange={(e) => setManualCatatan(e.target.value)} 
                  placeholder="Contoh: Diterima oleh Ustadz Fulan"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm min-h-[80px] transition-colors"
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 dark:bg-slate-950 flex justify-end gap-3 transition-colors">
              <button onClick={() => setManualPaymentModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 rounded-lg transition">Batal</button>
              <button onClick={handleSubmitManualPayment} disabled={isSubmittingPayment || !manualNominal} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50">
                {isSubmittingPayment ? 'Memproses...' : 'Simpan Pembayaran'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah Nominal */}
      {ubahNominalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-100 transition-transform">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 transition-colors">Ubah Nominal</h3>
              <button onClick={() => setUbahNominalModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Nominal Uang Masuk Baru (Rp)</label>
                <input 
                  type="number" 
                  value={newNominal} 
                  onChange={(e) => setNewNominal(e.target.value)} 
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold text-lg transition-colors"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 transition-colors">Masukan nilai total baru (misal 15000000). Nilai ini akan menggantikan target tagihan 100% lunas bagi santri terkait.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 transition-colors">Nominal SPP Bulanan Baru (Rp)</label>
                <input 
                  type="number" 
                  value={newSppNominal} 
                  onChange={(e) => setNewSppNominal(e.target.value)} 
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-lg transition-colors"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 transition-colors">Masukan nilai SPP khusus. Jika kosong akan menggunakan pengaturan default.</p>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 dark:bg-slate-950 flex justify-end gap-3 transition-colors">
              <button onClick={() => setUbahNominalModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 rounded-lg transition">Batal</button>
              <button onClick={handleUpdateNominal} disabled={isUpdatingNominal || (!newNominal && !newSppNominal)} className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-50">
                {isUpdatingNominal ? 'Menyimpan...' : 'Simpan Nominal'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Data Modal */}
      {editDataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 transition-colors">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors">Edit Data Peserta</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Ubah atau isi biodata pendaftar dan keluarga.</p>
              </div>
              <button onClick={() => setEditDataModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="editDataForm" onSubmit={handleEditDataSubmit} className="space-y-8">
                
                {/* Data Pendaftaran */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-600">A. Data Dasar Pendaftaran</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Nama Lengkap Sesuai Dokumen</label>
                      <input type="text" name="studentName" value={editDataForm.studentName || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-blue-500 outline-none transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Program</label>
                      <select name="program" value={editDataForm.program || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-blue-500 outline-none transition-colors" required>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA">SMA</option>
                        <option value="MAHAD_ALY">Ma'had Aly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                      <select name="gender" value={editDataForm.gender || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-blue-500 outline-none transition-colors" required>
                        <option value="LAKI_LAKI">Laki-Laki</option>
                        <option value="PEREMPUAN">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tahun Ajaran</label>
                      <select name="academicYear" value={editDataForm.academicYear || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-blue-500 outline-none transition-colors" required>
                        <option value="">Pilih Tahun Ajaran</option>
                        {academicYears.map(ta => (
                          <option key={ta.id || ta.nama} value={ta.nama}>{ta.nama}</option>
                        ))}
                        {editDataForm.academicYear && !academicYears.find(ta => ta.nama === editDataForm.academicYear) && (
                          <option value={editDataForm.academicYear}>{editDataForm.academicYear}</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Penempatan Markaz (MQBS)</label>
                      <select name="markazId" value={editDataForm.markazId || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-blue-500 outline-none transition-colors">
                        <option value="">Belum Ditentukan</option>
                        {markazList.map(m => (
                          <option key={m.id} value={m.id}>{m.nama}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2 mt-2">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 border-b pb-1 transition-colors">Asal Sekolah</h4>
                      {editDataForm.program === 'SMA' && (
                        <label className="flex items-center gap-3 p-3 mb-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="isLanjutan" 
                            checked={editDataForm.isLanjutan || false} 
                            onChange={(e) => setEditDataForm({...editDataForm, isLanjutan: e.target.checked})} 
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-semibold text-blue-800">SMA Lanjutan dari SMP MQ (Centang jika Ya)</span>
                        </label>
                      )}
                      {!(editDataForm.program === 'SMA' && editDataForm.isLanjutan) && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Nama Asal Sekolah Lengkap</label>
                          <input 
                            type="text" 
                            name="previousSchool" 
                            value={editDataForm.previousSchool || ""} 
                            onChange={handleEditDataChange} 
                            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-blue-500 outline-none transition-colors" 
                            placeholder="Contoh: SMP Negeri 1 Jakarta"
                            required 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Data Anak */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-emerald-600">B. Biodata Calon Santri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Panggilan</label>
                      <input type="text" name="nickname" value={editDataForm.nickname || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                      <input type="text" name="birthPlace" value={editDataForm.birthPlace || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                      <input type="date" name="birthDate" value={editDataForm.birthDate ? new Date(editDataForm.birthDate).toISOString().split('T')[0] : ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">No. KK (Hanya Angka)</label>
                      <input type="text" name="noKk" value={editDataForm.noKk || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">NIK (Hanya Angka)</label>
                      <input type="text" name="nik" value={editDataForm.nik || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">NISN (Hanya Angka)</label>
                      <input type="text" name="nisn" value={editDataForm.nisn || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Anak Ke</label>
                      <input type="text" name="childNumber" value={editDataForm.childNumber || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Dari Berapa Bersaudara</label>
                      <input type="text" name="siblingCount" value={editDataForm.siblingCount || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Prestasi</label>
                      <textarea name="achievements" value={editDataForm.achievements || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" rows="2" placeholder="Sebutkan jika ada..."></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Riwayat Penyakit / Kelainan / Kebutuhan Khusus</label>
                      <textarea name="medicalHistory" value={editDataForm.medicalHistory || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" rows="2" placeholder="Sebutkan jika ada..."></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Minat atau Bakat</label>
                      <textarea name="talents" value={editDataForm.talents || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" rows="2" placeholder="Sebutkan minat atau bakat anak..."></textarea>
                    </div>
                  </div>
                </section>

                {/* Data Ayah */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-indigo-600">C. Data Ayah Kandung</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Ayah</label>
                      <input type="text" name="fatherName" value={editDataForm.fatherName || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Umur Ayah</label>
                      <input type="text" name="fatherAge" value={editDataForm.fatherAge || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pendidikan Terakhir Ayah</label>
                      <input type="text" name="fatherEducation" value={editDataForm.fatherEducation || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pekerjaan Ayah</label>
                      <input type="text" name="fatherOccupation" value={editDataForm.fatherOccupation || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Penghasilan Ayah (Per Bulan)</label>
                      <select name="fatherIncome" value={editDataForm.fatherIncome || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required>
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
                      <textarea name="fatherAddress" value={editDataForm.fatherAddress || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" rows="2" required></textarea>
                    </div>
                  </div>
                </section>

                {/* Data Ibu */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-indigo-600">D. Data Ibu Kandung</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Ibu</label>
                      <input type="text" name="motherName" value={editDataForm.motherName || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Umur Ibu</label>
                      <input type="text" name="motherAge" value={editDataForm.motherAge || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pendidikan Terakhir Ibu</label>
                      <input type="text" name="motherEducation" value={editDataForm.motherEducation || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pekerjaan Ibu</label>
                      <input type="text" name="motherOccupation" value={editDataForm.motherOccupation || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Penghasilan Ibu (Per Bulan)</label>
                      <select name="motherIncome" value={editDataForm.motherIncome || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required>
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
                      <textarea name="motherAddress" value={editDataForm.motherAddress || ""} onChange={handleEditDataChange} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" rows="2" required></textarea>
                    </div>
                  </div>
                </section>

                {/* Status Orang Tua */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">E. Status Orang Tua</h3>
                  <div>
                    <select name="parentStatus" value={editDataForm.parentStatus || "BERSAMA"} onChange={handleEditDataChange} className="w-full md:w-1/2 p-2 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors" required>
                      <option value="BERSAMA">Tinggal Bersama</option>
                      <option value="CERAI">Bercerai</option>
                    </select>
                  </div>
                </section>

                {/* Data Saudara Kandung */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-primary">F. Data Saudara Kandung</h3>
                    <button type="button" onClick={addSibling} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition">
                      + Tambah Saudara
                    </button>
                  </div>
                  
                  {(!editDataForm.siblings || editDataForm.siblings.length === 0) ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic transition-colors">Tidak ada data saudara kandung.</p>
                  ) : (
                    <div className="space-y-4">
                      {editDataForm.siblings.map((sibling, idx) => (
                        <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg relative bg-slate-50 dark:bg-slate-950 transition-colors">
                          <button type="button" onClick={() => removeSibling(idx)} className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-1 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          <h4 className="text-sm font-bold mb-3">Saudara #{idx + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                            <div>
                              <label className="block text-xs font-medium mb-1">Nama</label>
                              <input type="text" value={sibling.name || ""} onChange={(e) => handleSiblingChange(idx, "name", e.target.value)} className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded transition-colors" required />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Umur</label>
                              <input type="text" value={sibling.age || ""} onChange={(e) => handleSiblingChange(idx, "age", e.target.value)} className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded transition-colors" required />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Pendidikan</label>
                              <input type="text" value={sibling.education || ""} onChange={(e) => handleSiblingChange(idx, "education", e.target.value)} className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded transition-colors" required />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Pekerjaan</label>
                              <input type="text" value={sibling.occupation || ""} onChange={(e) => handleSiblingChange(idx, "occupation", e.target.value)} className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded transition-colors" required />
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
                    <h3 className="text-lg font-semibold text-primary">G. Saudara yang Aktif di MQ</h3>
                    <button type="button" onClick={addMqSibling} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition">
                      + Tambah Data
                    </button>
                  </div>

                  {(!editDataForm.mqSiblings || editDataForm.mqSiblings.length === 0) ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic transition-colors">Tidak ada saudara yang aktif di MQ.</p>
                  ) : (
                    <div className="space-y-4">
                      {editDataForm.mqSiblings.map((sibling, idx) => (
                        <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg relative bg-slate-50 dark:bg-slate-950 transition-colors">
                          <button type="button" onClick={() => removeMqSibling(idx)} className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-1 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          <h4 className="text-sm font-bold mb-3">Saudara di MQ #{idx + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                            <div>
                              <label className="block text-xs font-medium mb-1">Nama</label>
                              <input type="text" value={sibling.name || ""} onChange={(e) => handleMqSiblingChange(idx, "name", e.target.value)} className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded transition-colors" required />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Program</label>
                              <select value={sibling.program || "SD"} onChange={(e) => handleMqSiblingChange(idx, "program", e.target.value)} className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded transition-colors" required>
                                <option value="SD">SD</option>
                                <option value="SMP">SMP</option>
                                <option value="SMA">SMA</option>
                                <option value="MAHAD_ALY">Ma'had Aly</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Kelas</label>
                              <input type="text" value={sibling.class || ""} onChange={(e) => handleMqSiblingChange(idx, "class", e.target.value)} className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded transition-colors" required />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 transition-colors">
              <button onClick={() => setEditDataModalOpen(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-sm transition">Batal</button>
              <button form="editDataForm" type="submit" disabled={editDataLoading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md shadow-blue-500/20 transition disabled:bg-blue-400 flex items-center gap-2">
                {editDataLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
