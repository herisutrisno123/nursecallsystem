// License validation utility
// Format valid: NCM-XXXX-XXXX-XXXX-XXXX (5 blok, 23 karakter)
// Blok 0: NCM (prefix - Nurse Control Monitor)
// Blok 1: Signature nama pelanggan (4 digit)
// Blok 2: ID Pelanggan (4 digit)
// Blok 3: Jumlah bangsal (4 digit, format: Wxxx - W + 3 karakter alfanumerik)
// Blok 4: Kunci rahasia (4 digit, tidak divalidasi)

export interface LicenseValidation {
  isValid: boolean;
  message: string;
  decodedData?: {
    customerNameSignature: string;
    wardCount: number;
  };
}

// Generate signature untuk Blok 1 berdasarkan nama pelanggan
function generateCustomerNameSignature(customerName: string): string {
  const normalized = customerName.trim().toUpperCase();
  console.log('Generating customer name signature:', normalized);
  
  const length = normalized.length;
  const checksum = normalized.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  // Generate 4 karakter signature
  const char1 = String.fromCharCode(65 + (length % 26)); // A-Z berdasarkan panjang
  const char2 = String.fromCharCode(65 + (checksum % 26)); // A-Z berdasarkan checksum
  const char3 = String.fromCharCode(65 + ((length + checksum) % 26)); // A-Z kombinasi
  const char4 = String.fromCharCode(48 + ((length * checksum) % 10)); // 0-9 berdasarkan perkalian
  
  const result = `${char1}${char2}${char3}${char4}`;
  console.log('Customer Name Signature:', result);
  
  return result;
}

// Generate ID Pelanggan untuk Blok 2 (4 digit)
function generateCustomerId(): string {
  // Generate random 4 digit ID (bisa diganti dengan logic dari database)
  const id = Math.floor(1000 + Math.random() * 9000);
  console.log('Generated Customer ID:', id);
  return id.toString();
}

// Verifikasi nama pelanggan dengan signature
function verifyCustomerNameSignature(signature: string, customerName: string): boolean {
  const expectedSignature = generateCustomerNameSignature(customerName);
  console.log('Verifying customer name signature:', signature, 'vs expected:', expectedSignature);
  return signature === expectedSignature;
}

// Encode jumlah bangsal ke 4 karakter
// Format: W + 3 karakter alfanumerik (W001, W010, W100, WABC, dll)
function encodeWardCount(wardCount: number): string {
  const count = Math.max(1, Math.min(999, wardCount));
  return 'W' + count.toString().padStart(3, '0');
}

// Decode jumlah bangsal dari 4 karakter (format Wxxx)
function decodeWardCount(encoded: string): number | null {
  if (!encoded.startsWith('W')) return null;
  const code = encoded.substring(1); // 3 karakter setelah W
  
  // Jika 3 digit angka, decode langsung
  if (/^\d{3}$/.test(code)) {
    const num = parseInt(code, 10);
    if (num >= 1 && num <= 999) return num;
  }
  
  // Jika alfanumerik, decode menggunakan base36
  const num = parseInt(code, 36);
  if (isNaN(num) || num < 1) return null;
  return num;
}

// Generate blok 3 (kunci rahasia - tidak divalidasi)
function generateSecretKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate kode lisensi vendor berdasarkan nama pelanggan dan jumlah bangsal
export function generateVendorLicenseKey(customerName: string, wardCount: number): string {
  console.log('=== GENERATE LICENSE KEY (5 BLOK) ===');
  console.log('Input Customer Name:', customerName);
  console.log('Input Ward Count:', wardCount);
  
  const block0 = 'NCM'; // Prefix tetap
  const block1 = generateCustomerNameSignature(customerName); // Signature nama pelanggan
  const block2 = generateCustomerId(); // ID Pelanggan (4 digit)
  const block3 = encodeWardCount(wardCount); // Jumlah bangsal (W001-W999)
  const block4 = generateSecretKey(); // Kunci rahasia - tidak divalidasi
  
  const licenseKey = `${block0}-${block1}-${block2}-${block3}-${block4}`;
  console.log('Generated License Key:', licenseKey);
  console.log('  Blok 0 (Prefix):', block0);
  console.log('  Blok 1 (Signature Nama):', block1);
  console.log('  Blok 2 (ID Pelanggan):', block2);
  console.log('  Blok 3 (Bangsal):', block3);
  console.log('  Blok 4 (Kunci Rahasia):', block4);
  
  return licenseKey;
}

// Validasi format kode lisensi (5 blok)
// Blok 3 harus dimulai dengan W diikuti 3 karakter alfanumerik
export function validateLicenseFormat(licenseKey: string): boolean {
  const pattern = /^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{4}-W[A-Z0-9]{3}-[A-Z0-9]{4}$/;
  return pattern.test(licenseKey);
}

