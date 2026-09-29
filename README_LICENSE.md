# NurseCall Monitor - Sistem Lisensi

## Alur Bisnis Lisensi

### ⚠️ PENTING: Generate Lisensi TIDAK dilakukan di aplikasi ini!

Aplikasi NurseCall Monitor **HANYA** menerima dan memvalidasi lisensi dari vendor. Proses generate lisensi dilakukan oleh vendor menggunakan aplikasi terpisah.

---

## Alur Lengkap

### 1️⃣ Registrasi Data Perusahaan (di Aplikasi NurseCall Monitor)

User membuka aplikasi dan melakukan registrasi data perusahaan:
- **Nama Perusahaan**: Contoh "RS Sehat Selalu"
- **Jumlah Bangsal**: Contoh 5

Data ini disimpan di localStorage aplikasi.

### 2️⃣ Hubungi Vendor

User menghubungi vendor NurseCall Monitor dan memberikan:
- Nama perusahaan
- Jumlah bangsal

### 3️⃣ Vendor Generate Lisensi (di Aplikasi Vendor)

Vendor menggunakan **aplikasi terpisah** dengan fungsi `generateVendorLicenseKey()` untuk generate kode lisensi berdasarkan data perusahaan yang diberikan.

**Format Kode Lisensi:**
```
NCM-XXXX-XXXX-XXXX
```

**Struktur:**
- **Blok 0**: `NCM` (prefix tetap - NurseCall Monitor)
- **Blok 1**: Hash nama perusahaan + ID pelanggan (4 karakter)
- **Blok 2**: Jumlah bangsal yang di-encode (4 karakter, format: W001, W010, dst)
- **Blok 3**: Kunci rahasia (4 karakter, tidak divalidasi)

**Contoh:**
```
NCM-A1B2-W005-XYZ1
```

### 4️⃣ User Terima Kode Lisensi dari Vendor

Vendor memberikan kode lisensi kepada user melalui email, SMS, atau media lainnya.

### 5️⃣ User Input Kode Lisensi (di Aplikasi NurseCall Monitor)

User memasukkan kode lisensi yang diterima dari vendor ke aplikasi.

### 6️⃣ Aplikasi Memvalidasi

Aplikasi melakukan validasi:
- ✅ **Blok 1**: Hash nama perusahaan harus cocok dengan data yang terdaftar
- ✅ **Blok 2**: Jumlah bangsal harus cocok dengan data yang terdaftar
- ❌ **Blok 3**: Kunci rahasia (tidak divalidasi)

### 7️⃣ Lisensi Aktif

Jika validasi berhasil, lisensi diaktifkan dan semua menu aplikasi dapat diakses.

---

## Validasi Lisensi

### Yang Div_VALIDASI:

1. **Format**: Harus `NCM-XXXX-XXXX-XXXX`
2. **Prefix**: Harus dimulai dengan `NCM`
3. **Blok 1**: Hash nama perusahaan harus cocok dengan data tersimpan
4. **Blok 2**: Jumlah bangsal harus cocok dengan data tersimpan

### Yang TIDAK Div_VALIDASI:

- **Blok 3**: Kunci rahasia (bisa berupa apa saja)

---

## Pesan Error Validasi

### Format Salah:
```
Format kode lisensi tidak valid. Format yang benar: NCM-XXXX-XXXX-XXXX
```

### Prefix Salah:
```
Kode lisensi harus dimulai dengan prefix "NCM". Pastikan kode diperoleh dari vendor resmi NurseCall Monitor.
```

### Nama Perusahaan Tidak Cocok:
```
Kode lisensi tidak sesuai dengan nama perusahaan "RS Sehat Selalu". Kode lisensi ini diterbitkan untuk perusahaan yang berbeda.
```

### Jumlah Bangsal Tidak Cocok:
```
Kode lisensi tidak sesuai dengan jumlah bangsal. Lisensi ini untuk 5 bangsal, tetapi sistem terdaftar untuk 10 bangsal.
```

---

## Untuk Developer Vendor

### Fungsi Generate Lisensi

Vendor dapat menggunakan fungsi `generateVendorLicenseKey()` yang sudah tersedia di file `src/utils/licenseValidator.ts`:

```typescript
import { generateVendorLicenseKey } from './utils/licenseValidator';

const companyName = 'RS Sehat Selalu';
const wardCount = 5;

const licenseKey = generateVendorLicenseKey(companyName, wardCount);
console.log(licenseKey); // Output: NCM-XXXX-W005-XXXX
```

### Contoh Implementasi Aplikasi Vendor

Vendor dapat membuat aplikasi terpisah (web, desktop, atau mobile) yang:
1. Menerima input nama perusahaan dan jumlah bangsal
2. Memanggil fungsi `generateVendorLicenseKey()`
3. Menampilkan kode lisensi kepada user
4. Mengirimkan kode lisensi melalui email/SMS

---

## Keamanan

- ✅ Data perusahaan disimpan dalam format asli (Title Case)
- ✅ Hash nama perusahaan menggunakan algoritma yang konsisten
- ✅ Validasi memastikan kode lisensi cocok dengan data terdaftar
- ✅ Blok 3 (kunci rahasia) tidak divalidasi untuk fleksibilitas vendor
- ✅ Lisensi berlaku seumur hidup (lifetime)

---

## Troubleshooting

### Error: "Kode lisensi tidak sesuai dengan nama perusahaan"

**Penyebab:**
- Kode lisensi dibuat untuk nama perusahaan yang berbeda
- Atau data perusahaan di aplikasi berubah setelah lisensi dibuat

**Solusi:**
- Pastikan nama perusahaan yang terdaftar sama persis dengan yang digunakan saat generate lisensi
- Hubungi vendor untuk mendapatkan kode lisensi baru

### Error: "Kode lisensi tidak sesuai dengan jumlah bangsal"

**Penyebab:**
- Jumlah bangsal di aplikasi berbeda dengan yang digunakan saat generate lisensi

**Solusi:**
- Pastikan jumlah bangsal yang terdaftar sama dengan yang digunakan saat generate lisensi
- Hubungi vendor untuk mendapatkan kode lisensi baru

---

## Kontak

Untuk pertanyaan tentang lisensi, silakan hubungi vendor resmi NurseCall Monitor.
