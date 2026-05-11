import { useState, useEffect, useMemo } from "react";
import { Edit2, Trash2, Plus, X, Calendar, DollarSign, Tag, CheckCircle, Search, Filter, Eye, Users, Hammer } from "lucide-react";

// Generate 10 years of academic years
const generateTahunAjaran = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 10; i++) {
    years.push(`${currentYear + i}/${currentYear + i + 1}`);
  }
  return years;
};

export default function TabDaftarProject() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRabModalOpen, setIsRabModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Master Data
  const [materials, setMaterials] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [filterMarkaz, setFilterMarkaz] = useState("");
  const [filterSumberTugas, setFilterSumberTugas] = useState("");
  const [filterPrioritas, setFilterPrioritas] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterTanggal, setFilterTanggal] = useState(""); 
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [form, setForm] = useState({
    id: "",
    rencanaPekerjaan: "",
    kategori: "JANGKA_PENDEK",
    prioritas: "Sedang",
    sumberTugas: "Perencanaan",
    markaz: "",
    keterangan: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    semester: "Ganjil",
    tahunAjaran: generateTahunAjaran()[0],
    status: "REGISTER"
  });

  // Form States
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState(null);
  
  // Delete Project State
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);

  // RAB Form
  const [rabList, setRabList] = useState([]);
  const [rabTab, setRabTab] = useState("MATERIAL"); // MATERIAL or PEKERJA
  const [rabPembayaranTipe, setRabPembayaranTipe] = useState("HARIAN"); // HARIAN or BORONGAN
  const [rabPihakKetiga, setRabPihakKetiga] = useState("PEKERJA"); // PEKERJA or VENDOR
  const [rabForm, setRabForm] = useState({ tipe: "MATERIAL", itemId: "", category: "", estimatedCost: 0, description: "", qty: 1, hargaSatuan: 0 });
  const [deleteRabId, setDeleteRabId] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const [resMat, resWork, resVen] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/pembangunan/materials`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/pembangunan/workers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/pembangunan/vendors`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const mat = await resMat.json();
      const work = await resWork.json();
      const ven = await resVen.json();
      if(mat.success) setMaterials(mat.data);
      if(work.success) setWorkers(work.data);
      if(ven.success) setVendors(ven.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMasterData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects/${form.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects`;
      
      const payload = {
        rencanaPekerjaan: form.rencanaPekerjaan,
        kategori: form.kategori,
        prioritas: form.prioritas,
        sumberTugas: form.sumberTugas,
        markaz: form.markaz,
        keterangan: form.keterangan,
        status: form.status
      };

      if (form.kategori === 'JANGKA_PENDEK') {
        payload.tanggalMulai = form.tanggalMulai;
        payload.tanggalSelesai = form.tanggalSelesai;
      } else {
        payload.semester = form.semester;
        payload.tahunAjaran = form.tahunAjaran;
      }

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openDeleteProjectModal = (id) => {
    setDeleteProjectId(id);
    setIsDeleteProjectModalOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects/${deleteProjectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      setIsDeleteProjectModalOpen(false);
      setDeleteProjectId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (project = null) => {
    setError(null);
    if (project) {
      setIsEdit(true);
      setForm({
        id: project.id,
        rencanaPekerjaan: project.rencanaPekerjaan || "",
        kategori: project.kategori || "JANGKA_PENDEK",
        prioritas: project.prioritas || "Sedang",
        sumberTugas: project.sumberTugas || "Perencanaan",
        markaz: project.markaz || "",
        keterangan: project.keterangan || "",
        tanggalMulai: project.tanggalMulai ? new Date(project.tanggalMulai).toISOString().split('T')[0] : "",
        tanggalSelesai: project.tanggalSelesai ? new Date(project.tanggalSelesai).toISOString().split('T')[0] : "",
        semester: project.semester || "Ganjil",
        tahunAjaran: project.tahunAjaran || generateTahunAjaran()[0],
        status: project.status || "REGISTER"
      });
    } else {
      setIsEdit(false);
      setForm({
        id: "",
        rencanaPekerjaan: "",
        kategori: "JANGKA_PENDEK",
        prioritas: "Sedang",
        sumberTugas: "Perencanaan",
        markaz: "",
        keterangan: "",
        tanggalMulai: "",
        tanggalSelesai: "",
        semester: "Ganjil",
        tahunAjaran: generateTahunAjaran()[0],
        status: "REGISTER"
      });
    }
    setIsModalOpen(true);
  };

  // --- RAB Management ---
  const openRabModal = async (project) => {
    setSelectedProject(project);
    setRabList(project.McBudget || []);
    setRabTab("MATERIAL");
    setRabForm({ tipe: "MATERIAL", itemId: "", category: "", estimatedCost: 0, description: "", qty: 1, hargaSatuan: 0 });
    setIsRabModalOpen(true);
  };

  const handleRabTabChange = (tab) => {
    setRabTab(tab);
    setRabPembayaranTipe("HARIAN");
    setRabPihakKetiga("PEKERJA");
    setRabForm({ tipe: tab, itemId: "", category: "", estimatedCost: 0, description: "", qty: 1, hargaSatuan: 0 });
  };

  const handlePembayaranTipeChange = (tipe) => {
    setRabPembayaranTipe(tipe);
    setRabForm({ ...rabForm, itemId: "", category: "", estimatedCost: 0, qty: 1, hargaSatuan: 0 });
  };

  const handlePihakKetigaChange = (pihak) => {
    setRabPihakKetiga(pihak);
    setRabForm({ ...rabForm, itemId: "", category: "", estimatedCost: 0, qty: 1, hargaSatuan: 0 });
  };

  const handleItemSelect = (e) => {
    const val = e.target.value;
    if(!val) {
      setRabForm({...rabForm, itemId: "", category: "", hargaSatuan: 0, estimatedCost: 0});
      return;
    }
    
    if (rabTab === "MATERIAL") {
      const mat = materials.find(m => m.id === val);
      if (mat) {
        const cost = Number(mat.harga || 0) * rabForm.qty;
        setRabForm({...rabForm, itemId: mat.id, category: mat.nama, hargaSatuan: Number(mat.harga || 0), estimatedCost: cost});
      }
    } else {
      if (rabPihakKetiga === "VENDOR") {
        const ven = vendors.find(v => v.id === val);
        if (ven) {
          // For Vendor/Borongan, base cost is manual
          setRabForm({...rabForm, itemId: ven.id, category: ven.nama, hargaSatuan: 0, estimatedCost: 0});
        }
      } else {
        const work = workers.find(w => w.id === val);
        if (work) {
          // If worker but borongan, we don't calculate by upahHarian
          const harga = rabPembayaranTipe === "BORONGAN" ? 0 : Number(work.upahHarian || 0);
          const cost = harga * rabForm.qty;
          setRabForm({...rabForm, itemId: work.id, category: work.nama, hargaSatuan: harga, estimatedCost: cost});
        }
      }
    }
  };

  const handleQtyChange = (e) => {
    const qty = parseInt(e.target.value) || 1;
    const cost = qty * rabForm.hargaSatuan;
    setRabForm({...rabForm, qty, estimatedCost: cost});
  };

  const handleHargaSatuanChange = (e) => {
    const harga = parseInt(e.target.value) || 0;
    const cost = rabForm.qty * harga;
    setRabForm({...rabForm, hargaSatuan: harga, estimatedCost: cost});
  };

  const handleAddRab = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects/${selectedProject.id}/budgets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category: rabForm.category,
          estimatedCost: rabForm.estimatedCost,
          tipe: rabForm.tipe,
          itemId: rabForm.itemId,
          qty: rabForm.qty,
          hargaSatuan: rabForm.hargaSatuan,
          pembayaranTipe: rabTab === "PEKERJA" ? rabPembayaranTipe : null
        })
      });
      const result = await res.json();
      if (result.success) {
        setRabList([result.data, ...rabList]);
        setRabForm({ tipe: rabTab, itemId: "", category: "", estimatedCost: 0, description: "", qty: 1, hargaSatuan: 0 });
        fetchData(); // Update underlying table for RAB sum
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRab = async () => {
    if(!deleteRabId) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/projects/budgets/${deleteRabId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRabList(rabList.filter(r => r.id !== deleteRabId));
        fetchData();
        setDeleteRabId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTotalRab = (budgets) => {
    if (!budgets || budgets.length === 0) return 0;
    return budgets.reduce((acc, curr) => acc + Number(curr.estimatedCost), 0);
  };

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.rencanaPekerjaan?.toLowerCase().includes(search.toLowerCase()) || item.keterangan?.toLowerCase().includes(search.toLowerCase());
      const matchMarkaz = filterMarkaz === "" || item.markaz === filterMarkaz;
      const matchSumberTugas = filterSumberTugas === "" || item.sumberTugas === filterSumberTugas;
      const matchPrioritas = filterPrioritas === "" || item.prioritas === filterPrioritas;
      const matchKategori = filterKategori === "" || item.kategori === filterKategori;
      
      let matchTanggal = true;
      if (filterTanggal && item.kategori === 'JANGKA_PENDEK' && item.tanggalMulai && item.tanggalSelesai) {
        const d = new Date(filterTanggal);
        const start = new Date(item.tanggalMulai);
        const end = new Date(item.tanggalSelesai);
        matchTanggal = d >= start && d <= end;
      } else if (filterTanggal && item.kategori === 'JANGKA_PANJANG') {
        matchTanggal = false; // Filter Date only applies to JANGKA_PENDEK
      }

      return matchSearch && matchMarkaz && matchSumberTugas && matchPrioritas && matchKategori && matchTanggal;
    });
  }, [data, search, filterMarkaz, filterSumberTugas, filterPrioritas, filterKategori, filterTanggal]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterMarkaz, filterSumberTugas, filterPrioritas, filterKategori, filterTanggal]);

  // Paginated Data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  // Extract unique Markaz from data for dropdown
  const uniqueMarkaz = useMemo(() => {
    const arr = data.map(d => d.markaz).filter(Boolean);
    return [...new Set(arr)];
  }, [data]);

  const tahunAjaranOptions = generateTahunAjaran();

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Daftar Project Pembangunan</h4>
          <p className="text-sm text-slate-500">Pantau seluruh rencana pekerjaan, prioritas, dan RAB-nya di sini.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari project..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full md:w-64"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl border transition-colors flex-shrink-0 ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Filter size={18} />
          </button>
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Tambah Project
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-3 animate-in slide-in-from-top-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Markaz</label>
            <select value={filterMarkaz} onChange={e => setFilterMarkaz(e.target.value)} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none">
              <option value="">Semua Markaz</option>
              {uniqueMarkaz.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sumber Tugas</label>
            <select value={filterSumberTugas} onChange={e => setFilterSumberTugas(e.target.value)} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none">
              <option value="">Semua Sumber</option>
              <option value="Perencanaan">Perencanaan</option>
              <option value="Instruksi Pimpinan">Instruksi Pimpinan</option>
              <option value="Request Unit">Request Unit</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kategori</label>
            <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none">
              <option value="">Semua Kategori</option>
              <option value="JANGKA_PENDEK">Jangka Pendek</option>
              <option value="JANGKA_PANJANG">Jangka Panjang</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prioritas</label>
            <select value={filterPrioritas} onChange={e => setFilterPrioritas(e.target.value)} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none">
              <option value="">Semua Prioritas</option>
              <option value="Rendah">Rendah</option>
              <option value="Sedang">Sedang</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Mendesak">Mendesak</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal (Cari Rentang)</label>
            <input type="date" value={filterTanggal} onChange={e => setFilterTanggal(e.target.value)} className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none" />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Rencana Pekerjaan</th>
              <th className="px-6 py-4">Markaz & Keterangan</th>
              <th className="px-6 py-4">Timeline / Target</th>
              <th className="px-6 py-4">Prioritas</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Estimasi RAB</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">Project tidak ditemukan.</td></tr>
            ) : (
              paginatedData.map(item => {
                const totalRab = calculateTotalRab(item.McBudget);
                const isPendingRequest = item.sumberTugas === 'Request Unit' && item.status === 'REGISTER';
                return (
                  <tr key={item.id} className={`transition-colors ${isPendingRequest ? 'bg-orange-50/30 hover:bg-orange-50/60 dark:bg-orange-950/10 dark:hover:bg-orange-950/30' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${isPendingRequest ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.rencanaPekerjaan}
                      </div>
                      <div className="flex gap-2 mt-1.5">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold bg-slate-100 dark:bg-slate-800 inline-block px-2 py-0.5 rounded-md">
                          {item.kategori?.replace('_', ' ')}
                        </div>
                        {item.sumberTugas && (
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold bg-indigo-50 dark:bg-indigo-900/30 inline-block px-2 py-0.5 rounded-md">
                            {item.sumberTugas}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.markaz ? (
                        <div className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">{item.markaz}</div>
                      ) : <div className="text-xs text-slate-400 italic mb-1">Global</div>}
                      {item.keterangan && (
                        <div className="text-[11px] text-slate-500 line-clamp-2 max-w-[200px]" title={item.keterangan}>
                          {item.keterangan}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.kategori === 'JANGKA_PENDEK' ? (
                        <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                          <Calendar size={14} className="text-indigo-500"/>
                          {item.tanggalMulai ? new Date(item.tanggalMulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '?'} - 
                          {item.tanggalSelesai ? new Date(item.tanggalSelesai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '?'}
                        </div>
                      ) : (
                        <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                          <Calendar size={14} className="text-amber-500"/>
                          Sem. {item.semester} ({item.tahunAjaran})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                        item.prioritas === 'Mendesak' ? 'bg-rose-100 text-rose-700' :
                        item.prioritas === 'Tinggi' ? 'bg-orange-100 text-orange-700' :
                        item.prioritas === 'Sedang' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.prioritas}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">{item.status?.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {totalRab > 0 ? `Rp ${totalRab.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openDetailModal(item)} className="p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg" title="Detail Project"><Eye size={16} /></button>
                        <button onClick={() => openRabModal(item)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg" title="Kelola RAB"><DollarSign size={16} /></button>
                        <button onClick={() => openModal(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => openDeleteProjectModal(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
            Menampilkan halaman <span className="font-bold">{currentPage}</span> dari <span className="font-bold">{totalPages}</span> (Total {filteredData.length} data)
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = currentPage;
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                
                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* MODAL PROJECT EDIT/CREATE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{isEdit ? 'Edit Project' : 'Tambah Project Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl">{error}</div>}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Rencana Pekerjaan *</label>
                <input required type="text" value={form.rencanaPekerjaan} onChange={e => setForm({...form, rencanaPekerjaan: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Markaz / Lokasi</label>
                  <input type="text" value={form.markaz} onChange={e => setForm({...form, markaz: e.target.value})} placeholder="Opsional" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Sumber Tugas *</label>
                  <select value={form.sumberTugas} onChange={e => setForm({...form, sumberTugas: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none">
                    <option value="Perencanaan">Perencanaan</option>
                    <option value="Instruksi Pimpinan">Instruksi Pimpinan</option>
                    <option value="Request Unit">Request Unit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan / Detail Request</label>
                <textarea rows="2" value={form.keterangan} onChange={e => setForm({...form, keterangan: e.target.value})} placeholder="Catatan tambahan atau detail request dari unit" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kategori Timeline *</label>
                  <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none">
                    <option value="JANGKA_PENDEK">Jangka Pendek</option>
                    <option value="JANGKA_PANJANG">Jangka Panjang</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kategori Prioritas *</label>
                  <select value={form.prioritas} onChange={e => setForm({...form, prioritas: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none">
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Mendesak">Mendesak</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC FIELDS */}
              {form.kategori === 'JANGKA_PENDEK' ? (
                <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <div>
                    <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">Tanggal Mulai</label>
                    <input required type="date" value={form.tanggalMulai} onChange={e => setForm({...form, tanggalMulai: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">Tanggal Selesai</label>
                    <input required type="date" value={form.tanggalSelesai} onChange={e => setForm({...form, tanggalSelesai: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <div>
                    <label className="block text-xs font-bold text-amber-700 dark:text-amber-500 mb-1">Semester Target</label>
                    <select value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm appearance-none">
                      <option value="Ganjil">Semester Ganjil</option>
                      <option value="Genap">Semester Genap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-700 dark:text-amber-500 mb-1">Tahun Ajaran</label>
                    <select value={form.tahunAjaran} onChange={e => setForm({...form, tahunAjaran: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm appearance-none">
                      {tahunAjaranOptions.map(ta => (
                        <option key={ta} value={ta}>{ta}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status Progres</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none">
                  <option value="REGISTER">Register (Baru)</option>
                  <option value="RAB_APPROVED">RAB Disetujui</option>
                  <option value="ON_PROGRESS">Sedang Dikerjakan</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="PENDING">Ditunda</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md">Simpan Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RAB DETAILING */}
      {isRabModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 my-8 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Penyusunan RAB Project</h3>
                <p className="text-xs text-slate-500">{selectedProject.rencanaPekerjaan}</p>
              </div>
              <button onClick={() => setIsRabModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/50">
              
              {/* RAB TABS */}
              <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl mb-5 inline-flex w-full max-w-xs mx-auto">
                <button onClick={() => handleRabTabChange("MATERIAL")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${rabTab === "MATERIAL" ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>
                  Material
                </button>
                <button onClick={() => handleRabTabChange("PEKERJA")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${rabTab === "PEKERJA" ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-700'}`}>
                  Pekerja
                </button>
              </div>

              <form onSubmit={handleAddRab} className="flex flex-col gap-3 mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                {rabTab === "PEKERJA" && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">Tipe:</span>
                      <label className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer">
                        <input type="radio" name="pembayaranTipe" checked={rabPembayaranTipe === "HARIAN"} onChange={() => handlePembayaranTipeChange("HARIAN")} className="text-amber-500 focus:ring-amber-500" />
                        Harian
                      </label>
                      <label className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer">
                        <input type="radio" name="pembayaranTipe" checked={rabPembayaranTipe === "BORONGAN"} onChange={() => handlePembayaranTipeChange("BORONGAN")} className="text-amber-500 focus:ring-amber-500" />
                        Borongan
                      </label>
                    </div>

                    {rabPembayaranTipe === "BORONGAN" && (
                      <>
                        <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500 uppercase">Pihak:</span>
                          <label className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer">
                            <input type="radio" name="pihakKetiga" checked={rabPihakKetiga === "PEKERJA"} onChange={() => handlePihakKetigaChange("PEKERJA")} className="text-amber-500 focus:ring-amber-500" />
                            Pekerja Inti
                          </label>
                          <label className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer">
                            <input type="radio" name="pihakKetiga" checked={rabPihakKetiga === "VENDOR"} onChange={() => handlePihakKetigaChange("VENDOR")} className="text-amber-500 focus:ring-amber-500" />
                            Vendor
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      {rabTab === "MATERIAL" ? "Pilih Material" : (rabPihakKetiga === "VENDOR" ? "Pilih Vendor" : "Pilih Pekerja")}
                    </label>
                    <select required value={rabForm.itemId} onChange={handleItemSelect} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-sm appearance-none">
                      <option value="">-- Pilih --</option>
                      {rabTab === "MATERIAL" 
                        ? materials.map(m => <option key={m.id} value={m.id}>{m.nama} (Rp {Number(m.harga).toLocaleString('id-ID')}/{m.satuan})</option>)
                        : (rabPihakKetiga === "VENDOR"
                            ? vendors.map(v => <option key={v.id} value={v.id}>{v.nama} - {v.kategori}</option>)
                            : workers.map(w => <option key={w.id} value={w.id}>{w.nama} - {w.kategori} (Rp {Number(w.upahHarian).toLocaleString('id-ID')}/hr)</option>)
                          )
                      }
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      {rabPembayaranTipe === "BORONGAN" ? "Kuantitas" : (rabTab === "MATERIAL" ? "Kuantitas" : "Jml Hari")}
                    </label>
                    <input required type="number" min="1" value={rabForm.qty} onChange={handleQtyChange} disabled={rabPembayaranTipe === "BORONGAN"} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-sm disabled:opacity-50" />
                  </div>
                </div>

                {rabPembayaranTipe === "BORONGAN" && (
                  <div className="mt-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nominal Borongan (Rp)</label>
                    <input required type="number" min="0" value={rabForm.hargaSatuan} onChange={handleHargaSatuanChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-sm" placeholder="Contoh: 1500000" />
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Estimasi:</div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400">Rp {rabForm.estimatedCost.toLocaleString('id-ID')}</div>
                  </div>
                  <button type="submit" disabled={!rabForm.itemId} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-sm">
                    + Tambahkan ke RAB
                  </button>
                </div>
              </form>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-4 py-3">Item / Deskripsi</th>
                      <th className="px-4 py-3 text-center">Tipe</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Harga (Rp)</th>
                      <th className="px-4 py-3 text-right">Total (Rp)</th>
                      <th className="px-4 py-3 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rabList.length === 0 ? (
                      <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500 text-xs">Belum ada rincian RAB</td></tr>
                    ) : (
                      rabList.map(rab => (
                        <tr key={rab.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 text-xs">
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{rab.category}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${rab.tipe === 'MATERIAL' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                              {rab.tipe} {rab.pembayaranTipe && `(${rab.pembayaranTipe})`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-medium">{rab.qty}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{(Number(rab.hargaSatuan) || 0).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">
                            {Number(rab.estimatedCost).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button type="button" onClick={() => setDeleteRabId(rab.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 size={14}/></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-emerald-50 dark:bg-emerald-900/20 border-t border-slate-200 dark:border-slate-800">
                    <tr>
                      <td colSpan="4" className="px-4 py-3 font-bold text-emerald-800 dark:text-emerald-400 text-right">GRAND TOTAL RAB :</td>
                      <td colSpan="2" className="px-4 py-3 font-black text-emerald-600 dark:text-emerald-400 text-left text-base">
                        Rp {calculateTotalRab(rabList).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROJECT DETAIL PASSPORT */}
      {isDetailModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 my-8 flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-indigo-600 rounded-t-2xl">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] uppercase font-bold tracking-wider">{selectedProject.kategori?.replace('_', ' ')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                    selectedProject.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 
                    selectedProject.status === 'ON_PROGRESS' ? 'bg-blue-500 text-white' : 
                    'bg-slate-800 text-white'
                  }`}>
                    {selectedProject.status?.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-2xl font-black">{selectedProject.rencanaPekerjaan}</h2>
                <div className="flex items-center gap-4 mt-2 text-indigo-100 text-sm">
                  {selectedProject.markaz ? <span>📍 Markaz: {selectedProject.markaz}</span> : <span>📍 Global</span>}
                  <span>|</span>
                  <span>📁 Sumber: {selectedProject.sumberTugas}</span>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-white/60 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-950/50">
              
              {/* Left Column - Info */}
              <div className="col-span-1 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">Timeline & Prioritas</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Timeline</div>
                      <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        {selectedProject.kategori === 'JANGKA_PENDEK' 
                          ? `${selectedProject.tanggalMulai ? new Date(selectedProject.tanggalMulai).toLocaleDateString('id-ID') : '?'} s/d ${selectedProject.tanggalSelesai ? new Date(selectedProject.tanggalSelesai).toLocaleDateString('id-ID') : '?'}`
                          : `Sem. ${selectedProject.semester} (${selectedProject.tahunAjaran})`
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Prioritas</div>
                      <div className={`font-bold text-sm ${
                        selectedProject.prioritas === 'Mendesak' ? 'text-rose-600' :
                        selectedProject.prioritas === 'Tinggi' ? 'text-orange-600' : 'text-blue-600'
                      }`}>{selectedProject.prioritas}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">Keterangan</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedProject.keterangan || <span className="italic text-slate-400">Tidak ada keterangan / detail tambahan.</span>}
                  </p>
                </div>
              </div>

              {/* Right Column - RAB Summary */}
              <div className="col-span-1 md:col-span-2">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <DollarSign size={18} className="text-emerald-500" /> Ringkasan RAB
                    </h4>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Total Anggaran</div>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        Rp {calculateTotalRab(selectedProject.McBudget).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Material List */}
                    <div>
                      <h5 className="font-bold text-xs text-indigo-600 flex items-center gap-1.5 mb-2"><Hammer size={14} /> Daftar Material</h5>
                      {(!selectedProject.McBudget || !selectedProject.McBudget.some(b => b.tipe === 'MATERIAL')) ? (
                        <div className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg">Belum ada material.</div>
                      ) : (
                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                          {selectedProject.McBudget.filter(b => b.tipe === 'MATERIAL').map(b => (
                            <div key={b.id} className="flex justify-between items-center p-2 text-xs border-b last:border-0 border-slate-100 hover:bg-slate-50">
                              <span className="font-medium">{b.category} <span className="text-slate-400">x{b.qty}</span></span>
                              <span className="font-bold text-slate-600">Rp {Number(b.estimatedCost).toLocaleString('id-ID')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pekerja List */}
                    <div>
                      <h5 className="font-bold text-xs text-amber-600 flex items-center gap-1.5 mb-2"><Users size={14} /> Daftar Pekerja</h5>
                      {(!selectedProject.McBudget || !selectedProject.McBudget.some(b => b.tipe === 'PEKERJA')) ? (
                        <div className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg">Belum ada pekerja.</div>
                      ) : (
                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                          {selectedProject.McBudget.filter(b => b.tipe === 'PEKERJA').map(b => (
                            <div key={b.id} className="flex justify-between items-center p-2 text-xs border-b last:border-0 border-slate-100 hover:bg-slate-50">
                              <span className="font-medium">{b.category} <span className="text-slate-400">({b.qty} Hari)</span></span>
                              <span className="font-bold text-slate-600">Rp {Number(b.estimatedCost).toLocaleString('id-ID')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS RAB */}
      {deleteRabId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 mb-2">Hapus Item RAB?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Item ini akan dihapus permanen dari daftar RAB project. Apakah Anda yakin?
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeleteRabId(null)} 
                className="flex-1 py-2.5 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteRab} 
                className="flex-1 py-2.5 font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md shadow-rose-500/20 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
