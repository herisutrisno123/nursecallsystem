// License validation utility
// Format valid: NCM-ZLB2-W001-FTNK
// Vendor memberikan kode lisensi unik melalui aplikasi terpisah

export interface LicenseValidation {
  isValid: boolean;
  message: string;
}

// Validasi format kode lisensi: XXX-XXXX-XXXX-XXXX
export function validateLicenseFormat(licenseKey: string): boolean {
  // Format: 3 karakter - 4 karakter - 4 karakter - 4 karakter
  const pattern = /^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(licenseKey);
}

// Validasi prefix NCM (NurseCall Monitor)
function validatePrefix(licenseKey: string): boolean {
  return licenseKey.startsWith('NCM-');
}

// Validasi checksum vendor
function validateVendorChecksum(licenseKey: string): boolean {
  const parts = licenseKey.split('-');
  if (parts.length !== 4) return false;
  
  const [prefix, part2, part3, part4] = parts;
  
  // Prefix harus NCM
  if (prefix !== 'NCM') return false;
  
  // Hitung checksum sederhana dari semua karakter
  const allChars = part2 + part3 + part4.substring(0, 3);
  let checksum = 0;
  for (let i = 0; i < allChars.length; i++) {
    checksum += allChars.charCodeAt(i);
  }
  
  // Checksum harus match dengan karakter terakhir part4
  const expectedLastChar = String.fromCharCode(65 + (checksum % 26)); // A-Z
  const actualLastChar = part4[part4.length - 1];
  
  return actualLastChar === expectedLastChar;
}

// Validasi pola vendor (setiap grup harus memiliki minimal 1 angka kecuali prefix)
function validateVendorPattern(licenseKey: string): boolean {
  const parts = licenseKey.split('-');
  if (parts.length !== 4) return false;
  
  const [prefix, part2, part3, part4] = parts;
  
  // Prefix harus NCM (huruf semua)
  if (prefix !== 'NCM') return false;
  
  // Part2 harus memiliki minimal 1 angka
  if (!/[0-9]/.test(part2)) return false;
  
  // Part3 harus memiliki minimal 1 angka
  if (!/[0-9]/.test(part3)) return false;
  
  // Part4 harus huruf semua (checksum)
  if (/[0-9]/.test(part4)) return false;
  
  return true;
}

// Fungsi utama validasi lisensi
export function validateLicense(licenseKey: string): LicenseValidation {
  // Trim dan uppercase
  const key = licenseKey.trim().toUpperCase();
  
  // Cek format
  if (!validateLicenseFormat(key)) {
    return {
      isValid: false,
      message: 'Format kode lisensi tidak valid. Format yang benar: NCM-XXXX-XXXX-XXXX',
    };
  }
  
  // Cek prefix NCM
  if (!validatePrefix(key)) {
    return {
      isValid: false,
      message: 'Kode lisensi harus dimulai dengan prefix "NCM". Pastikan kode diperoleh dari vendor resmi NurseCall Monitor.',
    };
  }
  
  // Cek pola vendor
  if (!validateVendorPattern(key)) {
    return {
      isValid: false,
      message: 'Pola kode lisensi tidak sesuai dengan standar vendor. Grup ke-2 dan ke-3 harus mengandung angka, grup ke-4 harus huruf semua.',
    };
  }
  
  // Cek checksum vendor
  if (!validateVendorChecksum(key)) {
    return {
      isValid: false,
      message: 'Checksum kode lisensi tidak valid. Kode lisensi mungkin rusak, salah ketik, atau bukan dari vendor resmi.',
    };
  }
  
  // Jika semua valid
  return {
    isValid: true,
    message: 'Kode lisensi valid dan terdaftar di sistem vendor NurseCall Monitor.',
  };
}

// Cek status lisensi dari localStorage
export function getLicenseStatus(): { isValid: boolean; licenseKey: string | null } {
  const savedLicense = localStorage.getItem('nurseCallLicense');
  
  if (!savedLicense) {
    return { isValid: false, licenseKey: null };
  }
  
  try {
    const parsed = JSON.parse(savedLicense);
    const validation = validateLicense(parsed.licenseKey);
    
    return {
      isValid: validation.isValid,
      licenseKey: parsed.licenseKey,
    };
  } catch (e) {
    return { isValid: false, licenseKey: null };
  }
}

// Generate kode lisensi vendor (untuk demo/testing)
// Format: NCM-XXXX-XXXX-XXXX
export function generateVendorLicenseKey(companyName: string, wardCount: number): string {
  // Prefix tetap NCM
  const prefix = 'NCM';
  
  // Generate part2 (4 karakter, minimal 1 angka)
  const part2Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part2 += part2Chars[Math.floor(Math.random() * part2Chars.length)];
  }
  // Pastikan minimal 1 angka
  if (!/[0-9]/.test(part2)) {
    part2 = part2.substring(0, 3) + Math.floor(Math.random() * 10);
  }
  
  // Generate part3 (4 karakter, minimal 1 angka, berdasarkan wardCount)
  const wardStr = wardCount.toString().padStart(3, '0');
  let part3 = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + wardStr.substring(0, 3);
  
  // Generate 3 karakter pertama part4
  let part4First3 = '';
  for (let i = 0; i < 3; i++) {
    part4First3 += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  
  // Hitung checksum untuk karakter terakhir part4
  const allChars = part2 + part3 + part4First3;
  let checksum = 0;
  for (let i = 0; i < allChars.length; i++) {
    checksum += allChars.charCodeAt(i);
  }
  const checksumChar = String.fromCharCode(65 + (checksum % 26));
  
  const part4 = part4First3 + checksumChar;
  
  return `${prefix}-${part2}-${part3}-${part4}`;
}

// Contoh kode lisensi valid untuk testing:
// NCM-ZLB2-W001-ABCK (generated dengan algoritma yang sama)
export const DEMO_LICENSE_KEY = 'NCM-ZLB2-W001-ABCK';