// Fungsi utama validasi lisensi (5 blok)
export function validateLicense(licenseKey: string, storedCustomerName?: string, storedWardCount?: number): LicenseValidation {
  const key = licenseKey.trim().toUpperCase();
  const customerName = storedCustomerName?.trim();
  
  console.log('=== LICENSE VALIDATION DEBUG (5 BLOK) ===');
  console.log('License Key:', key);
  console.log('Stored Customer Name:', customerName);
  console.log('Stored Ward Count:', storedWardCount);
  
  // 1. Cek format (5 blok)
  if (!validateLicenseFormat(key)) {
    console.log('❌ Format invalid');
    return {
      isValid: false,
      message: 'Format kode lisensi tidak valid. Format yang benar: NCM-XXXX-XXXX-XXXX-XXXX (5 blok)',
    };
  }
  
  const parts = key.split('-');
  const [block0, block1, block2, block3, block4] = parts;
  
  console.log('Blok 0 (Prefix):', block0);
  console.log('Blok 1 (Signature Nama):', block1);
  console.log('Blok 2 (ID Pelanggan):', block2);
  console.log('Blok 3 (Bangsal):', block3);
  console.log('Blok 4 (Kunci Rahasia):', block4);
  
  // 2. Cek prefix NCM
  if (block0 !== 'NCM') {
    console.log('❌ Prefix invalid');
    return {
      isValid: false,
      message: 'Kode lisensi harus dimulai dengan prefix "NCM". Pastikan kode diperoleh dari vendor resmi Nurse Control Monitor.',
    };
  }
  
  // 3. Decode blok 3 (jumlah bangsal)
  const decodedWardCount = decodeWardCount(block3);
  console.log('Decoded Ward Count:', decodedWardCount);
  
  if (decodedWardCount === null) {
    console.log('❌ Blok 3 invalid');
    return {
      isValid: false,
      message: 'Blok jumlah bangsal tidak valid. Kode lisensi rusak atau tidak sesuai standar vendor.',
    };
  }
  
  // 4. Jika ada data tersimpan, verifikasi kesesuaian
  if (customerName && storedWardCount) {
    // Verifikasi BLOK 1: Signature nama pelanggan
    const expectedBlock1 = generateCustomerNameSignature(customerName);
    console.log('Expected Block 1 (signature dari stored customer):', expectedBlock1);
    console.log('Actual Block 1 (dari kode lisensi):', block1);
    
    if (block1 !== expectedBlock1) {
      console.log('❌ Blok 1 tidak cocok - nama pelanggan berbeda');
      console.log('   Customer Name tersimpan:', customerName);
      console.log('   Signature yang dihitung:', expectedBlock1);
      console.log('   Signature di kode lisensi:', block1);
      return {
        isValid: false,
        message: `Kode lisensi tidak sesuai dengan nama pelanggan "${customerName}". Kode lisensi ini diterbitkan untuk pelanggan yang berbeda.`,
        decodedData: {
          customerNameSignature: block1,
          wardCount: decodedWardCount,
        },
      };
    }
    
    console.log('✅ Blok 1 cocok - nama pelanggan valid');
    
    // Verifikasi BLOK 3: Jumlah bangsal
    console.log('Expected Ward Count (dari stored data):', storedWardCount);
    console.log('Actual Ward Count (dari blok 3):', decodedWardCount);
    
    if (decodedWardCount !== storedWardCount) {
      console.log('❌ Blok 3 tidak cocok - jumlah bangsal berbeda');
      return {
        isValid: false,
        message: `Kode lisensi tidak sesuai dengan jumlah bangsal. Lisensi ini untuk ${decodedWardCount} bangsal, tetapi sistem terdaftar untuk ${storedWardCount} bangsal.`,
        decodedData: {
          customerNameSignature: block1,
          wardCount: decodedWardCount,
        },
      };
    }
    
    console.log('✅ Blok 3 cocok - jumlah bangsal valid');
    console.log('✅ Blok 2 (ID Pelanggan) dan Blok 4 (Kunci Rahasia) tidak divalidasi');
    
    // Blok 2 (ID Pelanggan) dan Blok 4 (Kunci Rahasia) tidak divalidasi
  } else {
    console.log('⚠️ Belum ada data tersimpan, validasi dasar saja');
    // Jika belum ada data tersimpan, validasi dasar saja
    // Blok 2 dan Blok 4 tidak divalidasi
  }
  
  console.log('✅✅✅ LISNSI VALID ✅✅✅');
  
  // Semua valid
  return {
    isValid: true,
    message: 'Kode lisensi valid dan sesuai dengan data pelanggan.',
    decodedData: {
      customerNameSignature: block1,
      wardCount: decodedWardCount,
    },
  };
}

// Cek status lisensi dari localStorage
export function getLicenseStatus(): { isValid: boolean; licenseKey: string | null; companyName?: string; wardCount?: number } {
  const savedLicense = localStorage.getItem('nurseCallLicense');
  
  console.log('=== GET LICENSE STATUS ===');
  console.log('Raw localStorage:', savedLicense);
  
  if (!savedLicense) {
    console.log('No license found in localStorage');
    return { isValid: false, licenseKey: null };
  }
  
  try {
    const parsed = JSON.parse(savedLicense);
    console.log('Parsed license data:', parsed);
    
    // Deteksi jika companyName masih uppercase (data lama)
    const companyName = parsed.companyName || '';
    if (companyName === companyName.toUpperCase() && companyName.length > 0) {
      // Hapus data lama dan minta user aktivasi ulang
      console.warn('Detected old license data with uppercase company name. Clearing localStorage...');
      localStorage.removeItem('nurseCallLicense');
      return { isValid: false, licenseKey: null };
    }
    
    const wardCount = parsed.wardCount;
    const licenseKey = parsed.licenseKey?.toUpperCase();
    
    console.log('Data for validation:');
    console.log('  Company Name:', companyName);
    console.log('  Ward Count:', wardCount);
    console.log('  License Key:', licenseKey);
    
    const validation = validateLicense(licenseKey, companyName, wardCount);
    
    console.log('Validation result:', validation);
    
    return {
      isValid: validation.isValid,
      licenseKey: licenseKey,
      companyName: companyName,
      wardCount: wardCount,
    };
  } catch (e) {
    console.error('Error parsing license:', e);
    return { isValid: false, licenseKey: null };
  }
}

// Contoh kode lisensi valid untuk testing
// Perusahaan: "RS SEHAT SENTOSA", 5 bangsal
export const DEMO_LICENSE_KEY = generateVendorLicenseKey('RS SEHAT SENTOSA', 5);
