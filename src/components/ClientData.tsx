import { useEffect, useMemo, useState } from 'react';
import { Client } from '../types-license';
import { fetchClients, upsertClient, removeRecord, nextId, apiAvailable } from '../data/licenseData';
import { Building2, Plus, Search, Pencil, Trash2, X, Mail, Phone, Database, RefreshCw } from 'lucide-react';

interface ClientDataProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const emptyForm = (): Omit<Client, 'id' | 'createdAt'> => ({
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  npwp: '',
  notes: '',
});

export default function ClientData({ onNotify }: ClientDataProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const useMysql = apiAvailable();

  // Muat data (MySQL bila API aktif, selain itu localStorage)
  useEffect(() => {
    let alive = true;
    fetchClients().then((data) => {
      if (alive) {
        setClients(data);
        setLoading(false);
      }
    });
    return () => { alive = false; };
  }, []);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const persist = (next: Client[]) => {
    setClients(next);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(c =>
      [c.name, c.contactPerson, c.city, c.email, c.phone].join(' ').toLowerCase().includes(q)
    );
  }, [clients, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (c: Client) => {
    setEditingId(c.id);
    setForm({
      name: c.name, contactPerson: c.contactPerson, email: c.email, phone: c.phone,
      address: c.address, city: c.city, npwp: c.npwp, notes: c.notes || '',
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nama klien wajib diisi';
    if (!form.contactPerson.trim()) e.contactPerson = 'PIC wajib diisi';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid';
    if (!form.phone.trim()) e.phone = 'Telepon wajib diisi';
    if (!form.city.trim()) e.city = 'Kota wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (editingId) {
      const updated = clients.map(c => (c.id === editingId ? { ...c, ...form } : c));
      const fresh = await upsertClient(updated.find(c => c.id === editingId)!, false);
      persist(fresh as Client[]);
      onNotify(useMysql ? 'Data klien diperbarui ke MySQL' : 'Data klien berhasil diperbarui', 'success');
    } else {
      const newClient: Client = { ...form, id: nextId('cli'), createdAt: new Date().toISOString().slice(0, 10) };
      const fresh = await upsertClient(newClient, true);
      persist(fresh as Client[]);
      onNotify(useMysql ? 'Klien baru tersimpan di MySQL' : 'Klien baru berhasil ditambahkan', 'success');
    }
    setShowForm(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const fresh = await removeRecord('clients', deleteTarget.id);
    persist(fresh as Client[]);
    onNotify(`Klien "${deleteTarget.name}" dihapus`, 'success');
    setDeleteTarget(null);
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: ev.target.value })),
  });

  const inputCls = (name: string) =>
    `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  return loading ? (
    <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
      <RefreshCw className="w-5 h-5 animate-spin" /> Memuat data klien...
    </div>
  ) : (
    <div className="space-y-6">
      {/* Header & aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Data Klien
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data rumah sakit / klinik pengguna aplikasi Nursecall Monitor.
          </p>
          <span className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-1 rounded-full border ${useMysql ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            <Database className="w-3 h-3" /> {useMysql ? 'Tersambung ke MySQL' : 'Mode lokal (localStorage)'}
          </span>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Klien
        </button>
      </div>

      {/* Statistik ringkas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Klien</p>
          <p className="text-2xl font-bold text-gray-800">{clients.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Kota Terlayani</p>
          <p className="text-2xl font-bold text-gray-800">{new Set(clients.map(c => c.city)).size}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Klien Terbaru</p>
          <p className="text-sm font-semibold text-gray-800 truncate mt-1">
            {clients.length ? [...clients].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0].name : '-'}
          </p>
        </div>
      </div>

      {/* Pencarian */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama klien, PIC, kota, email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabel klien */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Klien</th>
                <th className="text-left px-4 py-3 font-semibold">PIC / Kontak</th>
                <th className="text-left px-4 py-3 font-semibold">Lokasi</th>
                <th className="text-left px-4 py-3 font-semibold">NPWP</th>
                <th className="text-left px-4 py-3 font-semibold">Terdaftar</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" /> {c.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{c.contactPerson}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <p>{c.city}</p>
                    <p className="text-xs text-gray-500">{c.address}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.npwp || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="p-2 rounded-lg hover:bg-red-100 text-red-600" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Tidak ada klien yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal form tambah/edit */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? 'Edit Data Klien' : 'Tambah Klien Baru'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Rumah Sakit / Klinik <span className="text-red-500">*</span>
                </label>
                <input className={inputCls('name')} placeholder="cth: RS Umum Sehat Selalu" {...field('name')} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penanggung Jawab (PIC) <span className="text-red-500">*</span>
                </label>
                <input className={inputCls('contactPerson')} placeholder="cth: Bpk. Ahmad Fauzi" {...field('contactPerson')} />
                {errors.contactPerson && <p className="text-xs text-red-500 mt-1">{errors.contactPerson}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input className={inputCls('email')} placeholder="it@rsnama.co.id" {...field('email')} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon <span className="text-red-500">*</span>
                </label>
                <input className={inputCls('phone')} placeholder="021-1234567" {...field('phone')} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kota <span className="text-red-500">*</span>
                </label>
                <input className={inputCls('city')} placeholder="cth: Bandung" {...field('city')} />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <input className={inputCls('address')} placeholder="Jalan, nomor, kelurahan..." {...field('address')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NPWP</label>
                <input className={inputCls('npwp')} placeholder="00.000.000.0-000.000 (opsional)" {...field('npwp')} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Catatan tambahan tentang klien..." {...field('notes')} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow">
                  {editingId ? 'Simpan Perubahan' : 'Tambah Klien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal konfirmasi hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Hapus Klien?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Anda akan menghapus <span className="font-semibold">{deleteTarget.name}</span>.
                  Lisensi yang terkait tetap tersimpan namun tidak memiliki klien.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                Batal
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
