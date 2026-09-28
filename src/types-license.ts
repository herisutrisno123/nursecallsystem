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
  licenseKey: string;           // mis. NCM-XXXX-XXXX-XXXX (dibuat dari rumus, lihat buildLicenseKey)
  clientId: string;             // referensi ke Client
  customerName: string;         // nama pelanggan saat lisensi dibuat
  customerId: string;           // ID pelanggan
  wardCount: number;            // jumlah bangsal
  plan: LicensePlan;
  maxDevices: number;           // jumlah perangkat nurse call yang diizinkan
  maxUsers: number;             // jumlah user akun yang diizinkan
  issueDate: string;            // ISO date (tanggal terbit lisensi)
  status: LicenseStatus;
  activatedAt?: string;         // tanggal aktivasi pertama
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

// ----- Utilitas -----

/** Hash sederhana (FNV-1a 32-bit) -> angka bulat positif, deterministik */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Normalisasi teks: huruf besar, hanya A-Z0-9 */
const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

const ALNUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa 0/O/1/I agar mudah dibaca

/** Ambil 4 karakter (huruf/angka) dari angka hash secara deterministik */
const blockFrom = (num: number): string => {
  let n = num >>> 0;
  let out = '';
  for (let i = 0; i < 4; i++) {
    out = ALNUM[n % ALNUM.length] + out;
    n = Math.floor(n / (ALNUM.length * 7 + i));
  }
  return out;
};

/**
 * ===== RUMUS LICENSE KEY =====
 * Input : nama pelanggan, ID pelanggan, jumlah bangsal, kunci rahasia
 * Output: NCM-XXXX-XXXX-XXXX (deterministik — input sama selalu menghasilkan key sama)
 *
 * Blok 1 : hash (nama pelanggan + ID pelanggan)                    (mis. 4K7M)
 * Blok 2 : kode bangsal W + jumlah bangsal 3 digit                 (mis. W012 untuk 12 bangsal)
 * Blok 3 : checksum hash (blok 1-2 + kunci rahasia + data gabungan) (mis. K7QX)
 */
export function buildLicenseKey(
  customerName: string,
  customerId: string,
  wardCount: number,
  secretKey: string,
): string {
  const nName = norm(customerName);
  const nId = norm(customerId);
  const wards = Math.max(0, Math.floor(Number(wardCount) || 0));

  // Blok 1: hash nama + ID -> 4 karakter
  const b1 = blockFrom(fnv1a(`${nName}#${nId}`));

  // Blok 2: W + jumlah bangsal (maks 999)
  const b2 = `W${String(Math.min(wards, 999)).padStart(3, '0')}`;

  // Blok 3: checksum dari semua input + kunci rahasia
  const seed = `${b1}|${b2}|${secretKey.trim()}|${nName}${nId}`;
  let h = fnv1a(seed);
  let b3 = '';
  for (let i = 0; i < 4; i++) {
    b3 += ALNUM[h % ALNUM.length];
    h = fnv1a(b3 + secretKey + i);
  }

  return `NCM-${b1}-${b2}-${b3}`;
}

/** Baca jumlah bangsal dari blok ke-2 license key (format W###), null bila tidak valid */
export function wardCountFromKey(key: string): number | null {
  const m = key.trim().toUpperCase().match(/^NCM-[A-Z0-9]{4}-W(\d{3})-[A-Z0-9]{4}$/);
  return m ? Number(m[1]) : null;
}

/** Verifikasi apakah sebuah license key cocok dengan rumus untuk data tertentu */
export function verifyLicenseKey(
  key: string,
  customerName: string,
  customerId: string,
  wardCount: number,
  secretKey: string,
): boolean {
  return key.trim().toUpperCase() === buildLicenseKey(customerName, customerId, wardCount, secretKey);
}

/** Generate license key acak format NCM-XXXX-XXXX-XXXX */
export function generateLicenseKey(): string {
  const block = () =>
    Array.from({ length: 4 }, () => ALNUM[Math.floor(Math.random() * ALNUM.length)]).join('');
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
