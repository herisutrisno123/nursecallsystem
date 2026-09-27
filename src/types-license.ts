// ===== Tipe Data untuk Lisensi & Klien Nursecall Monitor =====

export type LicenseStatus = 'active' | 'expired' | 'suspended';
export type LicensePlan = 'trial' | 'basic' | 'standard' | 'professional' | 'enterprise';

export interface Client {
  id: string;
  name: string;                 // Nama rumah sakit / klinik
  contactPerson: string;        // PIC
  email: string;
  phone: string;
  address: string;
  city: string;
  npwp: string;                 // NPWP klien (opsional)
  createdAt: string;            // ISO date
  notes?: string;
}

export interface License {
  id: string;
  licenseKey: string;           // mis. NCM-XXXX-XXXX-XXXX
  clientId: string;             // referensi ke Client
  plan: LicensePlan;
  maxDevices: number;           // jumlah perangkat nurse call yang diizinkan
  maxUsers: number;             // jumlah user akun yang diizinkan
  issueDate: string;            // ISO date
  expiryDate: string;           // ISO date
  status: LicenseStatus;
  activatedAt?: string;         // tanggal aktivasi pertama
  machineFingerprint?: string;  // fingerprint server klien
  modules: string[];            // modul yang diaktifkan
  notes?: string;
}

export const PLAN_LABELS: Record<LicensePlan, string> = {
  trial: 'Trial',
  basic: 'Basic',
  standard: 'Standard',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

export const PLAN_COLORS: Record<LicensePlan, string> = {
  trial: 'bg-gray-100 text-gray-700 border-gray-200',
  basic: 'bg-sky-100 text-sky-700 border-sky-200',
  standard: 'bg-blue-100 text-blue-700 border-blue-200',
  professional: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  enterprise: 'bg-purple-100 text-purple-700 border-purple-200',
};

export const STATUS_LABELS: Record<LicenseStatus, string> = {
  active: 'Aktif',
  expired: 'Kedaluwarsa',
  suspended: 'Ditangguhkan',
};

export const STATUS_COLORS: Record<LicenseStatus, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  expired: 'bg-red-100 text-red-700 border-red-200',
  suspended: 'bg-amber-100 text-amber-700 border-amber-200',
};

export const MODULE_OPTIONS = [
  'Dashboard Monitoring',
  'Peta Lantai / Ruangan',
  'Log Panggilan',
  'Laporan & Analitik',
  'Integrasi IoT Gateway',
  'Notifikasi SMS / WhatsApp',
  'Multi-Rumah Sakit',
  'API Access',
] as const;

// ----- Utilitas -----

/** Hitung sisa hari lisensi terhadap tanggal tertentu */
export function daysUntilExpiry(license: License, from: Date = new Date()): number {
  const expiry = new Date(license.expiryDate + 'T23:59:59');
  return Math.ceil((expiry.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

/** Status efektif (expired otomatis jika tanggal lewat) */
export function effectiveStatus(license: License): LicenseStatus {
  if (license.status === 'suspended') return 'suspended';
  return daysUntilExpiry(license) < 0 ? 'expired' : 'active';
}

/** Generate license key acak format NCM-XXXX-XXXX-XXXX */
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `NCM-${block()}-${block()}-${block()}`;
}

/** Format tanggal Indonesia (dd MMM yyyy) */
export function formatDateID(iso: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
