import { useEffect, useMemo, useState } from 'react';
import {
  Client,
  License,
  LicensePlan,
  PLAN_LABELS,
  PLAN_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  MODULE_OPTIONS,
  buildLicenseKey,
  verifyLicenseKey,
  formatDateID,
} from '../types-license';
import { fetchClients, fetchLicenses, upsertLicense, removeRecord, nextId, apiAvailable } from '../data/licenseData';
import {
  KeyRound, Plus, Search, Pencil, Trash2, X, Copy, CheckCircle2,
  AlertTriangle, Ban, Play, RefreshCw, FileText, ShieldCheck, Clock, Eye, Database, Calculator,
} from 'lucide-react';

interface LicenseManagerProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

interface LicenseFormState {
  clientId: string;
  customerName: string;   // nama pelanggan
  customerId: string;     // ID pelanggan
  wardCount: string;      // jumlah bangsal
  secretKey: string;      // kunci rahasia (disimpan dalam penanda [kunci: ...] pada catatan)
  licenseKey: string;
  plan: LicensePlan;
  maxDevices: string;
  maxUsers: string;
  issueDate: string;
  status: License['status'];
  modules: string[];
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): LicenseFormState => ({
  clientId: '',
  customerName: '',
  customerId: '',
  wardCount: '',
  secretKey: '',
  licenseKey: '',
  plan: 'standard',
  maxDevices: '50',
  maxUsers: '25',
  issueDate: today(),
  status: 'active',
  modules: ['Dashboard Monitoring', 'Peta Lantai / Ruangan', 'Log Panggilan'],
  notes: '',
});

/** Ringkasan perhitungan key dari 4 input rumus */
function formulaPreview(customerName: string, customerId: string, wardCount: string, secretKey: string) {
  const complete = !!(customerName.trim() && customerId.trim() && wardCount.trim() && secretKey.trim());
  if (!complete) return null;
  const wards = Math.max(0, Math.floor(Number(wardCount) || 0));
  return {
    key: buildLicenseKey(customerName, customerId, wards, secretKey),
    parts: [
      { label: 'Blok 1 — Hash nama + ID pelanggan', value: buildLicenseKey(customerName, customerId, wards, secretKey).split('-')[1] },
      { label: `Blok 2 — Jumlah bangsal (${wards})`, value: `W${String(Math.min(wards, 999)).padStart(3, '0')}` },
      { label: 'Blok 3 — Checksum kunci rahasia', value: buildLicenseKey(customerName, customerId, wards, secretKey).split('-')[3] },
    ],
  };
}

