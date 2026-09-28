// Koneksi MySQL + auto-create tabel saat server dinyalakan
import mysql from 'mysql2/promise';
import fs from 'fs';

let pool = null;

/** Buang pool lama (mis. setelah MySQL restart) agar getPool() membuat koneksi baru */
export function resetPool() {
  if (pool) {
    try { pool.end().catch(() => {}); } catch {}
    pool = null;
  }
}

function isFatalDbError(err) {
  return ['PROTOCOL_CONNECTION_LOST', 'ECONNREFUSED', 'ER_SERVER_SHUTDOWN', 'CONN_NOT_AVAILABLE', 'POOL_CLOSED'].includes(err?.code);
}

function loadEnvFile() {
  try {
    const txt = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
    const env = {};
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/i);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
    return env;
  } catch {
    return {};
  }
}

/** Baca konfigurasi MySQL dari environment / file .env */
export function dbConfig() {
  const f = loadEnvFile();
  return {
    host: process.env.DB_HOST || f.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || f.DB_PORT || 3306),
    user: process.env.DB_USER || f.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? f.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || f.DB_NAME || 'nursecall_lisensi',
  };
}

export async function getPool() {
  if (pool) return pool;
  pool = await mysql.createPool({ ...dbConfig(), waitForConnections: true, connectionLimit: 10 });
  // Jika koneksi pool putus (MySQL dimatikan/restart), buang pool lama
  // agar permintaan berikutnya otomatis membuat koneksi baru.
  pool.on('connection', (conn) => {
    conn.on('error', (err) => {
      if (isFatalDbError(err)) resetPool();
    });
  });
  return pool;
}

/**
 * Uji koneksi ke server MySQL TANPA memakai pool yang di-cache —
 * dipakai oleh endpoint /api/db/test pada menu "Koneksi Database".
 * connectToServer=true → cek ping ke server MySQL (tanpa memilih database),
 * sehingga tetap terdeteksi "aktif" walau database belum dibuat.
 */
