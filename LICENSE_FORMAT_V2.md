# NurseCall Monitor - Format Kode Lisensi Terbaru (5 Blok)

## 📋 Struktur Kode Lisensi

```
Format: NCM-XXXX-XXXX-XXXX-XXXX
Total: 23 karakter (5 blok)
```

### **Blok 0: NCM** (3 digit)
- **Isi**: Selalu `NCM`
- **Arti**: Nurse Control Monitor (prefix tetap)
- **Fungsi**: Identifier aplikasi

### **Blok 1: XXXX** (4 digit)
- **Isi**: Signature berdasarkan **nama pelanggan**
- **Arti**: Hash/signature dari nama pelanggan
- **Fungsi**: Validasi kecocokan nama pelanggan
- **Contoh**: `PK2K`, `AB12`, `XY99`

### **Blok 2: XXXX** (4 digit)
- **Isi**: **ID Pelanggan**
- **Arti**: Unique ID untuk pelanggan
- **Fungsi**: Identifier unik pelanggan
- **Contoh**: `3A5A`, `1234`, `9876`
- **Catatan**: Tidak divalidasi (bisa berupa angka atau huruf)

### **Blok 3: Bxxx** (4 digit)
- **Isi**: **Jumlah bangsal** (encoded)
- **Arti**: Jumlah bangsal/ward yang dilisensikan
- **Format**: `B` + 3 karakter alfanumerik (B001-B999, BABC, B1A2, dll)
- **Contoh**: 
  - `B001` = 1 bangsal
  - `B004` = 4 bangsal
  - `B010` = 10 bangsal
  - `B999` = 999 bangsal
  - `BABC` = encoded value (alfanumerik)
  - `B1A2` = encoded value (alfanumerik)

### **Blok 4: XXXX** (4 digit)
- **Isi**: **Kunci rahasia**
- **Arti**: Random key untuk keamanan tambahan
- **Fungsi**: Tidak divalidasi, bisa berupa apa saja
- **Contoh**: `4G3E`, `ABCD`, `1234`, `ZZZZ`

---

## 🔍 Contoh Kode Lisensi Valid

### **Contoh 1:**
```
NCM-PK2K-3A5A-B004-4G3E
```
- **Blok 0**: `NCM` = Nurse Control Monitor
- **Blok 1**: `PK2K` = Signature nama pelanggan
- **Blok 2**: `3A5A` = ID Pelanggan
- **Blok 3**: `B004` = 4 bangsal (format angka)
- **Blok 4**: `4G3E` = Kunci rahasia

### **Contoh 2:**
```
NCM-AB12-1234-B010-TEST
```
- **Blok 0**: `NCM` = Nurse Control Monitor
- **Blok 1**: `AB12` = Signature nama pelanggan
- **Blok 2**: `1234` = ID Pelanggan
- **Blok 3**: `B010` = 10 bangsal (format angka)
- **Blok 4**: `TEST` = Kunci rahasia

### **Contoh 3:**
```
NCM-XY99-9876-BABC-ZZZZ
```
- **Blok 0**: `NCM` = Nurse Control Monitor
- **Blok 1**: `XY99` = Signature nama pelanggan
- **Blok 2**: `9876` = ID Pelanggan
- **Blok 3**: `BABC` = encoded value (format alfanumerik)
- **Blok 4**: `ZZZZ` = Kunci rahasia

### **Contoh 4:**
```
NCM-MN3P-5678-B1A2-ABCD
```
- **Blok 0**: `NCM` = Nurse Control Monitor
- **Blok 1**: `MN3P` = Signature nama pelanggan
- **Blok 2**: `5678` = ID Pelanggan
- **Blok 3**: `B1A2` = encoded value (format alfanumerik)
- **Blok 4**: `ABCD` = Kunci rahasia

---

## 🔐 Sistem Validasi

### **Yang Div_VALIDASI:**

1. ✅ **Format**: Harus `NCM-XXXX-XXXX-XXXX-XXXX` (5 blok, 23 karakter)
2. ✅ **Blok 0**: Harus `NCM`
3. ✅ **Blok 1**: Signature nama pelanggan harus cocok dengan data tersimpan
4. ✅ **Blok 3**: Jumlah bangsal harus cocok dengan data tersimpan

### **Yang TIDAK Div_VALIDASI:**

- ❌ **Blok 2**: ID Pelanggan (tidak divalidasi, bisa apa saja)
- ❌ **Blok 4**: Kunci rahasia (tidak divalidasi, bisa apa saja)

---

## 📊 Algoritma Signature (Blok 1)

Signature untuk Blok 1 dihitung berdasarkan nama pelanggan dengan algoritma:

