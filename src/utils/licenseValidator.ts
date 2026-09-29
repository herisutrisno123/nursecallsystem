// License validation utility
// Format valid: NCM-XXXX-XXXX-XXXX-XXXX (5 blok, 23 karakter)
// Blok 0: NCM (prefix - Nurse Control Monitor)
// Blok 1: Signature nama pelanggan (4 digit)
// Blok 2: ID Pelanggan (4 digit)
// Blok 3: Jumlah bangsal (4 digit, format: Bxxx - B + 3 karakter alfanumerik)
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
  
  // Generate 4 karakter signature (semua huruf A-Z)
  const char1 = String.fromCharCode(65 + (length % 26)); // A-Z berdasarkan panjang
  const char2 = String.fromCharCode(65 + (checksum % 26)); // A-Z berdasarkan checksum
  const char3 = String.fromCharCode(65 + ((length + checksum) % 26)); // A-Z kombinasi
  const char4 = String.fromCharCode(65 + ((length * checksum) % 26)); // A-Z berdasarkan perkalian
  
  const result = `${char1}${char2}${char3}${char4}`;
  console.log('Customer Name Signature:', result);
  console.log('  Length:', length, '→ char1:', char1);
  console.log('  Checksum:', checksum, '→ char2:', char2);
  console.log('  Length+Checksum:', length + checksum, '→ char3:', char3);
  console.log('  Length*Checksum:', length * checksum, '→ char4:', char4);
  
  return result;
}

// Cari nama pelanggan yang cocok dengan signature tertentu
export function findCustomerNameBySignature(targetSignature: string): string[] {
  console.log('=== FINDING CUSTOMER NAME FOR SIGNATURE:', targetSignature, '===');
  
  const results: string[] = [];
  
  // Decode signature
  const char1Code = targetSignature.charCodeAt(0) - 65; // 0-25
  const char2Code = targetSignature.charCodeAt(1) - 65; // 0-25
  const char3Code = targetSignature.charCodeAt(2) - 65; // 0-25
  const char4Code = targetSignature.charCodeAt(3) - 65; // 0-25
  
  console.log('Decoded signature codes:', char1Code, char2Code, char3Code, char4Code);
  
  // Cari kombinasi length dan checksum yang memenuhi
  // char1 = length % 26
  // char2 = checksum % 26
  // char3 = (length + checksum) % 26
  // char4 = (length * checksum) % 26
  
  for (let length = 1; length <= 100; length++) {
    if (length % 26 !== char1Code) continue;
    
    for (let checksum = 1; checksum <= 10000; checksum++) {
      if (checksum % 26 !== char2Code) continue;
      if ((length + checksum) % 26 !== char3Code) continue;
      if ((length * checksum) % 26 !== char4Code) continue;
      
      // Jika semua kondisi terpenuhi, cari nama yang cocok
      console.log(`Found valid combination: length=${length}, checksum=${checksum}`);
      
      // Generate contoh nama dengan panjang dan checksum tertentu
      const exampleNames = generateExampleNames(length, checksum);
      results.push(...exampleNames);
      
      if (results.length >= 10) break;
    }
    
    if (results.length >= 10) break;
  }
  
  console.log('Found', results.length, 'example names');
  return results.slice(0, 10);
}

// Generate contoh nama pelanggan dengan panjang dan checksum tertentu
function generateExampleNames(targetLength: number, targetChecksum: number): string[] {
  const examples: string[] = [];
  
  // Contoh 1: Nama sederhana dengan spasi
  const baseName = 'RS';
  const remainingLength = targetLength - baseName.length - 1; // -1 untuk spasi
  
  if (remainingLength > 0 && remainingLength <= 50) {
    // Generate nama dengan panjang tertentu
    let name = baseName + ' ';
    const words = ['SEHAT', 'SELALU', 'JAYA', 'ABADI', 'SENTOSA', 'MULIA', 'BAHAGIA', 'SUkses'];
    
    for (const word of words) {
      if (name.length + word.length + 1 <= targetLength) {
        name += word + ' ';
      }
      if (name.trim().length === targetLength) break;
    }
    
    // Trim atau pad untuk mencapai panjang target
    name = name.trim();
    if (name.length < targetLength) {
      name += ' '.repeat(targetLength - name.length);
    } else if (name.length > targetLength) {
      name = name.substring(0, targetLength);
    }
    
    // Cek checksum
    const actualChecksum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    if (actualChecksum === targetChecksum) {
      examples.push(name);
    }
  }
  
  // Contoh 2: Generate nama acak dengan panjang dan checksum target
  for (let attempt = 0; attempt < 100; attempt++) {
    let name = '';
    let currentChecksum = 0;
    
    for (let i = 0; i < targetLength; i++) {
      const remainingChars = targetLength - i - 1;
      const remainingChecksum = targetChecksum - currentChecksum;
      
      // Pilih karakter yang memungkinkan checksum target tercapai
      const minChar = Math.max(32, remainingChecksum - (remainingChars * 90));
      const maxChar = Math.min(90, remainingChecksum - (remainingChars * 32));
      
      if (minChar > maxChar) break;
      
      const charCode = minChar + Math.floor(Math.random() * (maxChar - minChar + 1));
      name += String.fromCharCode(charCode);
      currentChecksum += charCode;
    }
    
    if (name.length === targetLength && currentChecksum === targetChecksum) {
      // Format nama agar lebih readable
      const formattedName = formatCustomerName(name);
      examples.push(formattedName);
      if (examples.length >= 5) break;
    }
  }
  
  return examples;
}

