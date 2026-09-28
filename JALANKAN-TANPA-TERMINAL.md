# Cara Menjalankan Aplikasi Tanpa Terminal Terbuka

Masalah: sebelumnya aplikasi butuh **2 terminal** (`npm run server` + `npm run dev`)
yang tidak boleh ditutup. Jika klien menutup terminal, aplikasi mati.

Berikut 3 solusi, dari yang paling mudah.

---

## Solusi 1 — Satu perintah saja (sudah terpasang di project ini)

Server API kini sekaligus **melayani halaman web hasil build**, sehingga
tidak perlu `npm run dev` sama sekali — cukup satu proses Node.

```bat
npm install          :: hanya sekali
npm start            :: build + jalankan server (1 perintah)
```

Buka browser ke: **http://localhost:3001**

Terminal memang masih harus terbuka. Untuk menutupnya tanpa mematikan
aplikasi, gunakan salah satu cara di bawah.

### 1a. Double-click file `start-app.vbs` (Windows, tanpa jendela hitam)
Klik dua kali file `start-app.vbs` yang ada di folder project.
Aplikasi berjalan di latar belakang **tanpa terminal terlihat**.
Cara menghentikan: klik kanan taskbar → Task Manager → hentikan proses
"Node.js" / `node.exe`.

### 1b. Perintah CMD (proses berjalan detached)
```bat
start /min "Nursecall Lisensi" cmd /c npm start
```
Jendela muncul dalam keadaan minimized — boleh dibiarkan, tidak akan
mengganggu. Menutup jendela = menghentikan aplikasi.

---

## Solusi 2 — PM2 (rekomendasi untuk pemakaian jangka panjang)

PM2 menjalankan aplikasi sebagai **proses latar belakang yang auto-restart**:
terminal boleh ditutup, aplikasi tetap jalan; jika aplikasi crash atau
laptop restart, PM2 menyalakannya kembali.

```bat
:: 1. Install pm2 secara global (sekali saja)
npm install -g pm2

:: 2. Build frontend sekali (hasilnya di dist/, dilayani oleh server)
npm run build

:: 3. Jalankan lewat pm2 (bisa juga: npm run pm2:start)
pm2 start server/index.js --name nursecall-lisensi

:: 4. Agar otomatis hidup saat laptop dinyalakan
npm install -g pm2-windows-startup
pm2-startup install
pm2 save
```

Perintah berguna lainnya:

| Perintah | Fungsi |
|---|---|
| `pm2 status` | melihat daftar aplikasi & statusnya |
| `pm2 logs nursecall-lisensi` | melihat log realtime |
| `pm2 restart nursecall-lisensi` | restart manual |
| `pm2 stop nursecall-lisensi` | berhenti (proses tetap terdaftar) |
| `pm2 delete nursecall-lisensi` | hapus dari daftar pm2 |

Setelah langkah di atas, buka **http://localhost:3001** dari browser mana pun.

### ⚠️ Muncul pesan "Tidak dapat menghubungi API server di http://localhost:3001"?
Artinya browser tidak menemukan server pada port 3001. Penyebab yang sering terjadi
saat memakai PM2:

1. **Dua server berjalan bersamaan.** Instance PM2 dan `npm run server`/`npm start`
   manual berebut port — yang kedua langsung mati dengan pesan
   `PORT 3001 SUDAH DIPAKAI proses lain`. Solusi: jalankan hanya SATU cara.
   Hentikan salah satunya:
   ```bat
   pm2 delete nursecall-lisensi      :: hapus versi PM2, ATAU
   taskkill /IM node.exe /F          :: matikan semua node lalu mulai ulang PM2 saja
   ```
2. **Aplikasi dibuka lewat alamat lain** (mis. `npm run dev` di port 5173/3000,
   file `.html` langsung, atau IP komputer lain). Versi terbaru sudah otomatis
   mengarahkan API ke alamat yang sama dengan halaman dibuka — tetap disarankan
   membuka aplikasi dari **http://localhost:3001** hasil `npm start`/PM2.
3. **Cek cepat:** buka `http://localhost:3001/api/health` di browser. Jika muncul
   `{"ok":true,...}` berarti server hidup; jika ditolak, server belum jalan di
   port itu (`pm2 logs nursecall-lisensi` untuk melihat errornya).
4. **Firewall Windows** memblokir node.exe → izinkan saat diminta, atau gunakan
   port lain dengan mengubah `API_PORT` di `.env` (server kini membaca nilai itu
   langsung dari file `.env`, meski dijalankan lewat PM2).

---

## Solusi 3 — Jadikan Service Windows (opsional, paling "server")

Jika ingin aplikasi hidup meski user belum login:

1. Install [NSSM](https://nssm.cc/download) (Non-Sucking Service Manager).
2. `nssm install NursecallLisensi`
   - Path: `C:\Program Files\nodejs\node.exe`
   - Startup directory: folder project
   - Arguments: `server\index.js`
3. `net start NursecallLisensi`

Service berjalan otomatis setiap laptop dinyalakan, tanpa terminal sama sekali.

---

## Ringkasan cepat untuk klien

| Situasi | Yang dilakukan |
|---|---|
| Pakai sehari-hari, praktis | Double-click `start-app.vbs`, buka http://localhost:3001 |
| Dipakai rutin / kantor | Solusi 2 (PM2) — tahan tutup terminal & auto-restart |
| Dedicated PC/laptop server | Solusi 3 (service via NSSM) |

Catatan: MySQL/XAMPP juga perlu jalan. Di XAMPP Control Panel, aktifkan
modul **MySQL** dan centang *Admin* agar service ikut menyala bersama Windows.
