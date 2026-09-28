// API server untuk data klien & lisensi (MySQL)
import express from 'express';
import cors from 'cors';
import { getPool, initDb, rowToClient, rowToLicense, clientToRow, licenseToRow, testConnection } from './db.js';

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// ---- Sajikan hasil build produksi (dist/) dari server yang sama ----
// Dengan ini aplikasi cukup dijalankan SATU perintah (npm start) dan
// bisa diakses lewat http://localhost:3001 — tanpa terminal vite dev.
const distDir = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error('[API]', err.message);
    res.status(500).json({ error: err.message });
  });

// ---- Health check ringan (dipakai frontend untuk membedakan
//      "API server mati" vs "API hidup tapi MySQL bermasalah") ----
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'nursecall-lisensi-api', time: new Date().toISOString() });
});

// ---- Clients ----
app.get('/api/clients', wrap(async (req, res) => {
  const p = await getPool();
  const [rows] = await p.query('SELECT * FROM clients ORDER BY created_at DESC');
  res.json(rows.map(rowToClient));
}));

app.post('/api/clients', wrap(async (req, res) => {
  const p = await getPool();
  const c = req.body;
  await p.query(
    'INSERT INTO clients (id,name,contact_person,email,phone,address,city,npwp,created_at,notes) VALUES (?,?,?,?,?,?,?,?,?,?)',
    clientToRow(c)
  );
  res.status(201).json(c);
}));

app.put('/api/clients/:id', wrap(async (req, res) => {
  const p = await getPool();
  const c = { ...req.body, id: req.params.id };
  await p.query(
    'UPDATE clients SET name=?,contact_person=?,email=?,phone=?,address=?,city=?,npwp=?,created_at=?,notes=? WHERE id=?',
    [...clientToRow(c).slice(1), c.id]
  );
  res.json(c);
}));