export default function LicenseManager({ onNotify }: LicenseManagerProps) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const useMysql = apiAvailable();

  useEffect(() => {
    let alive = true;
    Promise.all([fetchLicenses(), fetchClients()]).then(([lics, cls]) => {
      if (alive) {
        setLicenses(lics);
        setClients(cls);
        setLoading(false);
      }
    });
    return () => { alive = false; };
  }, []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'suspended'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  /** Kunci rahasia yang tersimpan pada lisensi yang sedang diedit (untuk prefilled form) */
  const [editingSavedSecret, setEditingSavedSecret] = useState('');
  const [form, setForm] = useState<LicenseFormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<License | null>(null);
  const [detailTarget, setDetailTarget] = useState<License | null>(null);
  const [detailSecret, setDetailSecret] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const clientName = (id: string) => clients.find(c => c.id === id)?.name || '(klien terhapus)';

  const persist = (next: License[]) => {
    setLicenses(next);
  };

  const saveLicense = async (license: License, isNew: boolean) => {
    const fresh = await upsertLicense(license, isNew);
    persist(fresh as License[]);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return licenses.filter(l => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (!q) return true;
      return [l.licenseKey, clientName(l.clientId), PLAN_LABELS[l.plan]]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [licenses, search, statusFilter]);

  const stats = useMemo(() => {
    const active = licenses.filter(l => l.status === 'active').length;
    const expired = licenses.filter(l => l.status === 'expired').length;
    const suspended = licenses.filter(l => l.status === 'suspended').length;
    return { active, expired, suspended };
  }, [licenses]);

  /** Ambil kunci rahasia yang tersimpan pada sebuah lisensi (kolom notes berformat [kunci: ...]) */
  const savedSecretOf = (l: License): string => {
    const m = (l.notes || '').match(/\[kunci:\s*([^\]]+)\]/);
    return m ? m[1] : '';
  };

  const openAdd = () => {
    setEditingId(null);
    setEditingSavedSecret('');
    setForm(emptyForm());
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (l: License) => {
    const savedSecret = savedSecretOf(l);
    setEditingId(l.id);
    setEditingSavedSecret(savedSecret);
    setForm({
      clientId: l.clientId,
      customerName: l.customerName || clientName(l.clientId),
      customerId: l.customerId || '',
      wardCount: String(l.wardCount ?? ''),
      // Tampilkan kembali semua data saat buat lisensi, termasuk kunci rahasia & catatan aslinya
      secretKey: savedSecret,
      licenseKey: l.licenseKey,
      plan: l.plan,
      maxDevices: String(l.maxDevices),
      maxUsers: String(l.maxUsers),
      issueDate: l.issueDate,
      status: l.status,
      modules: l.modules,
      // Catatan ditampilkan tanpa penanda [kunci: ...] internal
      notes: stripKeyTag(l.notes || ''),
    });
    setErrors({});
    setShowForm(true);
  };

  /** Buang penanda internal [kunci: ...] dari catatan */
  const stripKeyTag = (notes: string) => notes.replace(/\s*\[kunci:\s*[^\]]*\]/g, '').trim();

  /** Sisipkan/ubah penanda [kunci: ...] pada catatan agar bisa dibaca ulang saat edit */
  const withKeyTag = (notes: string, secret: string) => {
    const base = stripKeyTag(notes);
    const tag = `[kunci: ${secret}]`;
    return base ? `${base} ${tag}` : tag;
  };

  /** Saat klien dipilih, isi otomatis nama & ID pelanggan dari data klien */
  const pickClient = (id: string) => {
    const c = clients.find(x => x.id === id);
    setForm(f => ({
      ...f,
      clientId: id,
      customerName: c ? c.name : f.customerName,
      customerId: c ? c.id.toUpperCase() : f.customerId,
    }));
  };

  const preview = formulaPreview(form.customerName, form.customerId, form.wardCount, form.secretKey);

  const generateFromFormula = () => {
    if (!preview) {
      setErrors(e => ({ ...e, formula: 'Isi lengkap 4 data: nama pelanggan, ID pelanggan, jumlah bangsal, dan kunci rahasia' }));
      return;
    }
    setErrors(e => { const { formula, licenseKey, ...rest } = e; return rest; });
    setForm(f => ({ ...f, licenseKey: preview.key }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.clientId) e.clientId = 'Pilih klien terlebih dahulu';
    if (!form.customerName.trim()) e.customerName = 'Nama pelanggan wajib diisi';
    if (!form.customerId.trim()) e.customerId = 'ID pelanggan wajib diisi';
    if (!form.wardCount || Number(form.wardCount) < 1) e.wardCount = 'Minimal 1 bangsal';
    if (!form.secretKey.trim()) e.secretKey = 'Kunci rahasia wajib diisi';
    if (!/^[A-Z0-9-]{6,}$/.test(form.licenseKey.trim())) e.licenseKey = 'License key belum dibuat — klik "Generate dengan Rumus"';
    if (!form.maxDevices || Number(form.maxDevices) <= 0) e.maxDevices = 'Minimal 1 perangkat';
    if (!form.maxUsers || Number(form.maxUsers) <= 0) e.maxUsers = 'Minimal 1 user';
    if (!form.issueDate) e.issueDate = 'Wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload: Omit<License, 'id'> = {
      licenseKey: form.licenseKey.trim().toUpperCase(),
      clientId: form.clientId,
      customerName: form.customerName.trim(),
      customerId: form.customerId.trim().toUpperCase(),
      wardCount: Number(form.wardCount) || 0,
      plan: form.plan,
      maxDevices: Number(form.maxDevices),
      maxUsers: Number(form.maxUsers),
      issueDate: form.issueDate,
      status: form.status,
      modules: form.modules,
      // Simpan kunci rahasia di dalam catatan (penanda [kunci: ...]) agar bisa ditampilkan kembali saat edit
      notes: withKeyTag(form.notes.trim(), form.secretKey.trim()) || undefined,
    };
    if (editingId) {
      const edited = licenses.find(l => l.id === editingId)!;
      await saveLicense({ ...edited, ...payload }, false);
      onNotify(useMysql ? 'Lisensi diperbarui ke MySQL' : 'Lisensi berhasil diperbarui', 'success');
    } else {
      await saveLicense({ ...payload, id: nextId('lic') }, true);
      onNotify(useMysql ? `Lisensi baru tersimpan di MySQL: ${payload.licenseKey}` : `Lisensi baru dibuat: ${payload.licenseKey}`, 'success');
    }
    setShowForm(false);
  };

  const toggleModule = (m: string) =>
    setForm(f => ({
      ...f,
      modules: f.modules.includes(m) ? f.modules.filter(x => x !== m) : [...f.modules, m],
    }));

  const changeStatus = async (l: License, status: License['status'], msg: string) => {
    await saveLicense({ ...l, status }, false);
    onNotify(msg, 'success');
    setDetailTarget(null);
  };

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
    } catch {
      /* clipboard bisa gagal di beberapa browser, abaikan */
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const fresh = await removeRecord('licenses', deleteTarget.id);
    persist(fresh as License[]);
    onNotify(`Lisensi ${deleteTarget.licenseKey} dihapus`, 'success');
    setDeleteTarget(null);
  };

  const inputCls = (name: string) =>
    `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  return loading ? (
    <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
      <RefreshCw className="w-5 h-5 animate-spin" /> Memuat data lisensi...
    </div>
  ) : (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-blue-600" /> Kelola Lisensi
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Buat, perbarui, dan pantau lisensi penggunaan aplikasi Nursecall Monitor untuk setiap klien.
          </p>
          <span className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-1 rounded-full border ${useMysql ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            <Database className="w-3 h-3" /> {useMysql ? 'Tersambung ke MySQL' : 'Mode lokal (localStorage)'}
          </span>
        </div>
        <button
          onClick={openAdd}
          disabled={clients.length === 0}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Buat Lisensi Baru
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Aktif</p>
            <p className="text-xl font-bold text-gray-800">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg"><Clock className="w-5 h-5 text-red-600" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Kedaluwarsa</p>
            <p className="text-xl font-bold text-gray-800">{stats.expired}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg"><Ban className="w-5 h-5 text-amber-600" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Ditangguhkan</p>
            <p className="text-xl font-bold text-gray-800">{stats.suspended}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><KeyRound className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Lisensi</p>
            <p className="text-xl font-bold text-gray-800">{licenses.length}</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari license key, nama klien..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'expired', 'suspended'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                statusFilter === f
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Semua' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel lisensi */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">License Key</th>
                <th className="text-left px-4 py-3 font-semibold">Klien</th>
                <th className="text-left px-4 py-3 font-semibold">Paket</th>
                <th className="text-left px-4 py-3 font-semibold">Batas</th>
                <th className="text-left px-4 py-3 font-semibold">Tanggal Terbit</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(l => {
                const st = l.status;
                return (
                  <tr key={l.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyKey(l.licenseKey)}
                        className="font-mono text-xs font-semibold text-gray-800 flex items-center gap-1.5 group"
                        title="Klik untuk salin"
                      >
                        {l.licenseKey}
                        {copiedKey === l.licenseKey ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{clientName(l.clientId)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${PLAN_COLORS[l.plan]}`}>
                        {PLAN_LABELS[l.plan]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {l.maxDevices} perangkat<br />
                      <span className="text-xs text-gray-400">{l.maxUsers} user</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{formatDateID(l.issueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[st]}`}>
                        {STATUS_LABELS[st]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setDetailSecret(savedSecretOf(l)); setDetailTarget(l); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(l)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(l)} className="p-2 rounded-lg hover:bg-red-100 text-red-600" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Tidak ada lisensi yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Modal form buat/edit lisensi ===== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? 'Edit Lisensi' : 'Buat Lisensi Baru'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* ===== Rumus pembuatan lisensi ===== */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <p className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-1">
                  <Calculator className="w-4 h-4" /> Rumus License Key
                </p>
                <p className="text-xs text-blue-700 mb-3">
                  Lisensi dibuat dari 4 data: <b>Nama Pelanggan</b>, <b>ID Pelanggan</b>, <b>Jumlah Bangsal</b>, dan <b>Kunci Rahasia</b>.
                  Format hasil: <span className="font-mono font-semibold">NCM-[hash nama+ID]-[W+jml bangsal]-[checksum kunci]</span> — input yang sama selalu menghasilkan key yang sama.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Klien <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.clientId}
                      onChange={e => pickClient(e.target.value)}
                      className={inputCls('clientId')}
                    >
                      <option value="">-- Pilih klien --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                      ))}
                    </select>
                    {errors.clientId && <p className="text-xs text-red-500 mt-1">{errors.clientId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Pelanggan <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={inputCls('customerName')}
                      placeholder="cth: RS Umum Sehat Selalu"
                      value={form.customerName}
                      onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                    />
                    {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Pelanggan <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={`${inputCls('customerId')} font-mono uppercase`}
                      placeholder="cth: CLI-0042"
                      value={form.customerId}
                      onChange={e => setForm(f => ({ ...f, customerId: e.target.value.toUpperCase() }))}
                    />
                    {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Bangsal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" min={1} max={999}
                      className={inputCls('wardCount')}
                      placeholder="cth: 12"
                      value={form.wardCount}
                      onChange={e => setForm(f => ({ ...f, wardCount: e.target.value }))}
                    />
                    {errors.wardCount && <p className="text-xs text-red-500 mt-1">{errors.wardCount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kunci Rahasia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={editingId && form.secretKey === editingSavedSecret && editingSavedSecret ? 'text' : 'password'}
                      className={`${inputCls('secretKey')} font-mono`}
                      placeholder="kunci internal vendor"
                      value={form.secretKey}
                      onChange={e => setForm(f => ({ ...f, secretKey: e.target.value }))}
                    />
                    {editingId && editingSavedSecret ? (
                      <p className="text-xs text-emerald-600 mt-1">Kunci rahasia tersimpan — ditampilkan kembali sesuai data saat lisensi dibuat.</p>
                    ) : editingId ? (
                      <p className="text-xs text-amber-600 mt-1">Lisensi lama ini dibuat sebelum kunci rahasia disimpan. Masukkan kunci aslinya agar bisa diedit/divalidasi.</p>
                    ) : null}
                    {errors.secretKey && <p className="text-xs text-red-500 mt-1">{errors.secretKey}</p>}
                  </div>

                  {/* Preview hasil rumus */}
                  <div className="md:col-span-2 rounded-lg border border-blue-300 bg-white p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hasil Perhitungan Rumus</p>
                    {preview ? (
                      <>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-mono text-lg font-bold text-blue-700">{preview.key}</p>
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, licenseKey: preview.key }))}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                          >
                            <KeyRound className="w-3.5 h-3.5" /> Pakai Key Ini
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                          {preview.parts.map(p => (
                            <div key={p.label} className="text-xs bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5">
                              <p className="text-gray-500">{p.label}</p>
                              <p className="font-mono font-bold text-gray-800">{p.value}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Isi keempat data di atas untuk melihat hasil license key.</p>
                    )}
                    {errors.formula && <p className="text-xs text-red-500 mt-1">{errors.formula}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Key <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      className={`${inputCls('licenseKey')} font-mono uppercase`}
                      placeholder="Klik tombol Generate untuk membuat dari rumus"
                      value={form.licenseKey}
                      onChange={e => setForm(f => ({ ...f, licenseKey: e.target.value.toUpperCase() }))}
                    />
                    <button
                      type="button"
                      onClick={generateFromFormula}
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100"
                      title="Hitung license key menggunakan rumus (nama pelanggan + ID pelanggan + jumlah bangsal + kunci rahasia)"
                    >
                      <Calculator className="w-4 h-4" /> Generate dengan Rumus
                    </button>
                  </div>
                  {errors.licenseKey && <p className="text-xs text-red-500 mt-1">{errors.licenseKey}</p>}
                  {preview && form.licenseKey.trim().toUpperCase() !== preview.key && !editingId && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Key berbeda dari hasil rumus saat ini.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paket</label>
                  <select
                    value={form.plan}
                    onChange={e => setForm(f => ({ ...f, plan: e.target.value as LicensePlan }))}
                    className={inputCls('plan')}
                  >
                    {(Object.keys(PLAN_LABELS) as LicensePlan[]).map(p => (
                      <option key={p} value={p}>{PLAN_LABELS[p]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as License['status'] }))}
                    className={inputCls('status')}
                  >
                    <option value="active">Aktif</option>
                    <option value="suspended">Ditangguhkan</option>
                    <option value="expired">Kedaluwarsa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maks. Perangkat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" min={1}
                    className={inputCls('maxDevices')}
                    value={form.maxDevices}
                    onChange={e => setForm(f => ({ ...f, maxDevices: e.target.value }))}
                  />
                  {errors.maxDevices && <p className="text-xs text-red-500 mt-1">{errors.maxDevices}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maks. User <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" min={1}
                    className={inputCls('maxUsers')}
                    value={form.maxUsers}
                    onChange={e => setForm(f => ({ ...f, maxUsers: e.target.value }))}
                  />
                  {errors.maxUsers && <p className="text-xs text-red-500 mt-1">{errors.maxUsers}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Terbit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={inputCls('issueDate')}
                    value={form.issueDate}
                    onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))}
                  />
                  {errors.issueDate && <p className="text-xs text-red-500 mt-1">{errors.issueDate}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modul yang Diaktifkan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MODULE_OPTIONS.map(m => (
                      <label key={m} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${
                        form.modules.includes(m) ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                        <input
                          type="checkbox"
                          checked={form.modules.includes(m)}
                          onChange={() => toggleModule(m)}
                          className="rounded text-blue-600"
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="cth: termasuk support prioritas 24/7"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {editingId ? 'Simpan Perubahan' : 'Buat Lisensi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Modal detail lisensi ===== */}
      {detailTarget && (() => {
        const l = detailTarget;
        const st = l.status;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailTarget(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Detail Lisensi
                </h3>
                <button onClick={() => setDetailTarget(null)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white">
                  <p className="text-xs text-blue-200 uppercase tracking-wide">License Key</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono font-bold text-lg">{l.licenseKey}</p>
                    <button onClick={() => copyKey(l.licenseKey)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" title="Salin">
                      {copiedKey === l.licenseKey ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-sm text-blue-100 mt-1">{clientName(l.clientId)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500 text-xs">Nama Pelanggan</p><p className="font-semibold">{l.customerName || clientName(l.clientId)}</p></div>
                  <div><p className="text-gray-500 text-xs">ID Pelanggan</p><p className="font-mono font-semibold">{l.customerId || '-'}</p></div>
                  <div><p className="text-gray-500 text-xs">Jumlah Bangsal</p><p className="font-semibold">{l.wardCount ?? 0} bangsal</p></div>
                  <div><p className="text-gray-500 text-xs">Paket</p><p className="font-semibold">{PLAN_LABELS[l.plan]}</p></div>
                  <div><p className="text-gray-500 text-xs">Status</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[st]}`}>{STATUS_LABELS[st]}</span>
                  </div>
                  <div><p className="text-gray-500 text-xs">Tanggal Terbit</p><p className="font-semibold">{formatDateID(l.issueDate)}</p></div>
                  <div><p className="text-gray-500 text-xs">Maks. Perangkat</p><p className="font-semibold">{l.maxDevices}</p></div>
                  <div><p className="text-gray-500 text-xs">Maks. User</p><p className="font-semibold">{l.maxUsers}</p></div>
                  {l.activatedAt && <div><p className="text-gray-500 text-xs">Aktivasi</p><p className="font-semibold">{formatDateID(l.activatedAt)}</p></div>}
                </div>

                {/* Verifikasi kecocokan key dengan rumus */}
                {(() => {
                  const expected = buildLicenseKey(l.customerName, l.customerId, l.wardCount, detailSecret);
                  const ok = !!detailSecret && l.licenseKey.toUpperCase() === expected;
                  return (
                    <div className={`rounded-lg border p-3 text-sm ${!detailSecret ? 'border-gray-200 bg-gray-50' : ok ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                      <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Verifikasi Key dengan Rumus
                      </p>
                      <div className="flex gap-2">
                        <input
                          type={detailSecret === savedSecretOf(l) && savedSecretOf(l) ? 'text' : 'password'}
                          value={detailSecret}
                          onChange={e => setDetailSecret(e.target.value)}
                          placeholder="Masukkan kunci rahasia untuk memverifikasi..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {!savedSecretOf(l) && (
                        <p className="mt-1 text-xs text-amber-600">Kunci rahasia lisensi ini tidak tersimpan (dibuat sebelum fitur ini). Masukkan kunci aslinya untuk verifikasi.</p>
                      )}
                      {detailSecret.trim() && (
                        <p className={`mt-2 text-xs font-semibold flex items-center gap-1 ${ok ? 'text-green-700' : 'text-red-700'}`}>
                          {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          {ok ? 'Cocok — key sesuai rumus untuk data lisensi ini.' : `Tidak cocok — hasil rumus: ${expected}`}
                        </p>
                      )}
                    </div>
                  );
                })()}

                <div>
                  <p className="text-gray-500 text-xs mb-1">Modul Aktif</p>
                  <div className="flex flex-wrap gap-1.5">
                    {l.modules.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-200">{m}</span>
                    ))}
                  </div>
                </div>

                {stripKeyTag(l.notes || '') && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Catatan</p>
                    <p className="text-sm text-gray-700">{stripKeyTag(l.notes || '')}</p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap justify-end gap-2">
                {st !== 'active' && (
                  <button onClick={() => changeStatus(l, 'active', 'Lisensi diaktifkan kembali')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium">
                    <Play className="w-4 h-4" /> Aktifkan
                  </button>
                )}
                {st === 'active' && (
                  <button onClick={() => changeStatus(l, 'suspended', 'Lisensi ditangguhkan')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium">
                    <Ban className="w-4 h-4" /> Tangguhkan
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== Modal konfirmasi hapus ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><Trash2 className="w-5 h-5 text-red-600" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Hapus Lisensi?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Lisensi <span className="font-mono font-semibold">{deleteTarget.licenseKey}</span> milik{' '}
                  <span className="font-semibold">{clientName(deleteTarget.clientId)}</span> akan dihapus permanen.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">Batal</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
