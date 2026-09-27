import { useState, useEffect } from 'react';
import { Key, Building2, Copy, CheckCircle, AlertCircle, RefreshCw, Shield, Calendar } from 'lucide-react';

interface LicenseInfo {
  companyName: string;
  wardCount: number;
  licenseKey: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'invalid';
}

// Hidden superadmin credentials (obfuscated)
const _sys_admin = {
  u: atob('c3VwZXJhZG1pbg=='), // superadmin
  p: atob('c3ByYWRtaW4='), // spradmin
};

export default function LicenseSettings() {
  const [companyName, setCompanyName] = useState('');
  const [wardCount, setWardCount] = useState(1);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showSuperAdminLogin, setShowSuperAdminLogin] = useState(false);
  const [superAdminUsername, setSuperAdminUsername] = useState('');
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [superAdminError, setSuperAdminError] = useState('');
  const [newLicenseKey, setNewLicenseKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing license from localStorage
  useEffect(() => {
    const savedLicense = localStorage.getItem('nurseCallLicense');
    if (savedLicense) {
      try {
        const parsed = JSON.parse(savedLicense);
        setLicenseInfo(parsed);
        setCompanyName(parsed.companyName);
        setWardCount(parsed.wardCount);
      } catch (e) {
        console.error('Failed to parse license:', e);
      }
    }
  }, []);

  // Generate unique license key
  const generateLicenseKey = (companyName: string, wardCount: number): string => {
    // Create base string from company name and ward count
    const baseString = `${companyName.toUpperCase()}-${wardCount}-${Date.now()}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to positive number and use base36
    const positiveHash = Math.abs(hash);
    const hashString = positiveHash.toString(36).toUpperCase().padStart(16, '0');
    
    // Add checksum
    let checksum = 0;
    for (let i = 0; i < hashString.length; i++) {
      checksum += hashString.charCodeAt(i);
    }
    const checksumChar = (checksum % 36).toString(36).toUpperCase();
    
    // Format as XXXX-XXXX-XXXX-XXXX-X
    const part1 = hashString.substring(0, 4);
    const part2 = hashString.substring(4, 8);
    const part3 = hashString.substring(8, 12);
    const part4 = hashString.substring(12, 16);
    
    return `${part1}-${part2}-${part3}-${part4}-${checksumChar}`;
  };

  // Validate license key format
  const validateLicenseKey = (key: string): boolean => {
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]$/;
    return pattern.test(key);
  };

  // Hidden access to superadmin login (click 5x on shield icon)
  const [shieldClickCount, setShieldClickCount] = useState(0);
  
  const handleShieldClick = () => {
    const newCount = shieldClickCount + 1;
    setShieldClickCount(newCount);
    
    if (newCount >= 5) {
      setShowSuperAdminLogin(true);
      setShieldClickCount(0);
    }
    
    // Reset counter after 2 seconds
    setTimeout(() => setShieldClickCount(0), 2000);
  };

  // Superadmin authentication
  const handleSuperAdminLogin = () => {
    if (superAdminUsername === _sys_admin.u && superAdminPassword === _sys_admin.p) {
      setIsSuperAdmin(true);
      setShowSuperAdminLogin(false);
      setSuperAdminError('');
      setSuperAdminUsername('');
      setSuperAdminPassword('');
    } else {
      setSuperAdminError('Kredensial tidak valid');
    }
  };

  const handleSuperAdminLogout = () => {
    setIsSuperAdmin(false);
  };

  // Generate new license (only for first time)
  const handleGenerateLicense = () => {
    if (!companyName.trim()) {
      alert('Nama perusahaan harus diisi');
      return;
    }
    if (wardCount < 1) {
      alert('Jumlah bangsal minimal 1');
      return;
    }

    setGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const licenseKey = generateLicenseKey(companyName, wardCount);
      const issuedDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year validity

      const newLicense: LicenseInfo = {
        companyName: companyName.trim(),
        wardCount,
        licenseKey,
        issuedDate: issuedDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        status: 'active',
      };

      setLicenseInfo(newLicense);
      localStorage.setItem('nurseCallLicense', JSON.stringify(newLicense));
      setGenerating(false);
    }, 1000);
  };

  // Update existing license (only for superadmin)
  const handleUpdateLicense = () => {
    if (!isSuperAdmin) {
      return;
    }
    handleGenerateLicense();
  };

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
      alert('Kode lisensi harus diisi');
      return;
    }

    if (!validateLicenseKey(newLicenseKey.trim())) {
      alert('Format kode lisensi tidak valid. Format yang benar: XXXX-XXXX-XXXX-XXXX-X');
      return;
    }

    if (!licenseInfo) {
      alert('Tidak ada lisensi aktif untuk diperbarui');
      return;
    }

    // Update license with new key
    const updatedLicense: LicenseInfo = {
      ...licenseInfo,
      licenseKey: newLicenseKey.trim(),
      issuedDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    };

    setLicenseInfo(updatedLicense);
    localStorage.setItem('nurseCallLicense', JSON.stringify(updatedLicense));
    setNewLicenseKey('');
    setSaveSuccess(true);
    
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Check if license is expired
  const isLicenseExpired = (expiryDate: string): boolean => {
    return new Date(expiryDate) < new Date();
  };

  // Get license status
  const getLicenseStatus = () => {
    if (!licenseInfo) return null;
    if (isLicenseExpired(licenseInfo.expiryDate)) {
      return { label: 'Kedaluwarsa', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <AlertCircle className="w-4 h-4" /> };
    }
    return { label: 'Aktif', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-4 h-4" /> };
  };

  const status = getLicenseStatus();

  return (
    <div className="space-y-6">
      {/* License Information Card */}
      {licenseInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleShieldClick}
              className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              title="Informasi Lisensi"
            >
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Kedaluwarsa</span>
                </div>
                <p className={`text-base ${isLicenseExpired(licenseInfo.expiryDate) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-800 dark:text-white'}`}>
                  {new Date(licenseInfo.expiryDate).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Simpan Kode Lisensi Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLicenseKey}
                    onChange={(e) => setNewLicenseKey(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono"
                    placeholder="XXXX-XXXX-XXXX-XXXX-X"
                    maxLength={21}
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Masukkan kode lisensi baru dari developer. Format: XXXX-XXXX-XXXX-XXXX-X
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate New License - hanya tampil jika BELUM ada lisensi */}
      {!licenseInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Generate Lisensi Baru
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Buat kode lisensi unik untuk aplikasi ini
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Nama perusahaan atau rumah sakit yang akan tertera di lisensi
              </p>
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
                max="100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Jumlah bangsal/ward yang akan dikelola oleh aplikasi (1-100)
              </p>
            </div>

            {/* License Preview */}
            {companyName && wardCount > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview Lisensi:</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-800 dark:text-white">
                    <span className="font-medium">Perusahaan:</span> {companyName}
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    <span className="font-medium">Bangsal:</span> {wardCount} bangsal
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    <span className="font-medium">Masa Berlaku:</span> 1 tahun dari tanggal aktivasi
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleGenerateLicense}
                disabled={generating || !companyName.trim() || wardCount < 1}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Generate Lisensi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Perbarui Lisensi - HANYA tampil jika superadmin login */}
      {licenseInfo && isSuperAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-300 dark:border-purple-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Perbarui Lisensi
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Perbarui informasi lisensi dengan data baru
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                Superadmin
              </span>
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
                max="100"
              />
            </div>

            {/* License Preview */}
            {companyName && wardCount > 0 && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-dashed border-purple-300 dark:border-purple-700">
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">Preview Perbaruan:</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-800 dark:text-white">
                    <span className="font-medium">Perusahaan:</span> {companyName}
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    <span className="font-medium">Bangsal:</span> {wardCount} bangsal
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    <span className="font-medium">Masa Berlaku:</span> 1 tahun dari tanggal perbaruan
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleUpdateLicense}
                disabled={generating || !companyName.trim() || wardCount < 1}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Perbarui Lisensi
                  </>
                )}
              </button>
              <button
                onClick={handleSuperAdminLogout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Logout Superadmin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pesan jika ada lisensi tapi bukan superadmin - section terkunci */}
      {licenseInfo && !isSuperAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <Shield className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Hubungi Developer
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
              Untuk memperbarui lisensi, silakan hubungi developer aplikasi. 
              Developer akan membantu proses perbaruan lisensi sesuai kebutuhan perusahaan Anda.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Lisensi aktif - hubungi developer untuk perbarui lisensi
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
            <span>Lisensi berlaku selama <strong>1 tahun</strong> dari tanggal aktivasi</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Kode lisensi unik berdasarkan nama perusahaan dan jumlah bangsal</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Simpan kode lisensi dengan aman untuk keperluan aktivasi ulang</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Hubungi administrator untuk perpanjangan lisensi sebelum kedaluwarsa</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span>Lisensi hanya berlaku untuk satu instalasi aplikasi</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-500 mt-1">•</span>
            <span><strong>Update lisensi</strong> memerlukan autentikasi superadmin</span>
          </li>
        </ul>
      </div>

      {/* Superadmin Login Modal */}
      {showSuperAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Autentikasi Superadmin
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Diperlukan untuk memperbarui lisensi
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={superAdminUsername}
                  onChange={(e) => setSuperAdminUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Masukkan username"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSuperAdminLogin();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Masukkan password"
                  autoComplete="off"
                />
              </div>
              {superAdminError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">{superAdminError}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowSuperAdminLogin(false);
                  setSuperAdminError('');
                  setSuperAdminUsername('');
                  setSuperAdminPassword('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSuperAdminLogin}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
