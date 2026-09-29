// License validation utility
// Format valid: NCM-XXXX-XXXX-XXXX
// Blok 0: NCM (prefix)
// Blok 1: Hash nama perusahaan + ID pelanggan
// Blok 2: Jumlah bangsal (encoded)
// Blok 3: Checksum

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
  const normalized = companyName.trim().toUpperCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const positiveHash = Math.abs(hash);
  const hashString = positiveHash.toString(36).toUpperCase().padStart(4, '0');
  return hashString.substring(0, 4);
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

// Generate checksum dari blok 1 + blok 2 + nama perusahaan
function generateChecksum(block1: string, block2: string, companyName: string): string {
  const combined = block1 + block2 + companyName.trim().toUpperCase();
  let checksum = 0;
  for (let i = 0; i < combined.length; i++) {
    checksum += combined.charCodeAt(i) * (i + 1);
  }
  
  const checksumStr = checksum.toString(36).toUpperCase().padStart(4, '0');
  return checksumStr.substring(0, 4);
}

// Generate kode lisensi vendor berdasarkan nama perusahaan dan jumlah bangsal
export function generateVendorLicenseKey(companyName: string, wardCount: number): string {
  const prefix = 'NCM';
  const block1 = hashCompanyName(companyName);
  const block2 = encodeWardCount(wardCount);
  const block3 = generateChecksum(block1, block2, companyName);
  
  return `${prefix}-${block1}-${block2}-${block3}`;
}

// Validasi format kode lisensi
export function validateLicenseFormat(licenseKey: string): boolean {
  const pattern = /^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(licenseKey);
}

// Fungsi utama validasi lisensi
export function validateLicense(licenseKey: string, storedCompanyName?: string, storedWardCount?: number): LicenseValidation {
  const key = licenseKey.trim().toUpperCase();
  
  // 1. Cek format
  if (!validateLicenseFormat(key)) {
    return {
      isValid: false,
      message: 'Format kode lisensi tidak valid. Format yang benar: NCM-XXXX-XXXX-XXXX',
    };
  }
  
  const parts = key.split('-');
  const [prefix, block1, block2, block3] = parts;
  
  // 2. Cek prefix NCM
  if (prefix !== 'NCM') {
    return {
      isValid: false,
      message: 'Kode lisensi harus dimulai dengan prefix "NCM". Pastikan kode diperoleh dari vendor resmi NurseCall Monitor.',
    };
  }
  
  // 3. Decode blok 2 (jumlah bangsal)
  const decodedWardCount = decodeWardCount(block2);
  if (decodedWardCount === null) {
    return {
      isValid: false,
      message: 'Blok jumlah bangsal tidak valid. Kode lisensi rusak atau tidak sesuai standar vendor.',
    };
  }
  
  // 4. Jika ada data tersimpan, verifikasi kesesuaian
  if (storedCompanyName && storedWardCount) {
    // Verifikasi hash nama perusahaan
    const expectedBlock1 = hashCompanyName(storedCompanyName);
    if (block1 !== expectedBlock1) {
      return {
        isValid: false,
        message: `Kode lisensi tidak sesuai dengan nama perusahaan "${storedCompanyName}". Kode lisensi ini diterbitkan untuk perusahaan yang berbeda.`,
        decodedData: {
          companyNameHash: block1,
          wardCount: decodedWardCount,
        },
      };
    }
    
    // Verifikasi jumlah bangsal
    if (decodedWardCount !== storedWardCount) {
      return {
        isValid: false,
        message: `Kode lisensi tidak sesuai dengan jumlah bangsal. Lisensi ini untuk ${decodedWardCount} bangsal, tetapi sistem terdaftar untuk ${storedWardCount} bangsal.`,
        decodedData: {
          companyNameHash: block1,
          wardCount: decodedWardCount,
        },
      };
    }
    
    // Verifikasi checksum
    const expectedChecksum = generateChecksum(block1, block2, storedCompanyName);
    if (block3 !== expectedChecksum) {
      return {
        isValid: false,
        message: 'Checksum kode lisensi tidak valid. Kode lisensi mungkin rusak atau telah dimodifikasi.',
        decodedData: {
          companyNameHash: block1,
          wardCount: decodedWardCount,
        },
      };
    }
  } else {
    // Jika belum ada data tersimpan, hanya verifikasi checksum dasar
    // Gunakan block1 sebagai proxy untuk nama perusahaan
    const expectedChecksum = generateChecksum(block1, block2, block1);
    if (block3 !== expectedChecksum) {
      return {
        isValid: false,
        message: 'Checksum kode lisensi tidak valid. Kode lisensi mungkin rusak atau bukan dari vendor resmi.',
        decodedData: {
          companyNameHash: block1,
          wardCount: decodedWardCount,
        },
      };
    }
  }
  
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
  
  if (!savedLicense) {
    return { isValid: false, licenseKey: null };
  }
  
  try {
    const parsed = JSON.parse(savedLicense);
    const validation = validateLicense(parsed.licenseKey, parsed.companyName, parsed.wardCount);
    
    return {
      isValid: validation.isValid,
      licenseKey: parsed.licenseKey,
      companyName: parsed.companyName,
      wardCount: parsed.wardCount,
    };
  } catch (e) {
    return { isValid: false, licenseKey: null };
  }
}

// Contoh kode lisensi valid untuk testing
// Perusahaan: "RS SEHAT SENTOSA", 5 bangsal
export const DEMO_LICENSE_KEY = generateVendorLicenseKey('RS SEHAT SENTOSA', 5);