export async function testConnection(opts = {}) {
  const { connectToServer = false } = opts;
  const cfg = dbConfig();
  const t0 = Date.now();
  const out = { config: { ...cfg, password: undefined }, latencyMs: null, connected: false, serverReachable: false, tables: [], counts: {}, error: null };
  let conn = null;
  try {
    conn = await mysql.createConnection({ ...cfg, connectTimeout: 4000 });
    out.connected = true;
    out.serverReachable = true;
    const [ping] = await conn.query('SELECT VERSION() AS v');
    out.version = ping[0].v;
    const [tbls] = await conn.query(
      'SELECT TABLE_NAME AS t FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
      [cfg.database]
    );
    out.tables = tbls.map((r) => r.t);
    for (const t of ['clients', 'licenses']) {
      if (out.tables.includes(t)) {
        const [[row]] = await conn.query(`SELECT COUNT(*) AS n FROM \`${t}\``);
        out.counts[t] = Number(row.n);
      }
    }
  } catch (err) {
    out.error = err.message;
    if (isFatalDbError(err)) resetPool(); // pool lama mungkin rusak, buat ulang di request berikutnya
    if (connectToServer && err.code === 'ER_BAD_DB_ERROR') {
      // Database belum ada, tapi server MySQL-nya hidup — coba ping tanpa database
      out.serverReachable = true;
      try {
        const noDb = { ...cfg, database: undefined };
        const c2 = await mysql.createConnection({ ...noDb, connectTimeout: 4000 });
        const [p2] = await c2.query('SELECT VERSION() AS v');
        out.version = p2[0].v;
        await c2.end();
      } catch {
        /* abaikan */
      }
    }
  } finally {
    out.latencyMs = Date.now() - t0;
    if (conn) {
      try { await conn.end(); } catch { /* abaikan */ }
    }
  }
  return out;
}

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS clients (
     id VARCHAR(40) PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     contact_person VARCHAR(255) NOT NULL DEFAULT '',
     email VARCHAR(255) NOT NULL DEFAULT '',
     phone VARCHAR(100) NOT NULL DEFAULT '',
     address VARCHAR(500) NOT NULL DEFAULT '',
     city VARCHAR(150) NOT NULL DEFAULT '',
     npwp VARCHAR(50) NOT NULL DEFAULT '',
     created_at DATE NULL,
     notes TEXT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS licenses (
     id VARCHAR(40) PRIMARY KEY,
     license_key VARCHAR(40) NOT NULL UNIQUE,
     client_id VARCHAR(40) NOT NULL,
     customer_name VARCHAR(255) NOT NULL DEFAULT '',
     customer_id VARCHAR(80) NOT NULL DEFAULT '',
     ward_count INT NOT NULL DEFAULT 0,
     plan VARCHAR(30) NOT NULL DEFAULT 'standard',
     max_devices INT NOT NULL DEFAULT 1,
     max_users INT NOT NULL DEFAULT 1,
     issue_date DATE NOT NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'active',
     activated_at DATE NULL,
     machine_fingerprint VARCHAR(255) NULL,
     modules TEXT NULL,
     notes TEXT NULL,
     INDEX idx_client (client_id),
     CONSTRAINT fk_licenses_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

const SEED_CLIENTS = [
  ['cli-001', 'RS Umum Sehat Selalu', 'Bpk. Ahmad Fauzi', 'it@rssehatselalu.co.id', '021-7896543', 'Jl. Merdeka No. 45', 'Jakarta Selatan', '01.234.567.8-901.000', '2025-03-15', 'Pelanggan sejak 2023, 4 gedung terhubung.'],
  ['cli-002', 'RSIA Bunda Keluarga', 'Ibu Rina Marlina, AMK', 'direksi@rsiabundakeluarga.go.id', '0251-8321145', 'Jl. Raya Pajajaran No. 88', 'Bogor', '02.987.654.3-215.000', '2025-07-02', 'Fokus modul ICU & perinatologi.'],
  ['cli-003', 'Klinik Harapan Bangsa', 'dr. Hendra Wijaya', 'admin@harapanbangsa.clinic', '031-5567890', 'Jl. Darmo Indah Blok C2', 'Surabaya', '', '2026-01-20', 'Baru pindah dari lisensi trial.'],
];

const SEED_LICENSES = [
  ['lic-001', 'NCM-7KQ2-M4XB-P9RT', 'cli-001', 'RS Umum Sehat Selalu', 'CLI-0001', 12, 'enterprise', 250, 120, '2026-01-01', 'active', '2026-01-05', 'SRV-RSS-2026-A1B2C3', JSON.stringify(['Dashboard Monitoring', 'Peta Lantai / Ruangan', 'Log Panggilan', 'Laporan & Analitik', 'Integrasi IoT Gateway', 'Notifikasi SMS / WhatsApp', 'Multi-Rumah Sakit', 'API Access']), 'Perpanjangan tahunan, termasuk support prioritas 24/7.'],
  ['lic-002', 'NCM-3HG8-TN5D-W2LM', 'cli-002', 'RSIA Bunda Keluarga', 'CLI-0002', 6, 'professional', 80, 40, '2025-09-01', 'active', '2025-09-10', 'SRV-RSIA-BGR-9X8Y7Z', JSON.stringify(['Dashboard Monitoring', 'Peta Lantai / Ruangan', 'Log Panggilan', 'Laporan & Analitik', 'Integrasi IoT Gateway']), 'Akan dinegosiasikan untuk upgrade ke Enterprise.'],
  ['lic-003', 'NCM-QW41-8ZCV-K6PD', 'cli-003', 'Klinik Harapan Bangsa', 'CLI-0003', 3, 'basic', 20, 10, '2025-06-01', 'expired', '2025-06-03', 'SRV-KHB-SBY-11AA22', JSON.stringify(['Dashboard Monitoring', 'Log Panggilan']), 'Lisensi lama sudah kedaluwarsa — diganti lisensi baru.'],
  ['lic-004', 'NCM-B5TR-9XHN-D3JK', 'cli-003', 'Klinik Harapan Bangsa', 'CLI-0003', 3, 'standard', 50, 25, '2026-06-15', 'active', '2026-06-20', 'SRV-KHB-SBY-11AA22', JSON.stringify(['Dashboard Monitoring', 'Peta Lantai / Ruangan', 'Log Panggilan', 'Laporan & Analitik']), 'Upgrade dari Basic setelah masa percobaan.'],
];


/** Tambah kolom baru bila tabel lama belum memilikinya (migrasi ringan) */
async function ensureColumns(p) {
  const wanted = [
    ['customer_name', "VARCHAR(255) NOT NULL DEFAULT ''"],
    ['customer_id', "VARCHAR(80) NOT NULL DEFAULT ''"],
    ['ward_count', 'INT NOT NULL DEFAULT 0'],
  ];
  const [cols] = await p.query('SHOW COLUMNS FROM licenses');
  const have = new Set(cols.map(c => c.Field));
  for (const [name, def] of wanted) {
    if (!have.has(name)) {
      await p.query(`ALTER TABLE licenses ADD COLUMN ${name} ${def}`);
      console.log(`[DB] Kolom lisensi.licenses.${name} ditambahkan.`);
    }
  }
}

/** Buat tabel jika belum ada + isi data awal hanya jika tabel kosong */
export async function initDb() {
  const p = await getPool();
  for (const sql of CREATE_TABLES) await p.query(sql);
  await ensureColumns(p);

  const [[{ n: nClients }]] = await p.query('SELECT COUNT(*) AS n FROM clients');
  if (nClients === 0) {
    await p.query(
      'INSERT INTO clients (id,name,contact_person,email,phone,address,city,npwp,created_at,notes) VALUES ?',
      [SEED_CLIENTS]
    );
  }
  const [[{ n: nLicenses }]] = await p.query('SELECT COUNT(*) AS n FROM licenses');
  if (nLicenses === 0) {
    await p.query(
      'INSERT INTO licenses (id,license_key,client_id,customer_name,customer_id,ward_count,plan,max_devices,max_users,issue_date,status,activated_at,machine_fingerprint,modules,notes) VALUES ?',
      [SEED_LICENSES]
    );
  }
}

// ===== Konversi baris DB <-> objek frontend (camelCase) =====
export function rowToClient(r) {
  return {
    id: r.id,
    name: r.name,
    contactPerson: r.contact_person || '',
    email: r.email || '',
    phone: r.phone || '',
    address: r.address || '',
    city: r.city || '',
    npwp: r.npwp || '',
    createdAt: r.created_at ? String(r.created_at).slice(0, 10) : '',
    notes: r.notes || undefined,
  };
}

export function rowToLicense(r) {
  let modules = [];
  try { modules = r.modules ? JSON.parse(r.modules) : []; } catch { modules = []; }
  return {
    id: r.id,
    licenseKey: r.license_key,
    clientId: r.client_id,
    customerName: r.customer_name || '',
    customerId: r.customer_id || '',
    wardCount: Number(r.ward_count || 0),
    plan: r.plan,
    maxDevices: Number(r.max_devices),
    maxUsers: Number(r.max_users),
    issueDate: r.issue_date ? String(r.issue_date).slice(0, 10) : '',
    status: r.status,
    activatedAt: r.activated_at ? String(r.activated_at).slice(0, 10) : undefined,
    machineFingerprint: r.machine_fingerprint || undefined,
    modules,
    notes: r.notes || undefined,
  };
}

const d = (s) => (s ? String(s).slice(0, 10) : null);

export function clientToRow(c) {
  return [c.id, c.name, c.contactPerson || '', c.email || '', c.phone || '', c.address || '', c.city || '', c.npwp || '', d(c.createdAt), c.notes || null];
}

export function licenseToRow(l) {
  return [l.id, l.licenseKey, l.clientId, l.customerName || '', l.customerId || '', l.wardCount || 0, l.plan, l.maxDevices, l.maxUsers, d(l.issueDate), l.status, d(l.activatedAt), l.machineFingerprint || null, JSON.stringify(l.modules || []), l.notes || null];
}
