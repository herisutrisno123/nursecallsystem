import { Client, License } from '../types-license';

const CLIENTS_KEY = 'ncm_clients_v1';
const LICENSES_KEY = 'ncm_licenses_v1';

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
    plan: 'enterprise',
    maxDevices: 250,
    maxUsers: 120,
    issueDate: '2026-01-01',
    expiryDate: '2026-12-31',
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
    plan: 'professional',
    maxDevices: 80,
    maxUsers: 40,
    issueDate: '2025-09-01',
    expiryDate: '2026-08-31',
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
    plan: 'basic',
    maxDevices: 20,
    maxUsers: 10,
    issueDate: '2025-06-01',
    expiryDate: '2026-05-31',
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
    plan: 'standard',
    maxDevices: 50,
    maxUsers: 25,
    issueDate: '2026-06-15',
    expiryDate: '2027-06-14',
    status: 'active',
    activatedAt: '2026-06-20',
    machineFingerprint: 'SRV-KHB-SBY-11AA22',
    modules: ['Dashboard Monitoring', 'Peta Lantai / Ruangan', 'Log Panggilan', 'Laporan & Analitik'],
    notes: 'Upgrade dari Basic setelah masa percobaan.',
  },
];

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
