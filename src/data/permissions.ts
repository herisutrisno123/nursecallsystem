import { Permission, UserRole, MenuPermission } from '../types';

// ============ DEFINISI SEMUA PERMISSION ============
export const allPermissions: Permission[] = [
  // ===== MODULE: DASHBOARD =====
  {
    id: 'perm-001',
    code: 'dashboard.view',
    name: 'Lihat Dashboard',
    description: 'Akses untuk melihat halaman dashboard utama',
    module: 'Dashboard',
    icon: '📊',
  },
  {
    id: 'perm-002',
    code: 'dashboard.stats',
    name: 'Lihat Statistik',
    description: 'Akses untuk melihat kartu statistik panggilan',
    module: 'Dashboard',
    submenu: 'Statistik',
    icon: '📈',
  },
  {
    id: 'perm-003',
    code: 'dashboard.charts',
    name: 'Lihat Grafik',
    description: 'Akses untuk melihat grafik panggilan dan respon',
    module: 'Dashboard',
    submenu: 'Grafik',
    icon: '📉',
  },
  {
    id: 'perm-004',
    code: 'dashboard.active_calls',
    name: 'Lihat Panggilan Aktif',
    description: 'Akses untuk melihat daftar panggilan aktif di dashboard',
    module: 'Dashboard',
    submenu: 'Panggilan Aktif',
    icon: '🔔',
  },

  // ===== MODULE: PETA KAMAR =====
  {
    id: 'perm-005',
    code: 'map.view',
    name: 'Lihat Peta Kamar',
    description: 'Akses untuk melihat halaman peta lantai',
    module: 'Peta Kamar',
    icon: '🗺️',
  },
  {
    id: 'perm-006',
    code: 'map.floor1',
    name: 'Peta Lantai 1',
    description: 'Akses untuk melihat peta lantai 1',
    module: 'Peta Kamar',
    submenu: 'Lantai 1',
    icon: '🏢',
  },
  {
    id: 'perm-007',
    code: 'map.room_detail',
    name: 'Detail Kamar',
    description: 'Akses untuk melihat detail kamar dan pasien',
    module: 'Peta Kamar',
    submenu: 'Detail Kamar',
    icon: '🛏️',
  },
  {
    id: 'perm-008',
    code: 'map.filter',
    name: 'Filter Status Kamar',
    description: 'Akses untuk memfilter kamar berdasarkan status',
    module: 'Peta Kamar',
    submenu: 'Filter',
    icon: '🔍',
  },

  // ===== MODULE: LOG PANGGILAN =====
  {
    id: 'perm-009',
    code: 'calls.view',
    name: 'Lihat Log Panggilan',
    description: 'Akses untuk melihat halaman log panggilan',
    module: 'Log Panggilan',
    icon: '📞',
  },
  {
    id: 'perm-010',
    code: 'calls.history',
    name: 'Riwayat Panggilan',
    description: 'Akses untuk melihat riwayat panggilan',
    module: 'Log Panggilan',
    submenu: 'Riwayat',
    icon: '📋',
  },
  {
    id: 'perm-011',
    code: 'calls.active',
    name: 'Panggilan Aktif',
    description: 'Akses untuk melihat daftar panggilan aktif',
    module: 'Log Panggilan',
    submenu: 'Aktif',
    icon: '🔴',
  },
  {
    id: 'perm-012',
    code: 'calls.search',
    name: 'Pencarian Panggilan',
    description: 'Akses untuk mencari dan memfilter panggilan',
    module: 'Log Panggilan',
    submenu: 'Pencarian',
    icon: '🔎',
  },
  {
    id: 'perm-013',
    code: 'calls.respond',
    name: 'Jawab Panggilan',
    description: 'Akses untuk menjawab panggilan nurse call',
    module: 'Log Panggilan',
    submenu: 'Respon',
    icon: '✅',
  },
  {
    id: 'perm-014',
    code: 'calls.export',
    name: 'Export Data',
    description: 'Akses untuk export data log panggilan',
    module: 'Log Panggilan',
    submenu: 'Export',
    icon: '📤',
  },

  // ===== MODULE: KELOLA AKUN =====
  {
    id: 'perm-015',
    code: 'accounts.view',
    name: 'Lihat Daftar Akun',
    description: 'Akses untuk melihat daftar akun pengguna',
    module: 'Kelola Akun',
    icon: '👥',
  },
  {
    id: 'perm-016',
    code: 'accounts.create',
    name: 'Tambah Akun',
    description: 'Akses untuk membuat akun pengguna baru',
    module: 'Kelola Akun',
    submenu: 'Tambah',
    icon: '➕',
  },
  {
    id: 'perm-017',
    code: 'accounts.edit',
    name: 'Edit Akun',
    description: 'Akses untuk mengedit data akun pengguna',
    module: 'Kelola Akun',
    submenu: 'Edit',
    icon: '✏️',
  },
  {
    id: 'perm-018',
    code: 'accounts.delete',
    name: 'Hapus Akun',
    description: 'Akses untuk menghapus akun pengguna',
    module: 'Kelola Akun',
    submenu: 'Hapus',
    icon: '🗑️',
  },
  {
    id: 'perm-019',
    code: 'accounts.permissions',
    name: 'Kelola Hak Akses',
    description: 'Akses untuk mengatur hak akses pengguna',
    module: 'Kelola Akun',
    submenu: 'Hak Akses',
    icon: '🔐',
  },
  {
    id: 'perm-020',
    code: 'accounts.toggle_status',
    name: 'Ubah Status Akun',
    description: 'Akses untuk mengaktifkan/menonaktifkan akun',
    module: 'Kelola Akun',
    submenu: 'Status',
    icon: '🔄',
  },

  // ===== MODULE: PENGATURAN =====
  {
    id: 'perm-021',
    code: 'settings.view',
    name: 'Lihat Pengaturan',
    description: 'Akses untuk melihat halaman pengaturan',
    module: 'Pengaturan',
    icon: '⚙️',
  },
  {
    id: 'perm-022',
    code: 'settings.general',
    name: 'Pengaturan Umum',
    description: 'Akses untuk mengubah pengaturan umum sistem',
    module: 'Pengaturan',
    submenu: 'Umum',
    icon: '🔧',
  },
  {
    id: 'perm-023',
    code: 'settings.notifications',
    name: 'Pengaturan Notifikasi',
    description: 'Akses untuk mengatur notifikasi sistem',
    module: 'Pengaturan',
    submenu: 'Notifikasi',
    icon: '🔔',
  },
  {
    id: 'perm-024',
    code: 'settings.backup',
    name: 'Backup & Restore',
    description: 'Akses untuk backup dan restore data',
    module: 'Pengaturan',
    submenu: 'Backup',
    icon: '💾',
  },

  // ===== MODULE: LAPORAN =====
  {
    id: 'perm-025',
    code: 'reports.view',
    name: 'Lihat Laporan',
    description: 'Akses untuk melihat halaman laporan',
    module: 'Laporan',
    icon: '📑',
  },
  {
    id: 'perm-026',
    code: 'reports.daily',
    name: 'Laporan Harian',
    description: 'Akses untuk melihat laporan harian',
    module: 'Laporan',
    submenu: 'Harian',
    icon: '📅',
  },
  {
    id: 'perm-027',
    code: 'reports.monthly',
    name: 'Laporan Bulanan',
    description: 'Akses untuk melihat laporan bulanan',
    module: 'Laporan',
    submenu: 'Bulanan',
    icon: '📆',
  },
  {
    id: 'perm-028',
    code: 'reports.performance',
    name: 'Laporan Kinerja',
    description: 'Akses untuk melihat laporan kinerja perawat',
    module: 'Laporan',
    submenu: 'Kinerja',
    icon: '🏆',
  },
];

