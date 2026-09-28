import { Client, License } from '../types-license';

const CLIENTS_KEY = 'ncm_clients_v1';
const LICENSES_KEY = 'ncm_licenses_v3';

// ===== Data awal (seed) =====
const seedClients: Client[] = [
  {
    id: 'cli-001',
    name: 'RS Umum Sehat Selalu',
    contactPerson: 'Bpk. Ahmad Fauzi',
    email: 'it@rssehatselalu.co.id',
    phone: '021-7896543',
    address: 'Jl. Merdeka No. 45',
    city: 'Jakarta Selatan',
    npwp: '01.234.567.8-901.000',
    createdAt: '2025-03-15',
    notes: 'Pelanggan sejak 2023, 4 gedung terhubung.',
  },
  {
    id: 'cli-002',
    name: 'RSIA Bunda Keluarga',
    contactPerson: 'Ibu Rina Marlina, AMK',
    email: 'direksi@rsiabundakeluarga.go.id',
    phone: '0251-8321145',
    address: 'Jl. Raya Pajajaran No. 88',
    city: 'Bogor',
    npwp: '02.987.654.3-215.000',
    createdAt: '2025-07-02',
    notes: 'Fokus modul ICU & perinatologi.',
  },
  {
    id: 'cli-003',
    name: 'Klinik Harapan Bangsa',
    contactPerson: 'dr. Hendra Wijaya',
    email: 'admin@harapanbangsa.clinic',
    phone: '031-5567890',
    address: 'Jl. Darmo Indah Blok C2',
    city: 'Surabaya',
    npwp: '',
    createdAt: '2026-01-20',
    notes: 'Baru pindah dari lisensi trial.',
  },
];

const seedLicenses: License[] = [
  {
    id: 'lic-001',
    licenseKey: 'NCM-7KQ2-M4XB-P9RT',
    clientId: 'cli-001',
    customerName: 'RS Umum Sehat Selalu',
    customerId: 'CLI-0001',
    wardCount: 12,
    plan: 'enterprise',
    maxDevices: 250,
    maxUsers: 120,
    issueDate: '2026-01-01',
    status: 'active',
    activatedAt: '2026-01-05',
    machineFingerprint: 'SRV-RSS-2026-A1B2C3',
    modules: ['Dashboard Monitoring', 'Peta Lantai / Ruangan', 'Log Panggilan', 'Laporan & Analitik', 'Integrasi IoT Gateway', 'Notifikasi SMS / WhatsApp', 'Multi-Rumah Sakit', 'API Access'],
    notes: 'Perpanjangan tahunan, termasuk support prioritas 24/7.',
  },
  {
    id: 'lic-002',
    licenseKey: 'NCM-3HG8-TN5D-W2LM',
    clientId: 'cli-002',
    customerName: 'RSIA Bunda Keluarga',
    customerId: 'CLI-0002',
    wardCount: 6,
    plan: 'professional',
    maxDevices: 80,
    maxUsers: 40,
    issueDate: '2025-09-01',
    status: 'active',
    activatedAt: '2025-09-10',
    machineFingerprint: 'SRV-RSIA-BGR-9X8Y7Z',
    modules: ['Dashboard Monitoring', 'Peta Lantai / Ruangan', 'Log Panggilan', 'Laporan & Analitik', 'Integrasi IoT Gateway'],
    notes: 'Akan dinegosiasikan untuk upgrade ke Enterprise.',
  },
  {
    id: 'lic-003',
    licenseKey: 'NCM-QW41-8ZCV-K6PD',
    clientId: 'cli-003',
    customerName: 'Klinik Harapan Bangsa',
    customerId: 'CLI-0003',
    wardCount: 3,
    plan: 'basic',
    maxDevices: 20,
    maxUsers: 10,
    issueDate: '2025-06-01',
    status: 'expired',
    activatedAt: '2025-06-03',
    machineFingerprint: 'SRV-KHB-SBY-11AA22',
    modules: ['Dashboard Monitoring', 'Log Panggilan'],
    notes: 'Lisensi lama sudah kedaluwarsa — diganti lisensi baru.',
  },
  {
    id: 'lic-004',
    licenseKey: 'NCM-B5TR-9XHN-D3JK',
    clientId: 'cli-003',
    customerName: 'Klinik Harapan Bangsa',
    customerId: 'CLI-0003',
    wardCount: 3,
    plan: 'standard',
    maxDevices: 50,
    maxUsers: 25,
    issueDate: '2026-06-15',
    status: 'active',
    activatedAt: '2026-06-20',
    machineFingerprint: 'SRV-KHB-SBY-11AA22',
    modules: ['Dashboard Monitoring', 'Peta Lantai / Ruangan', 'Log Panggilan', 'Laporan & Analitik'],
    notes: 'Upgrade dari Basic setelah masa percobaan.',
  },
];

// ===== Sinkronisasi MySQL <-> localStorage =====
const API_BASE = 'http://localhost:3001';
const API_FLAG_KEY = 'ncm_api_available';

