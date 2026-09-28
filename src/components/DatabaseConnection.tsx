import { useEffect, useState } from 'react';
import {
  Database,
  PlugZap,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Table2,
  Loader2,
  Info,
} from 'lucide-react';
import { testDbConnection, apiAvailable } from '../data/licenseData';
import type { DbTestResult, DbConfigInput } from '../data/licenseData';

interface Props {
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function DatabaseConnection({ onNotify }: Props) {
  const [cfg, setCfg] = useState<DbConfigInput>({ host: '', port: '', user: '', password: '', database: '' });
  const [showPass, setShowPass] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<DbTestResult | null>(null);
  const [autoChecking, setAutoChecking] = useState(true);

  // Cek otomatis saat halaman dibuka (pakai konfigurasi .env)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await testDbConnection();
      if (!cancelled) {
        setResult(r);
        setAutoChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasOverride = Object.values(cfg).some((v) => v !== undefined && v !== '');

  const runTest = async () => {
    setTesting(true);
    const r = await testDbConnection(hasOverride ? cfg : undefined);
    setResult(r);
    setTesting(false);
    if (r.connected) onNotify?.('Koneksi MySQL berhasil — database AKTIF');
    else onNotify?.(r.error || 'Koneksi MySQL gagal', 'error');
  };

  const status: 'ok' | 'warn' | 'down' = result?.connected
    ? 'ok'
    : result?.serverReachable
      ? 'warn'
      : 'down';

  const statusInfo = {
    ok: { label: 'AKTIF — Terhubung ke MySQL', cls: 'bg-green-50 border-green-300 text-green-800', icon: <CheckCircle2 className="w-7 h-7 text-green-600" /> },
    warn: { label: 'SERVER HIDUP — Koneksi database gagal', cls: 'bg-amber-50 border-amber-300 text-amber-800', icon: <AlertTriangle className="w-7 h-7 text-amber-600" /> },
    down: { label: 'TIDAK AKTIF — Tidak dapat terhubung', cls: 'bg-red-50 border-red-300 text-red-800', icon: <XCircle className="w-7 h-7 text-red-600" /> },
  }[status];

  return (
    <div className="space-y-6">
      {/* Header menu */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-700 p-2.5 rounded-xl">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Koneksi Database</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Uji koneksi ke MySQL dan periksa ketersediaan tabel aplikasi
          </p>
        </div>
      </div>

      {/* Kartu status */}
      <div className={`rounded-2xl border-2 p-5 flex items-start gap-4 ${statusInfo.cls}`}>
        <div className="shrink-0 mt-0.5">
          {autoChecking ? <Loader2 className="w-7 h-7 animate-spin text-blue-500" /> : statusInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold">{autoChecking ? 'Memeriksa koneksi…' : statusInfo.label}</p>
          {!autoChecking && result && (
            <div className="mt-1 text-sm space-y-1">
              <p>
                Target: <b>{result.config.host}:{result.config.port}</b> · user{' '}
                <b>{result.config.user}</b> · database <b>{result.config.database}</b>
              </p>
              {result.version && <p>Versi MySQL: {result.version}</p>}
              {result.latencyMs !== null && <p>Waktu respons: {result.latencyMs} ms</p>}
              {result.error && (
                <p className="font-medium break-words">Pesan error: {result.error}</p>
              )}
              {status === 'warn' && (
                <p className="text-xs mt-2">
                  Kemungkinan: nama database pada .env tidak sama dengan yang dibuat di phpMyAdmin, atau user
                  MySQL tidak memiliki hak akses. Pastikan database sudah dibuat di phpMyAdmin dengan nama sama seperti DB_NAME di .env — tabel akan dibuat otomatis oleh server saat menyala.
                </p>
              )}
            </div>
          )}
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/70 border border-current shrink-0">
          <span className={`w-2 h-2 rounded-full ${status === 'ok' ? 'bg-green-500' : status === 'warn' ? 'bg-amber-500' : 'bg-red-500'}`} />
          {apiAvailable() ? 'Mode MySQL' : 'Mode Lokal'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form uji koneksi */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
            <PlugZap className="w-5 h-5 text-blue-600" /> Uji Koneksi
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Kosongkan semua kolom untuk menguji memakai konfigurasi file <code className="px-1 bg-gray-100 dark:bg-gray-700 rounded">.env</code>.
            Isi kolom tertentu saja untuk menguji konfigurasi lain tanpa mengubah .env.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 text-sm">
              <span className="text-gray-600 dark:text-gray-300">Host</span>
              <input className={inputCls + ' mt-1'} placeholder="localhost" value={cfg.host ?? ''} onChange={(e) => setCfg({ ...cfg, host: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="text-gray-600 dark:text-gray-300">Port</span>
              <input className={inputCls + ' mt-1'} placeholder="3306" value={cfg.port ?? ''} onChange={(e) => setCfg({ ...cfg, port: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="text-gray-600 dark:text-gray-300">User MySQL</span>
              <input className={inputCls + ' mt-1'} placeholder="root" value={cfg.user ?? ''} onChange={(e) => setCfg({ ...cfg, user: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Password</span>
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-xs text-blue-600 hover:underline">
                  {showPass ? 'sembunyikan' : 'tampilkan'}
                </button>
              </span>
              <input type={showPass ? 'text' : 'password'} className={inputCls + ' mt-1'} placeholder="(kosong jika tanpa password)" value={cfg.password ?? ''} onChange={(e) => setCfg({ ...cfg, password: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="text-gray-600 dark:text-gray-300">Nama Database</span>
              <input className={inputCls + ' mt-1'} placeholder="nursecall_lisensi" value={cfg.database ?? ''} onChange={(e) => setCfg({ ...cfg, database: e.target.value })} />
            </label>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={runTest}
              disabled={testing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {testing ? 'Menguji…' : 'Uji Koneksi'}
            </button>

          </div>
        </div>

        {/* Hasil pemeriksaan */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Table2 className="w-5 h-5 text-indigo-600" /> Status Tabel Aplikasi
          </h3>
          {autoChecking ? (
            <p className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Memeriksa…</p>
          ) : !result || !result.connected ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <p className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> Database belum dapat diakses — daftar tabel tidak dapat diperiksa.</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-300 flex gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <ul className="list-disc pl-4 space-y-1">
                  <li>Pastikan MySQL/XAMPP berjalan (phpMyAdmin bisa dibuka).</li>
                  <li>Pastikan database dibuat di phpMyAdmin, namanya sama dengan DB_NAME di .env.</li>
                  <li>Jalankan server di folder proyek: <code>npm start</code> — aplikasi &amp; API berada di alamat yang sama (mis. http://localhost:3001). Bila memakai PM2: <code>pm2 start server/index.js --name nursecall-lisensi</code>.</li>
                  <li>Buka aplikasi dari alamat yang ditampilkan server (bukan lewat file .html atau port lain), agar otomatis terhubung ke API.</li>
                  <li>Tabel <b>clients</b> &amp; <b>licenses</b> dibuat otomatis oleh server saat pertama kali menyala.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(['clients', 'licenses'] as const).map((t) => {
                const exists = result.tables.includes(t);
                return (
                  <div key={t} className={`flex items-center justify-between rounded-lg border px-4 py-3 ${exists ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center gap-2">
                      {exists ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />}
                      <span className="font-mono text-sm font-semibold text-gray-800">{t}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {exists ? `ADA · ${result.counts[t] ?? 0} baris` : 'BELUM ADA'}
                    </span>
                  </div>
                );
              })}
              {result.tables.filter((t) => t !== 'clients' && t !== 'licenses').length > 0 && (
                <p className="text-xs text-gray-500">Tabel lain di database ini: {result.tables.join(', ')}</p>
              )}
              <p className="text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                {status === 'ok'
                  ? 'Aplikasi berjalan dalam mode MySQL — setiap perubahan Data Klien & Lisensi langsung tersimpan ke database.'
                  : 'Koneksi ke database terbatas; sebagian fitur mungkin memakai cache lokal.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