// ============ STRUKTUR MENU ============
export const menuStructure: MenuPermission[] = [
  {
    menuId: 'dashboard',
    menuName: 'Dashboard',
    icon: 'LayoutDashboard',
    children: [
      { id: 'dashboard-stats', name: 'Statistik', permissionCode: 'dashboard.stats' },
      { id: 'dashboard-charts', name: 'Grafik', permissionCode: 'dashboard.charts' },
      { id: 'dashboard-active', name: 'Panggilan Aktif', permissionCode: 'dashboard.active_calls' },
    ],
  },
  {
    menuId: 'map',
    menuName: 'Peta Kamar',
    icon: 'Map',
    children: [
      { id: 'map-floor1', name: 'Lantai 1', permissionCode: 'map.floor1' },
      { id: 'map-detail', name: 'Detail Kamar', permissionCode: 'map.room_detail' },
      { id: 'map-filter', name: 'Filter Status', permissionCode: 'map.filter' },
    ],
  },
  {
    menuId: 'calls',
    menuName: 'Log Panggilan',
    icon: 'PhoneCall',
    children: [
      { id: 'calls-history', name: 'Riwayat', permissionCode: 'calls.history' },
      { id: 'calls-active', name: 'Panggilan Aktif', permissionCode: 'calls.active' },
      { id: 'calls-search', name: 'Pencarian', permissionCode: 'calls.search' },
      { id: 'calls-respond', name: 'Respon', permissionCode: 'calls.respond' },
      { id: 'calls-export', name: 'Export', permissionCode: 'calls.export' },
    ],
  },
  {
    menuId: 'accounts',
    menuName: 'Kelola Akun',
    icon: 'Users',
    children: [
      { id: 'accounts-list', name: 'Daftar Akun', permissionCode: 'accounts.view' },
      { id: 'accounts-create', name: 'Tambah Akun', permissionCode: 'accounts.create' },
      { id: 'accounts-edit', name: 'Edit Akun', permissionCode: 'accounts.edit' },
      { id: 'accounts-delete', name: 'Hapus Akun', permissionCode: 'accounts.delete' },
      { id: 'accounts-permissions', name: 'Hak Akses', permissionCode: 'accounts.permissions' },
      { id: 'accounts-status', name: 'Status Akun', permissionCode: 'accounts.toggle_status' },
    ],
  },
  {
    menuId: 'reports',
    menuName: 'Laporan',
    icon: 'FileText',
    children: [
      { id: 'reports-daily', name: 'Harian', permissionCode: 'reports.daily' },
      { id: 'reports-monthly', name: 'Bulanan', permissionCode: 'reports.monthly' },
      { id: 'reports-performance', name: 'Kinerja', permissionCode: 'reports.performance' },
    ],
  },
  {
    menuId: 'settings',
    menuName: 'Pengaturan',
    icon: 'Settings',
    children: [
      { id: 'settings-general', name: 'Umum', permissionCode: 'settings.general' },
      { id: 'settings-notifications', name: 'Notifikasi', permissionCode: 'settings.notifications' },
      { id: 'settings-backup', name: 'Backup', permissionCode: 'settings.backup' },
    ],
  },
];

