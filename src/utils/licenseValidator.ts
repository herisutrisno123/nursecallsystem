// License validation utility
// Format valid: NCM-XXXX-XXXX-XXXX
// Blok 0: NCM (prefix)
// Blok 1: Hash nama perusahaan + ID pelanggan
// Blok 2: Jumlah bangsal (encoded)
// Blok 3: Kunci rahasia (tidak divalidasi)

export interface LicenseValidation {
  isValid: boolean;
  message: string;
  decodedData?: {
    companyNameHash: string;
    wardCount: number;
  };
}

// Hash function untuk nama perusahaan
function hashCompanyName(companyName: string): string {
  // Normalisasi: trim dan uppercase untuk konsistensi
  const normalized = companyName.trim().toUpperCase();
  console.log('Hashing company name:', normalized);
  
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const positiveHash = Math.abs(hash);
  const hashString = positiveHash.toString(36).toUpperCase().padStart(4, '0');
  const result = hashString.substring(0, 4);
  console.log('Hash result:', result);
  
  return result;
}

// Encode jumlah bangsal ke 4 karakter
// Format: W + 3 digit (W001, W010, W100)
function encodeWardCount(wardCount: number): string {
  const count = Math.max(1, Math.min(999, wardCount));
  return 'W' + count.toString().padStart(3, '0');
}

// Decode jumlah bangsal dari 4 karakter
function decodeWardCount(encoded: string): number | null {
  if (!encoded.startsWith('W')) return null;
  const numStr = encoded.substring(1);
  const num = parseInt(numStr, 10);
  if (isNaN(num) || num < 1 || num > 999) return null;
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

// Generate kode lisensi vendor berdasarkan nama perusahaan dan jumlah bangsal
export function generateVendorLicenseKey(companyName: string, wardCount: number): string {
  console.log('=== GENERATE LICENSE KEY ===');
  console.log('Input Company Name:', companyName);
  console.log('Input Ward Count:', wardCount);
  
  const prefix = 'NCM';
  const block1 = hashCompanyName(companyName); // Sudah di-uppercase di dalam hashCompanyName
  const block2 = encodeWardCount(wardCount);
  const block3 = generateSecretKey(); // Kunci rahasia - tidak divalidasi
  
  const licenseKey = `${prefix}-${block1}-${block2}-${block3}`;
  console.log('Generated License Key:', licenseKey);
  console.log('  Blok 0 (Prefix):', prefix);
  console.log('  Blok 1 (Hash Nama):', block1);
  console.log('  Blok 2 (Bangsal):', block2);
  console.log('  Blok 3 (Kunci Rahasia):', block3);
  
  return licenseKey;
}

// Validasi format kode lisensi
export function validateLicenseFormat(licenseKey: string): boolean {
  const pattern = /^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(licenseKey);
}

// Fungsi utama validasi lisensi
export function validateLicense(licenseKey: string, storedCompanyName?: string, storedWardCount?: number): LicenseValidation {
  const key = licenseKey.trim().toUpperCase();
  
  console.log('=== LICENSE VALIDATION DEBUG ===');
  console.log('License Key:', key);
  console.log('Stored Company:', storedCompanyName);
  console.log('Stored Ward Count:', storedWardCount);
  
  // 1. Cek format
  if (!validateLicenseFormat(key)) {
    console.log('❌ Format invalid');
    return {
      isValid: false,
      message: 'Format kode lisensi tidak valid. Format yang benar: NCM-XXXX-XXXX-XXXX',
    };
  }
  
  const parts = key.split('-');
  const [prefix, block1, block2, block3] = parts;
  
  console.log('Blok 0 (Prefix):', prefix);
  console.log('Blok 1 (Hash Nama):', block1);
  console.log('Blok 2 (Bangsal):', block2);
  console.log('Blok 3 (Kunci Rahasia):', block3);
  
  // 2. Cek prefix NCM
  if (prefix !== 'NCM') {
    console.log('❌ Prefix invalid');
    return {
      isValid: false,
      message: 'Kode lisensi harus dimulai dengan prefix "NCM". Pastikan kode diperoleh dari vendor resmi NurseCall Monitor.',
    };
  }
  
  // 3. Decode blok 2 (jumlah bangsal)
  const decodedWardCount = decodeWardCount(block2);
  console.log('Decoded Ward Count:', decodedWardCount);
  
  if (decodedWardCount === null) {
    console.log('❌ Blok 2 invalid');
    return {
      isValid: false,
      message: 'Blok jumlah bangsal tidak valid. Kode lisensi rusak atau tidak sesuai standar vendor.',
    };
  }
  
  // 4. Jika ada data tersimpan, verifikasi kesesuaian
  if (storedCompanyName && storedWardCount) {
    // Verifikasi BLOK 1: Hash nama perusahaan
    const expectedBlock1 = hashCompanyName(storedCompanyName);
    console.log('Expected Block 1 (hash dari stored company):', expectedBlock1);
    console.log('Actual Block 1 (dari kode lisensi):', block1);
    
    if (block1 !== expectedBlock1) {
      console.log('❌ Blok 1 tidak cocok - nama perusahaan berbeda');
      return {
        isValid: false,
        message: `Kode lisensi tidak sesuai dengan nama perusahaan "${storedCompanyName}". Kode lisensi ini diterbitkan untuk perusahaan yang berbeda.`,
        decodedData: {
          companyNameHash: block1,
          wardCount: decodedWardCount,
        },
      };
    }
    
    console.log('✅ Blok 1 cocok - nama perusahaan valid');
    
    // Verifikasi BLOK 2: Jumlah bangsal
    console.log('Expected Ward Count (dari stored data):', storedWardCount);
    console.log('Actual Ward Count (dari blok 2):', decodedWardCount);
    
    if (decodedWardCount !== storedWardCount) {
      console.log('❌ Blok 2 tidak cocok - jumlah bangsal berbeda');
      return {
        isValid: false,
        message: `Kode lisensi tidak sesuai dengan jumlah bangsal. Lisensi ini untuk ${decodedWardCount} bangsal, tetapi sistem terdaftar untuk ${storedWardCount} bangsal.`,
        decodedData: {
          companyNameHash: block1,
          wardCount: decodedWardCount,
        },
      };
    }
    
    console.log('✅ Blok 2 cocok - jumlah bangsal valid');
    console.log('✅ Blok 3 tidak divalidasi (kunci rahasia)');
    
    // Blok 3 (kunci rahasia) tidak divalidasi
  } else {
    console.log('⚠️ Belum ada data tersimpan, validasi dasar saja');
    // Jika belum ada data tersimpan, validasi dasar saja
    // Blok 3 (kunci rahasia) tidak divalidasi
  }
  
  console.log('✅✅✅ LISNSI VALID ✅✅✅');
  
  // Semua valid
  return {
    isValid: true,
    message: 'Kode lisensi valid dan sesuai dengan data perusahaan.',
    decodedData: {
      companyNameHash: block1,
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
    
    // Pastikan data dalam uppercase untuk konsistensi
    const companyName = parsed.companyName?.toUpperCase();
    const wardCount = parsed.wardCount;
    const licenseKey = parsed.licenseKey?.toUpperCase();
    
    console.log('Normalized data for validation:');
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