export function apiAvailable(): boolean {
  return localStorage.getItem(API_FLAG_KEY) === '1';
}

async function tryApi(path: string, init?: RequestInit): Promise<Response | null> {
  if (!apiAvailable()) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2500),
      ...init,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch {
    localStorage.removeItem(API_FLAG_KEY); // API mati -> kembali ke mode lokal
    return null;
  }
}

/** Cek apakah server API (MySQL) tersedia; panggil sekali saat aplikasi mulai */
export async function ensureApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/clients`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      localStorage.setItem(API_FLAG_KEY, '1');
      return true;
    }
  } catch {
    /* server API tidak jalan */
  }
  localStorage.removeItem(API_FLAG_KEY);
  return false;
}

/** Muat data dari MySQL bila API aktif; hasil selalu disimpan ke cache localStorage */
export async function fetchClients(): Promise<Client[]> {
  const res = await tryApi('/api/clients');
  if (res) {
    const data = (await res.json()) as Client[];
    saveClients(data);
    return data;
  }
  return loadClients();
}

export async function fetchLicenses(): Promise<License[]> {
  const res = await tryApi('/api/licenses');
  if (res) {
    const data = (await res.json()) as License[];
    saveLicenses(data);
    return data;
  }
  return loadLicenses();
}

/** Simpan (insert/update) satu klien, lalu kembalikan daftar terbaru */
export async function upsertClient(client: Client, isNew: boolean): Promise<Client[]> {
  const res = await tryApi('/api/clients', isNew ? { method: 'POST', body: JSON.stringify(client) } : undefined);
  if (!res && !isNew) await tryApi(`/api/clients/${client.id}`, { method: 'PUT', body: JSON.stringify(client) });
  return fetchClients();
}

/** Simpan (insert/update) satu lisensi, lalu kembalikan daftar terbaru */
export async function upsertLicense(license: License, isNew: boolean): Promise<License[]> {
  const res = await tryApi('/api/licenses', isNew ? { method: 'POST', body: JSON.stringify(license) } : undefined);
  if (!res && !isNew) await tryApi(`/api/licenses/${license.id}`, { method: 'PUT', body: JSON.stringify(license) });
  return fetchLicenses();
}

/** Hapus satu record, lalu kembalikan daftar terbaru */
export async function removeRecord(kind: 'clients' | 'licenses', id: string): Promise<unknown[]> {
  await tryApi(`/api/${kind}/${id}`, { method: 'DELETE' });
  return kind === 'clients' ? fetchClients() : fetchLicenses();
}

// ===== Menu "Koneksi Database" =====
export interface DbTestResult {
  connected: boolean;          // koneksi penuh ke database berhasil
  serverReachable: boolean;    // server MySQL hidup (walau database belum ada)
  latencyMs: number | null;
  version?: string;
  tables: string[];
  counts: Record<string, number>;
  error: string | null;
  config: { host: string; port: number; user: string; database: string };
}

export interface DbConfigInput {
  host?: string;
  port?: string | number;
  user?: string;
  password?: string;
  database?: string;
}

/** Uji koneksi MySQL via API server. Body kosong = pakai konfigurasi .env. */
export async function testDbConnection(input?: DbConfigInput): Promise<DbTestResult> {
  const body: Record<string, unknown> = {};
  if (input) {
    for (const [k, v] of Object.entries(input)) {
      if (v !== undefined && v !== '') body[k] = v;
    }
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/db/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return {
      connected: false, serverReachable: false, latencyMs: null,
      tables: [], counts: {},
      error: `Tidak dapat menghubungi API server di ${API_BASE}. Jalankan "npm run server" lebih dulu.`,
      config: { host: '-', port: 0, user: '-', database: '-' },
    };
  }
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    return {
      connected: false, serverReachable: false, latencyMs: null,
      tables: [], counts: {}, error: `Respons API tidak valid (HTTP ${res.status}) ${t}`.trim(),
      config: { host: '-', port: 0, user: '-', database: '-' },
    };
  }
  const data = (await res.json()) as DbTestResult;
  if (data.connected) localStorage.setItem(API_FLAG_KEY, '1');
  return data;
}

/** Buat tabel + seed data dari aplikasi (memanggil /api/db/init). */
export async function initDbTables(): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/db/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ===== CRUD Helpers (localStorage) =====

function read<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return [...seed];
    }
    return JSON.parse(raw) as T[];
  } catch {
    return [...seed];
  }
}

function write<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadClients(): Client[] {
  return read<Client>(CLIENTS_KEY, seedClients);
}

export function saveClients(clients: Client[]) {
  write(CLIENTS_KEY, clients);
}

export function loadLicenses(): License[] {
  return read<License>(LICENSES_KEY, seedLicenses);
}

export function saveLicenses(licenses: License[]) {
  write(LICENSES_KEY, licenses);
}

export function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}
