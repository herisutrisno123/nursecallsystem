// API server untuk data klien & lisensi (MySQL)
import express from 'express';
import cors from 'cors';
import { getPool, initDb, rowToClient, rowToLicense, clientToRow, licenseToRow, testConnection } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error('[API]', err.message);
    res.status(500).json({ error: err.message });
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
    'INSERT INTO licenses (id,license_key,client_id,plan,max_devices,max_users,issue_date,status,activated_at,machine_fingerprint,modules,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    licenseToRow(l)
  );
  res.status(201).json(l);
}));

app.put('/api/licenses/:id', wrap(async (req, res) => {
  const p = await getPool();
  const l = { ...req.body, id: req.params.id };
  await p.query(
    'UPDATE licenses SET license_key=?,client_id=?,customer_name=?,customer_id=?,ward_count=?,plan=?,max_devices=?,max_users=?,issue_date=?,status=?,activated_at=?,machine_fingerprint=?,modules=?,notes=? WHERE id=?',
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

const PORT = process.env.API_PORT || 3001;

initDb()
  .then(() => {
    console.log('[DB] Tabel clients & licenses siap (dibuat otomatis bila belum ada).');
    app.listen(PORT, () => console.log(`[API] Server lisensi berjalan di http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[DB] Gagal menghubungkan MySQL:', err.message);
    console.error('     Periksa isi file .env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)');
    console.error('     dan pastikan service MySQL/XAMPP berjalan.');
    process.exit(1);
  });