```typescript
function generateCustomerNameSignature(customerName: string): string {
  const normalized = customerName.trim().toUpperCase();
  
  const length = normalized.length;
  const checksum = normalized.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  const char1 = String.fromCharCode(65 + (length % 26)); // A-Z berdasarkan panjang
  const char2 = String.fromCharCode(65 + (checksum % 26)); // A-Z berdasarkan checksum
  const char3 = String.fromCharCode(65 + ((length + checksum) % 26)); // A-Z kombinasi
  const char4 = String.fromCharCode(48 + ((length * checksum) % 10)); // 0-9 berdasarkan perkalian
  
  return `${char1}${char2}${char3}${char4}`;
}
```

### **Contoh Perhitungan:**

**Nama Pelanggan: "RS SEHAT SELALU"**
```
Length: 16 karakter
Checksum: 1682 (jumlah ASCII semua karakter)

char1 = 'A' + (16 % 26) = 'A' + 16 = 'Q'
char2 = 'A' + (1682 % 26) = 'A' + 2 = 'C'
char3 = 'A' + ((16 + 1682) % 26) = 'A' + 10 = 'K'
char4 = '0' + ((16 × 1682) % 10) = '0' + 2 = '2'

Signature: QCK2
```

**Kode Lisensi Lengkap:**
```
NCM-QCK2-XXXX-W004-XXXX
```

---

## 🎯 Cara Menerjemahkan Kode Lisensi

### **Contoh: NCM-PK2K-3A5A-W004-4G3E**

| Blok | Nilai | Terjemahan |
|------|-------|------------|
| 0 | NCM | Nurse Control Monitor (prefix) |
| 1 | PK2K | Signature nama pelanggan<br>• P = panjang nama % 26<br>• K = checksum % 26<br>• 2 = (panjang+checksum) % 26<br>• K = (panjang×checksum) % 10 |
| 2 | 3A5A | ID Pelanggan (tidak divalidasi) |
| 3 | W004 | **4 bangsal** |
| 4 | 4G3E | Kunci rahasia (tidak divalidasi) |

### **Decode Blok 3 (Jumlah Bangsal):**

**Format Angka:**
```
B004 → B = Bangsal, 004 = 4
Result: 4 bangsal
```

**Format Alfanumerik:**
```
BABC → B = Bangsal, ABC = base36 decode
B1A2 → B = Bangsal, 1A2 = base36 decode
```

**Catatan:** Blok 3 sekarang mendukung format Bxxx (B + 3 karakter alfanumerik) untuk fleksibilitas encoding yang lebih besar.

---

## 🧪 Testing

### **Generate Kode Lisensi untuk Testing:**

```typescript
import { generateVendorLicenseKey } from './utils/licenseValidator';

const customerName = 'RS Sehat Selalu';
const wardCount = 4;

const licenseKey = generateVendorLicenseKey(customerName, wardCount);
console.log(licenseKey);
// Output: NCM-QCK2-XXXX-W004-XXXX
```

### **Validasi Kode Lisensi:**

```typescript
import { validateLicense } from './utils/licenseValidator';

const licenseKey = 'NCM-QCK2-1234-W004-TEST';
const customerName = 'RS Sehat Selalu';
const wardCount = 4;

const result = validateLicense(licenseKey, customerName, wardCount);
console.log(result);
// Output: { isValid: true, message: 'Kode lisensi valid...' }
```

---

## 📝 Perubahan dari Versi Sebelumnya

### **Versi Lama (4 Blok):**
```
NCM-XXXX-XXXX-XXXX
(18 karakter)
```

### **Versi Baru (5 Blok):**
```
NCM-XXXX-XXXX-XXXX-XXXX
(23 karakter)
```

### **Perubahan:**
- ✅ Tambah **Blok 2** untuk ID Pelanggan
- ✅ **Blok 3** sekarang untuk jumlah bangsal (sebelumnya Blok 2)
- ✅ **Blok 4** untuk kunci rahasia (sebelumnya Blok 3)
- ✅ Total karakter bertambah dari 18 → 23

---

## 🔒 Keamanan

- ✅ **Blok 1**: Signature nama pelanggan (bisa di-verify tapi tidak bisa di-reverse)
- ✅ **Blok 2**: ID Pelanggan (tidak divalidasi, fleksibel untuk vendor)
- ✅ **Blok 3**: Jumlah bangsal (encoded, bisa di-decode)
- ✅ **Blok 4**: Kunci rahasia (tidak divalidasi, fleksibel untuk vendor)

---

## 💡 Catatan Penting

1. **Blok 1 tidak bisa di-reverse** untuk mendapatkan nama pelanggan asli (hanya bisa di-verify)
2. **Blok 2 dan Blok 4 tidak divalidasi** sehingga vendor bisa menggunakan untuk keperluan internal
3. **Validasi fokus** pada kecocokan Blok 1 (nama) dan Blok 3 (bangsal)
4. **Format 5 blok** memberikan lebih banyak fleksibilitas untuk vendor

---

## 📞 Kontak

Untuk pertanyaan tentang format kode lisensi, silakan hubungi vendor resmi Nurse Control Monitor.
