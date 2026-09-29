import { useState, useEffect } from 'react';
import { Key, Building2, Copy, CheckCircle, AlertCircle, Shield, Calendar } from 'lucide-react';
import { validateLicense, generateVendorLicenseKey } from '../utils/licenseValidator';
import { useLicense } from '../context/LicenseContext';

interface LicenseInfo {
  companyName: string;
  wardCount: number;
  licenseKey: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'invalid';
}

// Activation Form Component
function ActivationForm() {
  const [companyName, setCompanyName] = useState('');
  const [wardCount, setWardCount] = useState(1);
  const [generatedKey, setGeneratedKey] = useState('');
  const { updateLicenseStatus } = useLicense();

  const handleGenerateKey = () => {
    if (!companyName.trim()) {
      alert('Nama perusahaan harus diisi');
      return;
    }
    if (wardCount < 1) {
      alert('Jumlah bangsal minimal 1');
      return;
    }

    // Generate license key based on company name and ward count
    // Gunakan uppercase untuk konsistensi dengan data yang disimpan
    const key = generateVendorLicenseKey(companyName.trim().toUpperCase(), wardCount);
    console.log('Generated License Key:', key);
    setGeneratedKey(key);
  };

  const handleActivate = () => {
    if (!generatedKey) {
      alert('Silakan generate kode lisensi terlebih dahulu');
      return;
    }

    console.log('=== ACTIVATION DEBUG ===');
    console.log('Company Name:', companyName.trim());
    console.log('Ward Count:', wardCount);
    console.log('Generated Key:', generatedKey);

    // Save license to localStorage
    const licenseData: LicenseInfo = {
      companyName: companyName.trim().toUpperCase(), // Simpan dalam uppercase untuk konsistensi
      wardCount: wardCount,
      licenseKey: generatedKey.toUpperCase(),
      issuedDate: new Date().toISOString(),
      expiryDate: '', // Lifetime license
      status: 'active',
    };

    console.log('Saving to localStorage:', licenseData);
    localStorage.setItem('nurseCallLicense', JSON.stringify(licenseData));
    
    console.log('License saved successfully. Reloading...');
    updateLicenseStatus();
    window.location.reload(); // Reload to apply license
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Aktivasi Lisensi
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Isi data perusahaan untuk generate kode lisensi
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nama Perusahaan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            placeholder="Contoh: RS Sehat Sentosa"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Jumlah Bangsal <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={wardCount}
            onChange={(e) => setWardCount(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            min="1"
            max="999"
          />
        </div>

        <button
          onClick={handleGenerateKey}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          Generate Kode Lisensi
        </button>

        {generatedKey && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
              Kode Lisensi Anda:
            </p>
            <code className="text-lg font-mono text-green-900 dark:text-green-200 break-all">
              {generatedKey}
            </code>
            <p className="text-xs text-green-800 dark:text-green-400 mt-2">
              Simpan kode ini dengan aman. Kode ini mengandung data perusahaan dan jumlah bangsal yang terenkripsi.
            </p>
            <button
              onClick={handleActivate}
              className="w-full mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
              Aktifkan Lisensi
            </button>
          </div>
        )}

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Informasi Penting:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-400">
            <li>Kode lisensi dibuat berdasarkan nama perusahaan dan jumlah bangsal</li>
            <li>Kode ini akan divalidasi setiap kali aplikasi dijalankan</li>
            <li>Jika data perusahaan berubah, kode lisensi baru harus dibuat</li>
            <li>Format kode: <code className="font-mono bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">NCM-XXXX-XXXX-XXXX</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LicenseSettings() {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [newLicenseKey, setNewLicenseKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { updateLicenseStatus } = useLicense();

  // Load existing license from localStorage
  useEffect(() => {
    const savedLicense = localStorage.getItem('nurseCallLicense');
    if (savedLicense) {
      try {
        const parsed = JSON.parse(savedLicense);
        // Normalisasi data ke uppercase untuk konsistensi
        const normalizedData = {
          ...parsed,
          companyName: parsed.companyName?.toUpperCase() || '',
          licenseKey: parsed.licenseKey?.toUpperCase() || '',
        };
        console.log('Loaded license from localStorage:', normalizedData);
        setLicenseInfo(normalizedData);
        // Update localStorage dengan data yang sudah dinormalisasi
        localStorage.setItem('nurseCallLicense', JSON.stringify(normalizedData));
      } catch (e) {
        console.error('Failed to parse license:', e);
      }
    }
  }, []);





  // Copy license key to clipboard
  const handleCopyLicense = () => {
    if (licenseInfo) {
      navigator.clipboard.writeText(licenseInfo.licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Save new license key
  const handleSaveLicense = () => {
    if (!newLicenseKey.trim()) {
      setValidationError('Kode lisensi harus diisi');
      return;
    }

    if (!licenseInfo) {
      setValidationError('Tidak ada lisensi aktif untuk diperbarui');
      return;
    }

    // Validasi kode lisensi dengan data perusahaan yang tersimpan
    const validation = validateLicense(
      newLicenseKey.trim().toUpperCase(),
      licenseInfo.companyName,
      licenseInfo.wardCount
    );
    
    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    // Update license with new key (keep original issued date, lifetime license)
    const updatedLicense: LicenseInfo = {
      ...licenseInfo,
      licenseKey: newLicenseKey.trim().toUpperCase(),
    };

    setLicenseInfo(updatedLicense);
    localStorage.setItem('nurseCallLicense', JSON.stringify(updatedLicense));
    setNewLicenseKey('');
    setValidationError('');
    setSaveSuccess(true);
    
    // Update global license status
    updateLicenseStatus();
    
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Get license status (lifetime license - always active)
  const getLicenseStatus = () => {
    if (!licenseInfo) return null;
    return { label: 'Aktif (Lifetime)', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-4 h-4" /> };
  };

  const status = getLicenseStatus();

  return (
    <div className="space-y-6">
      {/* License Information Card */}
      {licenseInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Informasi Lisensi</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Detail lisensi aplikasi yang aktif</p>
            </div>
            {status && (
              <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
                {status.icon}
                {status.label}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Perusahaan</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{licenseInfo.companyName}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Bangsal</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{licenseInfo.wardCount} Bangsal</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Kode Lisensi</span>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-lg font-mono font-bold text-blue-900 dark:text-blue-100 break-all">
                  {licenseInfo.licenseKey}
                </code>
                <button
                  onClick={handleCopyLicense}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Salin
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Terbit</span>
              </div>
              <p className="text-base text-gray-800 dark:text-white">
                {new Date(licenseInfo.issuedDate).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Simpan Kode Lisensi dari Vendor
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLicenseKey}
                    onChange={(e) => {
                      setNewLicenseKey(e.target.value.toUpperCase());
                      setValidationError('');
                    }}
                    className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono ${
                      validationError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="NCM-XXXX-XXXX-XXXX"
                    maxLength={18}
                  />
                  <button
                    onClick={handleSaveLicense}
                    disabled={!newLicenseKey.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Tersimpan!
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
                {validationError && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{validationError}</span>
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Masukkan kode lisensi unik dari vendor. Format: NCM-XXXX-XXXX-XXXX
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aktivasi Lisensi - hanya tampil jika BELUM ada lisensi */}
      {!licenseInfo && (
        <ActivationForm />
      )}

      {/* Pesan jika ada lisensi - hubungi developer untuk perbarui */}
      {licenseInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <Shield className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Hubungi Developer
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
              Untuk memperbarui data perusahaan atau jumlah bangsal, silakan hubungi developer aplikasi. 
              Developer akan membantu proses perbaruan lisensi sesuai kebutuhan perusahaan Anda.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Lisensi aktif - hubungi developer untuk perbarui data lisensi
              </span>
            </div>
          </div>
        </div>
      )}

      {/* License Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Informasi Penting
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Lisensi berlaku <strong>seumur hidup (lifetime)</strong> - tidak ada kedaluwarsa</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Kode lisensi <strong>harus diperoleh dari vendor</strong> melalui aplikasi khusus</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Format kode lisensi: <strong className="font-mono">NCM-XXXX-XXXX-XXXX</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Kode lisensi yang tidak valid akan <strong>memblokir semua menu</strong> kecuali Pengaturan</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Simpan kode lisensi dengan aman untuk keperluan aktivasi ulang</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Lisensi hanya berlaku untuk satu instalasi aplikasi</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Hubungi developer untuk memperbarui data perusahaan atau jumlah bangsal</span>
          </li>
        </ul>
      </div>


    </div>
  );
}
