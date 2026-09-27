import { useState } from 'react';
import { UserAccount, UserRole, UserStatus } from '../types';
import { userAccounts as initialAccounts } from '../data/userData';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  UserCheck,
  UserX,
  Shield,
  Stethoscope,
  Heart,
  Crown,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<UserAccount[]>(initialAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewDetail, setViewDetail] = useState<UserAccount | null>(null);

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || acc.role === filterRole;
    const matchesStatus = filterStatus === 'all' || acc.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAdd = () => {
    setEditingAccount(null);
    setShowModal(true);
  };

  const handleEdit = (account: UserAccount) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const handleSave = (account: UserAccount) => {
    if (editingAccount) {
      setAccounts(accounts.map(a => (a.id === account.id ? account : a)));
    } else {
      setAccounts([...accounts, { ...account, id: `u${Date.now()}` }]);
    }
    setShowModal(false);
    setEditingAccount(null);
  };

  const toggleStatus = (id: string) => {
    setAccounts(
      accounts.map(a =>
        a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
      )
    );
  };

  const stats = {
    total: accounts.length,
    active: accounts.filter(a => a.status === 'active').length,
    inactive: accounts.filter(a => a.status === 'inactive').length,
    admin: accounts.filter(a => a.role === 'admin').length,
    nurse: accounts.filter(a => a.role === 'nurse' || a.role === 'head_nurse').length,
    doctor: accounts.filter(a => a.role === 'doctor').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MiniStatCard label="Total Akun" value={stats.total} icon={<Users className="w-5 h-5" />} color="bg-blue-500" />
        <MiniStatCard label="Aktif" value={stats.active} icon={<UserCheck className="w-5 h-5" />} color="bg-green-500" />
        <MiniStatCard label="Nonaktif" value={stats.inactive} icon={<UserX className="w-5 h-5" />} color="bg-gray-500" />
        <MiniStatCard label="Admin" value={stats.admin} icon={<Shield className="w-5 h-5" />} color="bg-purple-500" />
        <MiniStatCard label="Perawat" value={stats.nurse} icon={<Heart className="w-5 h-5" />} color="bg-pink-500" />
        <MiniStatCard label="Dokter" value={stats.doctor} icon={<Stethoscope className="w-5 h-5" />} color="bg-indigo-500" />
      </div>

      {/* Header & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              Kelola Akun Pengguna
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Mengelola akun pengguna sistem NurseCall Monitor
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Tambah Akun
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, username, email, atau departemen..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value as UserRole | 'all')}
            className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="head_nurse">Head Nurse</option>
            <option value="nurse">Perawat</option>
            <option value="doctor">Dokter</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as UserStatus | 'all')}
            className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Account Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Departemen</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Login Terakhir</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAccounts.map(account => (
                <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        account.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                        account.role === 'head_nurse' ? 'bg-gradient-to-br from-pink-500 to-pink-700' :
                        account.role === 'doctor' ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' :
                        'bg-gradient-to-br from-blue-500 to-blue-700'
                      }`}>
                        {account.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div>
                        <button
                          onClick={() => setViewDetail(account)}
                          className="font-semibold text-sm text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                        >
                          {account.fullName}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{account.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={account.role} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{account.department}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(account.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        account.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        account.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                      }`}></span>
                      {account.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(account.lastLogin).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(account)}
                        className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(account.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAccounts.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Tidak ada akun ditemukan</p>
            <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmDeleteModal
          account={accounts.find(a => a.id === deleteConfirm)!}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <AccountFormModal
          account={editingAccount}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingAccount(null);
          }}
        />
      )}

      {/* View Detail Modal */}
      {viewDetail && (
        <AccountDetailModal
          account={viewDetail}
          onClose={() => setViewDetail(null)}
          onEdit={() => {
            setViewDetail(null);
            handleEdit(viewDetail);
          }}
        />
      )}
    </div>
  );
}

// ============== Sub Components ==============

function MiniStatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
        <div className={`${color} p-2 rounded-lg text-white`}>{icon}</div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const config = {
    admin: { label: 'Admin', icon: <Shield className="w-3 h-3" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    head_nurse: { label: 'Head Nurse', icon: <Crown className="w-3 h-3" />, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
    nurse: { label: 'Perawat', icon: <Heart className="w-3 h-3" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    doctor: { label: 'Dokter', icon: <Stethoscope className="w-3 h-3" />, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  };
  const c = config[role];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// ============== Account Form Modal ==============

function AccountFormModal({ account, onSave, onClose }: {
  account: UserAccount | null;
  onSave: (account: UserAccount) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<UserAccount>(
    account || {
      id: '',
      username: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'nurse',
      status: 'active',
      department: '',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString(),
    }
  );
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Username wajib diisi';
    if (!formData.fullName.trim()) newErrors.fullName = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    if (!formData.department.trim()) newErrors.department = 'Departemen wajib diisi';
    if (!account && password.length < 4) newErrors.password = 'Password minimal 4 karakter';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const updateField = (field: keyof UserAccount, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {account ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {account ? 'Edit Akun' : 'Tambah Akun Baru'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {account ? 'Perbarui informasi akun pengguna' : 'Buat akun baru untuk pengguna sistem'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={e => updateField('username', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${
                  errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="username"
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => updateField('fullName', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Nama lengkap dengan gelar"
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => updateField('email', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="email@domain.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                No. Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => updateField('phone', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="08xxxxxxxxxx"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={e => updateField('role', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="admin">Admin</option>
                <option value="head_nurse">Head Nurse</option>
                <option value="nurse">Perawat</option>
                <option value="doctor">Dokter</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Departemen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={e => updateField('department', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${
                  errors.department ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Rawat Inap, IGD, dll"
              />
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => updateField('status', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {account ? 'Password Baru (opsional)' : 'Password'} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder={account ? 'Kosongkan jika tidak diubah' : 'Minimal 4 karakter'}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {account ? 'Simpan Perubahan' : 'Buat Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============== Account Detail Modal ==============

function AccountDetailModal({ account, onClose, onEdit }: {
  account: UserAccount;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className={`p-6 ${
          account.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-purple-700' :
          account.role === 'head_nurse' ? 'bg-gradient-to-r from-pink-500 to-pink-700' :
          account.role === 'doctor' ? 'bg-gradient-to-r from-indigo-500 to-indigo-700' :
          'bg-gradient-to-r from-blue-500 to-blue-700'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
                {account.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{account.fullName}</h2>
                <p className="text-white/80 text-sm">@{account.username}</p>
                <div className="mt-2">
                  <RoleBadge role={account.role} />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <DetailRow icon={<Mail className="w-4 h-4" />} label="Email" value={account.email} />
            <DetailRow icon={<Phone className="w-4 h-4" />} label="Telepon" value={account.phone} />
            <DetailRow icon={<Building2 className="w-4 h-4" />} label="Departemen" value={account.department} />
            <DetailRow
              icon={<UserCheck className="w-4 h-4" />}
              label="Status"
              value={
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                  account.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${account.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  {account.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
              }
            />
            <DetailRow
              icon={<Calendar className="w-4 h-4" />}
              label="Dibuat"
              value={new Date(account.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
            />
            <DetailRow
              icon={<Clock className="w-4 h-4" />}
              label="Login Terakhir"
              value={new Date(account.lastLogin).toLocaleString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <div className="text-sm font-medium text-gray-800 dark:text-white mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

// ============== Delete Confirmation Modal ==============

function ConfirmDeleteModal({ account, onConfirm, onCancel }: {
  account: UserAccount;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Hapus Akun?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Anda akan menghapus akun <span className="font-semibold">{account.fullName}</span>. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
