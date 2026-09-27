import { useMemo, useState } from 'react';
import {
  Client,
  License,
  LicensePlan,
  PLAN_LABELS,
  PLAN_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  MODULE_OPTIONS,
  daysUntilExpiry,
  effectiveStatus,
  generateLicenseKey,
  formatDateID,
} from '../types-license';
import { loadClients, loadLicenses, saveLicenses, nextId } from '../data/licenseData';
import {
  KeyRound, Plus, Search, Pencil, Trash2, X, Copy, CheckCircle2,
  AlertTriangle, Ban, Play, RefreshCw, FileText, ShieldCheck, Clock, Eye,
} from 'lucide-react';

interface LicenseManagerProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

interface LicenseFormState {
  clientId: string;
  licenseKey: string;
  plan: LicensePlan;
  maxDevices: string;
  maxUsers: string;
  issueDate: string;
  expiryDate: string;
  status: License['status'];
  machineFingerprint: string;
  modules: string[];
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const addYear = (iso: string) => {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

const emptyForm = (clientId = ''): LicenseFormState => ({
  clientId,
  licenseKey: generateLicenseKey(),
  plan: 'standard',
  maxDevices: '50',
  maxUsers: '25',
  issueDate: today(),
  expiryDate: addYear(today()),
  status: 'active',
  machineFingerprint: '',
  modules: ['Dashboard Monitoring', 'Peta Lantai / Ruangan', 'Log Panggilan'],
  notes: '',
});

export default function LicenseManager({ onNotify }: LicenseManagerProps) {
  const [licenses, setLicenses] = useState<License[]>(() => loadLicenses());
  const [clients] = useState<Client[]>(() => loadClients());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'suspended'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LicenseFormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<License | null>(null);
  const [detailTarget, setDetailTarget] = useState<License | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const clientName = (id: string) => clients.find(c => c.id === id)?.name || '(klien terhapus)';

  const persist = (next: License[]) => {
    setLicenses(next);
    saveLicenses(next);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return licenses.filter(l => {
      const st = effectiveStatus(l);
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (!q) return true;
      return [l.licenseKey, clientName(l.clientId), PLAN_LABELS[l.plan], l.machineFingerprint || '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [licenses, search, statusFilter]);

  const stats = useMemo(() => {
    const active = licenses.filter(l => effectiveStatus(l) === 'active').length;
    const expired = licenses.filter(l => effectiveStatus(l) === 'expired').length;
    const suspended = licenses.filter(l => effectiveStatus(l) === 'suspended').length;
    const expiringSoon = licenses.filter(l => {
      const d = daysUntilExpiry(l);
      return d >= 0 && d <= 30;
    }).length;
    return { active, expired, suspended, expiringSoon };
  }, [licenses]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm(clients[0]?.id || ''));
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (l: License) => {
    setEditingId(l.id);
    setForm({
      clientId: l.clientId,
      licenseKey: l.licenseKey,
      plan: l.plan,
      maxDevices: String(l.maxDevices),
      maxUsers: String(l.maxUsers),
      issueDate: l.issueDate,
      expiryDate: l.expiryDate,
      status: l.status,
      machineFingerprint: l.machineFingerprint || '',
      modules: l.modules,
      notes: l.notes || '',
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.clientId) e.clientId = 'Pilih klien terlebih dahulu';
    if (!/^[A-Z0-9-]{6,}$/.test(form.licenseKey.trim())) e.licenseKey = 'Format license key tidak valid';
    if (!form.maxDevices || Number(form.maxDevices) <= 0) e.maxDevices = 'Minimal 1 perangkat';
    if (!form.maxUsers || Number(form.maxUsers) <= 0) e.maxUsers = 'Minimal 1 user';
    if (!form.issueDate) e.issueDate = 'Wajib diisi';
    if (!form.expiryDate) e.expiryDate = 'Wajib diisi';
    else if (form.issueDate && form.expiryDate <= form.issueDate) e.expiryDate = 'Harus setelah tanggal terbit';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload: Omit<License, 'id'> = {
      licenseKey: form.licenseKey.trim().toUpperCase(),
      clientId: form.clientId,
      plan: form.plan,
      maxDevices: Number(form.maxDevices),
      maxUsers: Number(form.maxUsers),
      issueDate: form.issueDate,
      expiryDate: form.expiryDate,
      status: form.status,
      machineFingerprint: form.machineFingerprint.trim() || undefined,
      modules: form.modules,
      notes: form.notes.trim() || undefined,
    };
    if (editingId) {
      persist(licenses.map(l => (l.id === editingId ? { ...l, ...payload } : l)));
      onNotify('Lisensi berhasil diperbarui', 'success');
    } else {
      persist([{ ...payload, id: nextId('lic') }, ...licenses]);
      onNotify(`Lisensi baru dibuat: ${payload.licenseKey}`, 'success');
    }
    setShowForm(false);
  };

  const toggleModule = (m: string) =>
    setForm(f => ({
      ...f,
      modules: f.modules.includes(m) ? f.modules.filter(x => x !== m) : [...f.modules, m],
    }));

  const changeStatus = (l: License, status: License['status'], msg: string) => {
    persist(licenses.map(x => (x.id === l.id ? { ...x, status } : x)));
    onNotify(msg, 'success');
    setDetailTarget(null);
  };

  const extendOneYear = (l: License) => {
    const base = effectiveStatus(l) === 'expired' ? new Date(today()) : new Date(l.expiryDate);
    const newExpiry = new Date(base);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    persist(
      licenses.map(x =>
        x.id === l.id
          ? { ...x, expiryDate: newExpiry.toISOString().slice(0, 10), status: 'active' as const }
          : x
      )
    );
    onNotify(`Masa berlaku lisensi ${l.licenseKey} diperpanjang 1 tahun`, 'success');
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

  const confirmDelete = () => {
    if (!deleteTarget) return;
    persist(licenses.filter(l => l.id !== deleteTarget.id));
    onNotify(`Lisensi ${deleteTarget.licenseKey} dihapus`, 'success');
    setDeleteTarget(null);
  };

  const inputCls = (name: string) =>
    `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  const renderExpiryBadge = (l: License) => {
    const d = daysUntilExpiry(l);
    const st = effectiveStatus(l);
    if (st === 'expired') return <span className="text-xs font-semibold text-red-600">Lewat {Math.abs(d)} hari</span>;
    if (st === 'suspended') return null;
    return d <= 30 ? (
      <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> {d} hari lagi
      </span>
    ) : (
      <span className="text-xs text-gray-500">{d} hari lagi</span>
    );
  };

  return (
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
          <div className="p-2 bg-blue-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Habis ≤ 30 Hari</p>
            <p className="text-xl font-bold text-gray-800">{stats.expiringSoon}</p>
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
            placeholder="Cari license key, nama klien, fingerprint..."
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
                <th className="text-left px-4 py-3 font-semibold">Berlaku s/d</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(l => {
                const st = effectiveStatus(l);
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
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-gray-700">{formatDateID(l.expiryDate)}</p>
                      {renderExpiryBadge(l)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[st]}`}>
                        {STATUS_LABELS[st]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setDetailTarget(l)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Detail">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Klien <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.clientId}
                    onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                    className={inputCls('clientId')}
                  >
                    <option value="">-- Pilih klien --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                    ))}
                  </select>
                  {errors.clientId && <p className="text-xs text-red-500 mt-1">{errors.clientId}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Key <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      className={`${inputCls('licenseKey')} font-mono uppercase`}
                      value={form.licenseKey}
                      onChange={e => setForm(f => ({ ...f, licenseKey: e.target.value.toUpperCase() }))}
                    />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, licenseKey: generateLicenseKey() }))}
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                      title="Generate key acak"
                    >
                      <RefreshCw className="w-4 h-4" /> Acak
                    </button>
                  </div>
                  {errors.licenseKey && <p className="text-xs text-red-500 mt-1">{errors.licenseKey}</p>}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Berlaku Sampai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={inputCls('expiryDate')}
                    value={form.expiryDate}
                    onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                  />
                  {errors.expiryDate && <p className="text-xs text-red-500 mt-1">{errors.expiryDate}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Machine Fingerprint</label>
                  <input
                    className={`${inputCls('machineFingerprint')} font-mono`}
                    placeholder="cth: SRV-RSS-2026-A1B2C3 (opsional)"
                    value={form.machineFingerprint}
                    onChange={e => setForm(f => ({ ...f, machineFingerprint: e.target.value }))}
                  />
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
        const st = effectiveStatus(l);
        const d = daysUntilExpiry(l);
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
                  <div><p className="text-gray-500 text-xs">Paket</p><p className="font-semibold">{PLAN_LABELS[l.plan]}</p></div>
                  <div><p className="text-gray-500 text-xs">Status</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[st]}`}>{STATUS_LABELS[st]}</span>
                  </div>
                  <div><p className="text-gray-500 text-xs">Tanggal Terbit</p><p className="font-semibold">{formatDateID(l.issueDate)}</p></div>
                  <div><p className="text-gray-500 text-xs">Berlaku Sampai</p>
                    <p className="font-semibold">{formatDateID(l.expiryDate)}</p>
                    <p className={`text-xs ${st === 'expired' ? 'text-red-600' : d <= 30 ? 'text-amber-600' : 'text-green-600'}`}>
                      {st === 'expired' ? `Lewat ${Math.abs(d)} hari` : `${d} hari lagi`}
                    </p>
                  </div>
                  <div><p className="text-gray-500 text-xs">Maks. Perangkat</p><p className="font-semibold">{l.maxDevices}</p></div>
                  <div><p className="text-gray-500 text-xs">Maks. User</p><p className="font-semibold">{l.maxUsers}</p></div>
                  {l.activatedAt && <div><p className="text-gray-500 text-xs">Aktivasi</p><p className="font-semibold">{formatDateID(l.activatedAt)}</p></div>}
                  {l.machineFingerprint && <div><p className="text-gray-500 text-xs">Fingerprint</p><p className="font-mono text-xs font-semibold break-all">{l.machineFingerprint}</p></div>}
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Modul Aktif</p>
                  <div className="flex flex-wrap gap-1.5">
                    {l.modules.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-200">{m}</span>
                    ))}
                  </div>
                </div>

                {l.notes && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Catatan</p>
                    <p className="text-sm text-gray-700">{l.notes}</p>
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
                <button onClick={() => extendOneYear(l)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
                  <RefreshCw className="w-4 h-4" /> Perpanjang 1 Tahun
                </button>
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
