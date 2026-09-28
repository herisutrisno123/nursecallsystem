# 📄 Rumus Pembuatan License Key — Aplikasi Nursecall Monitor

> File referensi resmi. Implementasi kode: `src/types-license.ts` (fungsi `buildLicenseKey`).
> UI pembuatan: menu **Kelola Lisensi → Buat Lisensi Baru** (`src/components/LicenseManager.tsx`).

---

## 1. Ringkasan

License key dibuat **secara deterministik** dari 4 data input:

| # | Data Input          | Contoh Nilai              |
|---|---------------------|---------------------------|
| 1 | Nama Pelanggan      | RS Umum Sehat Selalu      |
| 2 | ID Pelanggan        | CLI-0042                  |
| 3 | Jumlah Bangsal      | 12                        |
| 4 | Kunci Rahasia       | RAHASIA123                |

**Format hasil:** `NCM-XXXX-XXXX-XXXX`

Sifat penting:
- **Deterministik** — input yang sama selalu menghasilkan key yang sama (bisa dihitung ulang / diverifikasi kapan pun).
- **Tidak acak** — key tidak disimpan sebagai rahasia terpisah; cukup simpan 4 datanya.

---

## 2. Rumus Tiap Blok

### Blok 1 — Identitas Pelanggan (4 karakter)
```
Blok1 = blockFrom( FNV1a( normalisasi(nama) + "#" + normalisasi(ID) ) )
```
- Normalisasi: ubah ke huruf besar, buang semua karakter selain `A-Z` dan `0-9`.
- Contoh: `"RS Umum Sehat Selalu"` → `RSUMUMSEHATSALAU`; `"CLI-0042"` → `CLI0042`.
- String yang di-hash: `RSUMUMSEHATSALAU#CLI0042`.

### Blok 2 — Jumlah Bangsal (4 karakter)
```
Blok2 = "W" + padStart(jumlahBangsal, 3 digit, '0')     // maks 999
```
- Contoh: 12 bangsal → `W012`, 5 bangsal → `W005`, 150 bangsal → `W150`.
- Blok ini bisa dibaca langsung untuk mengetahui jumlah bangsal tanpa menghitung ulang.

### Blok 3 — Checksum dengan Kunci Rahasia (4 karakter)
```
seed  = Blok1 + "|" + Blok2 + "|" + kunciRahasia + "|" + normalisasi(nama) + normalisasi(ID)
h     = FNV1a(seed)
Ulangi 4 kali:
    karakter += ALNUM[h mod 32]
    h = FNV1a(karakter_sementara + kunciRahasia + index)
Blok3 = karakter (4 buah)
```
- Blok inilah yang membuat kunci rahasia berpengaruh — kunci berbeda ⇒ checksum berbeda ⇒ key ditolak saat verifikasi.

### Gabungan
```
LICENSE KEY = "NCM-" + Blok1 + "-" + Blok2 + "-" + Blok3
```

---

## 3. Detail Teknis Algoritma

### Hash FNV-1a (32-bit)
```js
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
```

### Alphabet yang dipakai (32 karakter)
```
ABCDEFGHJKLMNPQRSTUVWXYZ23456789
```
Huruf/angka **0, O, I, 1 dikecualikan** agar key mudah dibaca & diketik ulang tanpa ambigu.

### Konversi angka hash → 4 karakter
```js
const blockFrom = (num) => {
  let n = num >>> 0, out = '';
  for (let i = 0; i < 4; i++) {
    out = ALNUM[n % ALNUM.length] + out;
    n = Math.floor(n / (ALNUM.length * 7 + i));
  }
  return out;
};
```

---

## 4. Contoh Perhitungan Nyata

Input: nama=`RS Umum Sehat Selalu`, ID=`CLI-0042`, bangsal=`12`, kunci=`RAHASIA123`

| Langkah | Hasil |
|---------|-------|
| Normalisasi nama | `RSUMUMSEHATSALAU` |
| Normalisasi ID   | `CLI0042` |
| Blok 1 (hash gabungan) | `TGPE` |
| Blok 2 (bangsal) | `W012` |
| Blok 3 (checksum + kunci) | `NQYC` |
| **License Key final** | **`NCM-TGPE-W012-NQYC`** |

Variasi (menunjukkan efek tiap input):

| Perubahan Input | Key Hasil | Keterangan |
|-----------------|-----------|------------|
| Kunci diganti lain | `NCM-TGPE-W012-MNKB` | Hanya Blok 3 berubah |
| Bangsal 12 → 15 | `NCM-TGPE-W015-7VYC` | Blok 2 & 3 berubah |
| Nama pelanggan beda | `NCM-xxxx-W012-xxxx` | Blok 1 & 3 berubah |

---

## 5. Verifikasi Lisensi

Fungsi `verifyLicenseKey(key, nama, id, bangsal, kunci)` membandingkan:
```
key == buildLicenseKey(nama, id, bangsal, kunci)
```
- **Cocok** → lisensi sah (diterbitkan oleh sistem ini, data tidak diubah).
- **Tidak cocok** → key palsu / salah ketik / data pelanggan diubah / kunci rahasia salah.

Jumlah bangsal juga dapat dibaca langsung dari key via `wardCountFromKey(key)` (pola regex `^NCM-[A-Z0-9]{4}-W(\d{3})-[A-Z0-9]{4}$`).

---

## 6. Catatan Keamanan

1. **Kunci rahasia TIDAK disimpan ke database** — hanya dipakai sesaat saat menghitung key. Simpan kunci di tempat aman terpisah (password manager).
2. Siapa pun yang mengetahui kunci rahasia dapat membuat lisensi yang sah — gunakan string panjang acak, mis.:
   ```bash
   openssl rand -hex 16
   ```
3. Ganti kunci rahasia bawaan sebelum dipakai produksi. Jika kunci bocor, terbitkan kunci baru — lisensi lama otomatis tidak bisa diverifikasi ulang.
4. Karena sifatnya deterministik, **jangan ubah ejaan nama/ID pelanggan** setelah lisensi terbit — hasil perhitungan akan berbeda. Gunakan salinan data penerbitan (nama, ID, bangsal, kunci) sebagai arsip.
5. Algoritma ini cocok untuk proteksi tingkat aplikasi internal; untuk kebutuhan anti-pembajakan ketat, tambahkan validasi server-side / tanda tangan digital (mis. HMAC-SHA256 atau JWT).

---

## 7. Lokasi Implementasi

| Berkas | Isi |
|--------|-----|
| `src/types-license.ts` | `buildLicenseKey`, `verifyLicenseKey`, `wardCountFromKey`, `fnv1a` |
| `src/components/LicenseManager.tsx` | Form "Buat Lisensi Baru", preview live, modal verifikasi |
| `server/db.js`, `server/schema.sql` | Tabel MySQL `licenses` (kolom `customer_name`, `customer_id`, `ward_count`, `license_key`) |

*Terakhir diperbarui: September 2026 — versi rumus NCM 4-blok.*