// Format nama pelanggan agar lebih readable
function formatCustomerName(name: string): string {
  // Capitalize first letter of each word
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

// Cari nama pelanggan yang cocok dengan signature tertentu (untuk signature dari vendor)
export function findCustomerNamesBySignature(targetSignature: string, maxResults: number = 10): string[] {
  console.log('=== FINDING CUSTOMER NAMES FOR SIGNATURE:', targetSignature, '===');
  
  const results: string[] = [];
  
  // Decode signature
  if (targetSignature.length !== 4) {
    console.log('Invalid signature length');
    return [];
  }
  
  const char1Code = targetSignature.charCodeAt(0) - 65; // 0-25
  const char2Code = targetSignature.charCodeAt(1) - 65; // 0-25
  const char3Code = targetSignature.charCodeAt(2) - 65; // 0-25
  const char4Code = targetSignature.charCodeAt(3) - 65; // 0-25
  
  console.log('Decoded signature codes:', char1Code, char2Code, char3Code, char4Code);
  
  // Cari kombinasi length dan checksum yang memenuhi
  for (let length = 1; length <= 100; length++) {
    if (length % 26 !== char1Code) continue;
    
    for (let checksum = 100; checksum <= 5000; checksum++) {
      if (checksum % 26 !== char2Code) continue;
      if ((length + checksum) % 26 !== char3Code) continue;
      if ((length * checksum) % 26 !== char4Code) continue;
      
      console.log(`Found valid combination: length=${length}, checksum=${checksum}`);
      
      // Generate contoh nama dengan panjang dan checksum tertentu
      const exampleNames = generateExampleNamesForSignature(length, checksum);
      results.push(...exampleNames);
      
      if (results.length >= maxResults) break;
    }
    
    if (results.length >= maxResults) break;
  }
  
  console.log('Found', results.length, 'example names');
  return results.slice(0, maxResults);
}

// Generate contoh nama pelanggan dengan panjang dan checksum tertentu
function generateExampleNamesForSignature(targetLength: number, targetChecksum: number): string[] {
  const examples: string[] = [];
  
  // Kata-kata umum untuk rumah sakit/perusahaan
  const prefixes = ['RS', 'PT', 'CV', 'RSUD', 'RSIA'];
  const words = ['SEHAT', 'SELALU', 'JAYA', 'ABADI', 'SENTOSA', 'MULIA', 'BAHAGIA', 'SUkses', 'HUSADA', 'MEDICA', 'KLINIK', 'HOSPITAL'];
  
  // Coba berbagai kombinasi
  for (const prefix of prefixes) {
    for (const word1 of words) {
      for (const word2 of words) {
        const name = `${prefix} ${word1} ${word2}`;
        
        if (name.length === targetLength) {
          const checksum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
          
          if (checksum === targetChecksum) {
            examples.push(name);
            if (examples.length >= 3) return examples;
          }
        }
      }
    }
  }
  
  // Jika tidak ada yang cocok, generate nama acak
  for (let attempt = 0; attempt < 1000; attempt++) {
    let name = '';
    let currentChecksum = 0;
    
    for (let i = 0; i < targetLength; i++) {
      const remainingChars = targetLength - i - 1;
      const remainingChecksum = targetChecksum - currentChecksum;
      
      // Pilih karakter yang memungkinkan checksum target tercapai
      const minChar = Math.max(65, remainingChecksum - (remainingChars * 90));
      const maxChar = Math.min(90, remainingChecksum - (remainingChars * 65));
      
      if (minChar > maxChar) break;
      
      const charCode = minChar + Math.floor(Math.random() * (maxChar - minChar + 1));
      name += String.fromCharCode(charCode);
      currentChecksum += charCode;
    }
    
    if (name.length === targetLength && currentChecksum === targetChecksum) {
      // Format nama agar lebih readable
      const formattedName = formatReadableName(name);
      if (!examples.includes(formattedName)) {
        examples.push(formattedName);
        if (examples.length >= 3) return examples;
      }
    }
  }
  
  return examples;
}

// Format nama agar lebih readable
function formatReadableName(name: string): string {
  // Split menjadi kata-kata dengan panjang 3-6 karakter
  const words: string[] = [];
  let currentWord = '';
  
  for (let i = 0; i < name.length; i++) {
    currentWord += name[i];
    
    if (currentWord.length >= 3 && (currentWord.length >= 6 || i === name.length - 1)) {
      words.push(currentWord.charAt(0).toUpperCase() + currentWord.slice(1).toLowerCase());
      currentWord = '';
    }
  }
  
  if (currentWord.length > 0) {
    words.push(currentWord.charAt(0).toUpperCase() + currentWord.slice(1).toLowerCase());
  }
  
  return words.join(' ');
}

// Encode jumlah bangsal ke 4 karakter
// Format: B + 3 karakter alfanumerik (B001, B010, B100, BABC, dll)
function encodeWardCount(wardCount: number): string {
  const count = Math.max(1, Math.min(999, wardCount));
  return 'B' + count.toString().padStart(3, '0');
}

// Decode jumlah bangsal dari 4 karakter (format Bxxx)
function decodeWardCount(encoded: string): number | null {
  if (!encoded.startsWith('B')) return null;
  const code = encoded.substring(1); // 3 karakter setelah B
  
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
// Blok 3 harus dimulai dengan B diikuti 3 karakter alfanumerik
export function validateLicenseFormat(licenseKey: string): boolean {
  const pattern = /^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{4}-B[A-Z0-9]{3}-[A-Z0-9]{4}$/;
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