app.delete('/api/clients/:id', wrap(async (req, res) => {
  const p = await getPool();
  await p.query('DELETE FROM clients WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

// ---- Licenses ----
app.get('/api/licenses', wrap(async (req, res) => {
  const p = await getPool();
  const [rows] = await p.query('SELECT * FROM licenses ORDER BY issue_date DESC');
  res.json(rows.map(rowToLicense));
}));

app.post('/api/licenses', wrap(async (req, res) => {
  const p = await getPool();
  const l = req.body;
  await p.query(
    'INSERT INTO licenses (id,license_key,client_id,customer_name,customer_id,ward_count,plan,max_devices,max_users,issue_date,status,activated_at,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    licenseToRow(l)
  );
  res.status(201).json(l);
}));

app.put('/api/licenses/:id', wrap(async (req, res) => {
  const p = await getPool();
  const l = { ...req.body, id: req.params.id };
  await p.query(
    'UPDATE licenses SET license_key=?,client_id=?,customer_name=?,customer_id=?,ward_count=?,plan=?,max_devices=?,max_users=?,issue_date=?,status=?,activated_at=?,notes=? WHERE id=?',
    [...licenseToRow(l).slice(1), l.id]
  );
  res.json(l);
}));

app.delete('/api/licenses/:id', wrap(async (req, res) => {
  const p = await getPool();
  await p.query('DELETE FROM licenses WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

// ---- Test Koneksi Database (menu "Koneksi Database") ----
// POST /api/db/test  body opsional: { host, port, user, password, database }
// Jika body diisi → uji ke konfigurasi tersebut; jika kosong → uji dari file .env.
app.post('/api/db/test', wrap(async (req, res) => {
  const b = req.body || {};
  const hasOverride = ['host', 'port', 'user', 'password', 'database'].some(
    (k) => b[k] !== undefined && b[k] !== '' && b[k] !== null
  );
  let result;
  if (hasOverride) {
    // Simpan sementara override ke environment agar dbConfig() memakainya
    const prev = {};
    for (const k of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) prev[k] = process.env[k];
    if (b.host !== undefined && b.host !== '') process.env.DB_HOST = b.host;
    if (b.port !== undefined && b.port !== '') process.env.DB_PORT = String(b.port);
    if (b.user !== undefined && b.user !== '') process.env.DB_USER = b.user;
    if (b.password !== undefined) process.env.DB_PASSWORD = b.password;
    if (b.database !== undefined && b.database !== '') process.env.DB_NAME = b.database;
    result = await testConnection({ connectToServer: true });
    for (const k of Object.keys(prev)) {
      if (prev[k] === undefined) delete process.env[k]; else process.env[k] = prev[k];
    }
  } else {
    result = await testConnection({ connectToServer: true });
  }
  res.json(result);
}));

// Inisialisasi ulang tabel + seed data dari menu aplikasi
app.post('/api/db/init', wrap(async (req, res) => {
  await initDb();
  res.json({ ok: true });
}));

// Baca API_PORT dari .env juga (bukan hanya environment) — penting saat dijalankan
// lewat PM2 yang kadang tidak mewarisi variabel .env.
let apiPortFromEnvFile = null;
try {
  const envTxt = fs.readFileSync(path.resolve(__dirname, '..', '.env'), 'utf8');
  const m = envTxt.match(/^\s*API_PORT\s*=\s*(.+)$/m);
  if (m) apiPortFromEnvFile = parseInt(m[1].trim(), 10) || null;
} catch { /* .env opsional */ }
const PORT = Number(process.env.PORT) || apiPortFromEnvFile || 3001;

// ---- SPA fallback: semua route non-API dilayani dari index.html hasil build ----
if (fs.existsSync(distDir)) {
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// ---- Agar server tetap AKTIF walau MySQL sedang mati ----
// 1) API listen langsung; initDb dicoba berkala di latar belakang.
const httpServer = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API] Server lisensi berjalan di http://localhost:${PORT}`);
  if (fs.existsSync(distDir)) {
    console.log('[API] Aplikasi web siap dibuka di  ->  http://localhost:' + PORT);
    console.log('      (satu server untuk web + API, tanpa perlu "npm run dev")');
  } else {
    console.log('[API] Catatan: folder dist/ belum ada. Jalankan "npm run build" bila ingin');
    console.log('      aplikasi web ikut dilayani oleh server ini.');
  }
});

// Jika port sudah dipakai proses lain (mis. "npm run server" manual berjalan
// bersamaan dengan instance PM2), tampilkan pesan yang jelas alih-alih crash diam-diam.
httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[API] PORT ${PORT} SUDAH DIPAKAI proses lain.`);
    console.error('      Kemungkinan "npm run server"/"npm start" manual masih berjalan');
    console.error('      berdampingan dengan instance PM2. Hentikan salah satu:');
    console.error('        npm run pm2:stop   (hentikan versi PM2), ATAU');
    console.error('        tutup terminal server manual / Ctrl+C.');
    console.error('      Lalu jalankan ulang hanya SATU cara.');
    process.exit(1);
  } else {
    console.error('[API] Gagal memulai server:', err.message);
    process.exit(1);
  }
});

let dbReady = false;
async function tryInit(retry = 0) {
  try {
    await initDb();
    if (!dbReady) console.log('[DB] Tabel clients & licenses siap (dibuat otomatis bila belum ada).');
    dbReady = true;
  } catch (err) {
    dbReady = false;
    if (retry === 0) {
      console.error('[DB] Gagal menghubungkan MySQL:', err.message);
      console.error('     API TETAP berjalan — tabel akan dibuat otomatis begitu MySQL aktif.');
      console.error('     Periksa isi file .env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)');
      console.error('     dan pastikan service MySQL/XAMPP berjalan.');
    }
    setTimeout(() => tryInit(retry + 1), 15000); // coba lagi tiap 15 detik
  }
}
tryInit();

// 2) Error query yang gagal (mis. MySQL dimatikan saat server jalan)
//    tidak boleh menghentikan proses Node.
process.on('unhandledRejection', (err) => {
  console.error('[API] Rejected promise tak tertangani (kemungkinan MySQL putus):', err?.message || err);
});
process.on('uncaughtException', (err) => {
  console.error('[API] Exception tak tertangkap (server tetap hidup):', err?.message || err);
});

// 3) Jika pool lama rusak (MySQL restart), pool akan dibuat ulang
//    secara otomatis oleh getPool() setelah resetPool() dipanggil dari db.js.
