// License validation utility
// Vendor memberikan kode lisensi unik melalui aplikasi terpisah

export interface LicenseValidation {
  isValid: boolean;
  message: string;
  licenseData?: {
    companyName: string;
    wardCount: number;
    issuedDate: string;
  };
}

// Validasi format kode lisensi
export function validateLicenseFormat(licenseKey: string): boolean {
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]$/;
  return pattern.test(licenseKey);
}

// Validasi checksum kode lisensi
function validateChecksum(licenseKey: string): boolean {
  const parts = licenseKey.split('-');
  if (parts.length !== 5) return false;
  
  const mainPart = parts.slice(0, 4).join('');
  const checksumChar = parts[4];
  
  // Hitung checksum dari main part
  let checksum = 0;
  for (let i = 0; i < mainPart.length; i++) {
    checksum += mainPart.charCodeAt(i);
  }
  
  const expectedChecksum = (checksum % 36).toString(36).toUpperCase();
  return checksumChar === expectedChecksum;
}

// Validasi vendor signature (simulasi - di produksi gunakan API vendor)
function validateVendorSignature(licenseKey: string): boolean {
  // Di produksi, ini akan memanggil API vendor untuk validasi
  // Untuk demo, kita validasi berdasarkan pola tertentu
  
  // Vendor codes memiliki pola khusus:
  // - Harus memiliki minimal 2 angka di setiap grup
  // - Checksum harus valid
  // - Tidak boleh ada karakter yang sama berurutan 3x
  
  const parts = licenseKey.split('-');
  
  // Cek setiap grup memiliki minimal 2 angka
  for (let i = 0; i < 4; i++) {
    const digitCount = (parts[i].match(/[0-9]/g) || []).length;
    if (digitCount < 2) return false;
  }
  
  // Cek tidak ada 3 karakter sama berurutan
  if (/(.)\1\1/.test(licenseKey)) return false;
  
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
      message: 'Format kode lisensi tidak valid. Format yang benar: XXXX-XXXX-XXXX-XXXX-X',
    };
  }
  
  // Cek checksum
  if (!validateChecksum(key)) {
    return {
      isValid: false,
      message: 'Checksum kode lisensi tidak valid. Kode lisensi mungkin rusak atau salah ketik.',
    };
  }
  
  // Cek vendor signature
  if (!validateVendorSignature(key)) {
    return {
      isValid: false,
      message: 'Kode lisensi tidak dikenali oleh sistem vendor. Pastikan kode lisensi diperoleh dari vendor resmi.',
    };
  }
  
  // Jika semua valid
  return {
    isValid: true,
    message: 'Kode lisensi valid dan terdaftar di sistem vendor.',
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

// Simulasi generate kode lisensi vendor (untuk testing)
export function generateVendorLicenseKey(companyName: string, wardCount: number): string {
  // Vendor menggunakan algoritma khusus yang berbeda dari generate biasa
  const baseString = `VENDOR-${companyName.toUpperCase()}-${wardCount}-${Date.now()}`;
  
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 7) - hash) + char;
    hash = hash & hash;
  }
  
  const positiveHash = Math.abs(hash);
  const hashString = positiveHash.toString(36).toUpperCase().padStart(16, '0');
  
  // Pastikan setiap grup memiliki minimal 2 angka
  let part1 = hashString.substring(0, 4);
  let part2 = hashString.substring(4, 8);
  let part3 = hashString.substring(8, 12);
  let part4 = hashString.substring(12, 16);
  
  // Inject angka jika perlu
  const injectDigits = (part: string): string => {
    const digitCount = (part.match(/[0-9]/g) || []).length;
    if (digitCount >= 2) return part;
    
    let result = part;
    for (let i = 0; i < 2 - digitCount; i++) {
      const pos = Math.floor(Math.random() * 4);
      const digit = Math.floor(Math.random() * 10).toString();
      result = result.substring(0, pos) + digit + result.substring(pos + 1);
    }
    return result;
  };
  
  part1 = injectDigits(part1);
  part2 = injectDigits(part2);
  part3 = injectDigits(part3);
  part4 = injectDigits(part4);
  
  // Hitung checksum
  const mainPart = part1 + part2 + part3 + part4;
  let checksum = 0;
  for (let i = 0; i < mainPart.length; i++) {
    checksum += mainPart.charCodeAt(i);
  }
  const checksumChar = (checksum % 36).toString(36).toUpperCase();
  
  return `${part1}-${part2}-${part3}-${part4}-${checksumChar}`;
}