// ============ PRESET PERMISSION PER ROLE ============
export const rolePermissionPresets: Record<UserRole, string[]> = {
  admin: allPermissions.map(p => p.code), // Admin punya semua akses
  head_nurse: [
    'dashboard.view', 'dashboard.stats', 'dashboard.charts', 'dashboard.active_calls',
    'map.view', 'map.floor1', 'map.room_detail', 'map.filter',
    'calls.view', 'calls.history', 'calls.active', 'calls.search', 'calls.respond', 'calls.export',
    'accounts.view', 'accounts.toggle_status',
    'reports.view', 'reports.daily', 'reports.monthly', 'reports.performance',
  ],
  nurse: [
    'dashboard.view', 'dashboard.stats', 'dashboard.active_calls',
    'map.view', 'map.floor1', 'map.room_detail',
    'calls.view', 'calls.history', 'calls.active', 'calls.respond',
  ],
  doctor: [
    'dashboard.view', 'dashboard.stats', 'dashboard.charts', 'dashboard.active_calls',
    'map.view', 'map.floor1', 'map.room_detail', 'map.filter',
    'calls.view', 'calls.history', 'calls.active', 'calls.respond',
    'reports.view', 'reports.daily', 'reports.monthly', 'reports.performance',
  ],
};

// ============ HELPER FUNCTIONS ============
export function hasPermission(userPermissions: string[], permissionCode: string): boolean {
  return userPermissions.includes(permissionCode);
}

export function hasMenuAccess(userPermissions: string[], menuId: string): boolean {
  const menu = menuStructure.find(m => m.menuId === menuId);
  if (!menu) return false;
  // Check if user has any permission in this menu
  const menuPermissions = allPermissions.filter(p => p.module === menu.menuName);
  return menuPermissions.some(p => userPermissions.includes(p.code));
}

export function getPermissionsByModule(permissions: Permission[]) {
  const grouped: Record<string, Permission[]> = {};
  permissions.forEach(p => {
    if (!grouped[p.module]) grouped[p.module] = [];
    grouped[p.module].push(p);
  });
  return grouped;
}
