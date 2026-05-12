import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, CheckCircle, Users, Truck, Clock, X } from "lucide-react";

export default function TabPembagianTugas() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Master Data
  const [workers, setWorkers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [bawahans, setBawahans] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    id: "",
    namaPekerjaan: "",
    targetSelesai: "",
    catatan: "",
    pihakKetiga: "PEKERJA", // PEKERJA or VENDOR
    pekerjaIds: [],
    vendorId: "",
    status: "PENDING"
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const [resProj, resWork, resVen, resBawahan] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/pembangunan/workers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/pembangunan/vendors`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/hierarchy/subordinates`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const proj = await resProj.json();
      const work = await resWork.json();
      const ven = await resVen.json();
      const baw = await resBawahan.json();
      
      if(proj.success) {
        // Only active projects that have a timeline
        const activeProjects = proj.data.filter(p => p.status !== 'COMPLETED' && p.tanggalMulai && p.tanggalSelesai);
        setProjects(activeProjects);
        if(activeProjects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(activeProjects[0].id);
        }
      }
      if(work.success) setWorkers(work.data);
      if(ven.success) setVendors(ven.data);
      if(Array.isArray(baw)) setBawahans(baw);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update subTasks when project changes
  useEffect(() => {
    if (selectedProjectId) {
      const proj = projects.find(p => p.id === selectedProjectId);
      if (proj && proj.McSubTugas) {
        setSubTasks(proj.McSubTugas);
      } else {
        setSubTasks([]);
      }
    }
  }, [selectedProjectId, projects]);

  const openModal = (task = null) => {
    setError("");
    if (task) {
      setIsEdit(true);
      let parsedPekerjaIds = [];
      try {
        if(task.pekerjaIds) parsedPekerjaIds = JSON.parse(task.pekerjaIds);
      } catch(e) {}

      let detectedPihakKetiga = "PEKERJA";
      if (task.vendorId) {
        detectedPihakKetiga = "VENDOR";
      } else if (parsedPekerjaIds.length > 0) {
        // Check if the first ID belongs to bawahans
        const isBawahan = bawahans.some(b => b.id === parsedPekerjaIds[0]);
        if (isBawahan) detectedPihakKetiga = "BAWAHAN";
      }

      setForm({
        id: task.id,
        namaPekerjaan: task.namaPekerjaan || "",
        targetSelesai: task.targetSelesai ? new Date(task.targetSelesai).toISOString().split('T')[0] : "",
        catatan: task.catatan || "",
        pihakKetiga: detectedPihakKetiga,
        pekerjaIds: parsedPekerjaIds,
        vendorId: task.vendorId || "",
        status: task.status || "PENDING"
      });
    } else {
      setIsEdit(false);
      setForm({
        id: "",
        namaPekerjaan: "",
        targetSelesai: "",
        catatan: "",
        pihakKetiga: "PEKERJA",
        pekerjaIds: [],
        vendorId: "",
        status: "PENDING"
      });
    }
    setIsModalOpen(true);
  };

  const handlePekerjaCheckbox = (workerId) => {
    const isSelected = form.pekerjaIds.includes(workerId);
    if (isSelected) {
      setForm({...form, pekerjaIds: form.pekerjaIds.filter(id => id !== workerId)});
    } else {
      setForm({...form, pekerjaIds: [...form.pekerjaIds, workerId]});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects/tasks/${form.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects/${selectedProjectId}/tasks`;
      
      const payload = {
        namaPekerjaan: form.namaPekerjaan,
        targetSelesai: form.targetSelesai,
        catatan: form.catatan,
        status: form.status,
        pekerjaIds: (form.pihakKetiga === "PEKERJA" || form.pihakKetiga === "BAWAHAN") ? form.pekerjaIds : null,
        vendorId: form.pihakKetiga === "VENDOR" ? form.vendorId : null
      };

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      setIsModalOpen(false);
      fetchData(); // Refresh all
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Hapus rincian tugas ini?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChangeFast = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("admin_token");
      const task = subTasks.find(t => t.id === id);
      const payload = {
        ...task,
        pekerjaIds: task.pekerjaIds ? JSON.parse(task.pekerjaIds) : null,
        status: newStatus
      };
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Sidebar - Project List */}
      <div className="w-full md:w-80 flex-shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Pilih Project</h3>
          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Belum ada project aktif.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {projects.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedProjectId === p.id 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500/50' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-950/50'
                  }`}
                >
                  <p className={`font-bold text-sm line-clamp-2 ${selectedProjectId === p.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {p.rencanaPekerjaan}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                      {p.sumberTugas}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock size={10} />
                      {p.tanggalMulai ? new Date(p.tanggalMulai).toLocaleDateString('id-ID', {month:'short', day:'numeric'}) : p.semester}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Sub Tasks */}
      <div className="flex-1">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[500px] flex flex-col">
          {!selectedProjectId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Users size={48} className="mb-4 opacity-50" />
              <p>Pilih project di sebelah kiri untuk mengatur pembagian tugas.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Daftar Pekerjaan & Petugas</h2>
                  <p className="text-xs text-slate-500 mt-1">Project: <span className="font-bold text-indigo-600 dark:text-indigo-400">{projects.find(p=>p.id===selectedProjectId)?.rencanaPekerjaan}</span></p>
                </div>
                <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors">
                  <Plus size={16} /> Tambah Pekerjaan
                </button>
              </div>

              {subTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-500 font-medium">Belum ada rincian pekerjaan untuk project ini.</p>
                  <button onClick={() => openModal()} className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm">
                    Buat Pekerjaan Pertama
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {subTasks.map(task => {
                    let pekerjaLabels = [];
                    if (task.vendorId) {
                      const v = vendors.find(ven => ven.id === task.vendorId);
                      pekerjaLabels = v ? [{ name: v.nama, type: 'vendor' }] : [{ name: 'Vendor (ID tidak ditemukan)', type: 'vendor' }];
                    } else if (task.pekerjaIds) {
                      try {
                        const ids = JSON.parse(task.pekerjaIds);
                        pekerjaLabels = ids.map(id => {
                          const w = workers.find(work => work.id === id);
                          if (w) return { name: w.nama, type: 'pekerja' };
                          const b = bawahans.find(baw => baw.id === id);
                          if (b) return { name: b.namaLengkap, type: 'bawahan' };
                          return null;
                        }).filter(Boolean);
                      } catch(e){}
                    }

                    return (
                      <div key={task.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-300 transition-colors bg-slate-50 dark:bg-slate-950/50 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-slate-800 dark:text-slate-100 text-base">{task.namaPekerjaan}</h4>
                          <select 
                            value={task.status} 
                            onChange={(e) => handleStatusChangeFast(task.id, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded-md outline-none border cursor-pointer ${
                              task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              task.status === 'ON_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="ON_PROGRESS">Proses</option>
                            <option value="COMPLETED">Selesai</option>
                          </select>
                        </div>

                        {task.targetSelesai && (
                          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mb-3">
                            <Clock size={12} /> Target: {new Date(task.targetSelesai).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}
                          </div>
                        )}

                        <div className="mb-4 flex-1">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Dikerjakan Oleh:</div>
                          {pekerjaLabels.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {pekerjaLabels.map((p, idx) => (
                                <span key={idx} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${p.type === 'vendor' ? 'bg-purple-100 text-purple-700' : p.type === 'bawahan' ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                  {p.type === 'vendor' ? <Truck size={10} /> : <Users size={10} />}
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Belum ada yang ditugaskan</span>
                          )}
                        </div>

                        {task.catatan && (
                          <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mb-4 line-clamp-2">
                            <span className="font-bold text-slate-400 mr-1">Catatan:</span>
                            {task.catatan}
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-auto">
                          <button onClick={() => openModal(task)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(task.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 rounded-t-2xl">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{isEdit ? 'Edit Pekerjaan' : 'Tambah Pekerjaan'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl">{error}</div>}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Pekerjaan *</label>
                <input required type="text" value={form.namaPekerjaan} onChange={e => setForm({...form, namaPekerjaan: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Contoh: Pemasangan Keramik Teras" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Target Selesai (Opsional)</label>
                  <input type="date" value={form.targetSelesai} onChange={e => setForm({...form, targetSelesai: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status Pekerjaan</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none">
                    <option value="PENDING">Pending (Belum Mulai)</option>
                    <option value="ON_PROGRESS">Sedang Dikerjakan</option>
                    <option value="COMPLETED">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Penugasan Kepada</label>
                <div className="flex items-center gap-4 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input type="radio" name="pihakTugas" checked={form.pihakKetiga === "PEKERJA"} onChange={() => setForm({...form, pihakKetiga: "PEKERJA", vendorId: "", pekerjaIds: []})} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    Pekerja Internal (Bisa &gt;1)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input type="radio" name="pihakTugas" checked={form.pihakKetiga === "BAWAHAN"} onChange={() => setForm({...form, pihakKetiga: "BAWAHAN", vendorId: "", pekerjaIds: []})} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    Bawahan (User)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input type="radio" name="pihakTugas" checked={form.pihakKetiga === "VENDOR"} onChange={() => setForm({...form, pihakKetiga: "VENDOR", pekerjaIds: []})} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    Vendor / Borongan
                  </label>
                </div>

                {form.pihakKetiga === "PEKERJA" ? (
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
                    {workers.length === 0 ? <p className="text-xs text-slate-400 text-center py-2">Data pekerja kosong</p> : (
                      <div className="grid grid-cols-2 gap-2">
                        {workers.map(w => (
                          <label key={w.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${form.pekerjaIds.includes(w.id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20' : 'border-transparent hover:bg-white dark:hover:bg-slate-900'}`}>
                            <input type="checkbox" checked={form.pekerjaIds.includes(w.id)} onChange={() => handlePekerjaCheckbox(w.id)} className="w-4 h-4 rounded text-indigo-600" />
                            <div className="leading-tight">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{w.nama}</p>
                              <p className="text-[9px] uppercase font-bold text-slate-400">{w.kategori}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ) : form.pihakKetiga === "BAWAHAN" ? (
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
                    {bawahans.length === 0 ? <p className="text-xs text-slate-400 text-center py-2">Tidak ada data bawahan</p> : (
                      <div className="grid grid-cols-2 gap-2">
                        {bawahans.map(b => (
                          <label key={b.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${form.pekerjaIds.includes(b.id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20' : 'border-transparent hover:bg-white dark:hover:bg-slate-900'}`}>
                            <input type="checkbox" checked={form.pekerjaIds.includes(b.id)} onChange={() => handlePekerjaCheckbox(b.id)} className="w-4 h-4 rounded text-indigo-600" />
                            <div className="leading-tight">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{b.namaLengkap}</p>
                              <p className="text-[9px] uppercase font-bold text-slate-400">{b.role}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <select required value={form.vendorId} onChange={e => setForm({...form, vendorId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none">
                      <option value="">-- Pilih Vendor --</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.nama} - {v.kategori}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Catatan Khusus</label>
                <textarea rows="3" value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Instruksi tambahan untuk pekerja/vendor..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={(form.pihakKetiga === "PEKERJA" || form.pihakKetiga === "BAWAHAN") && form.pekerjaIds.length === 0} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  Simpan Pekerjaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
