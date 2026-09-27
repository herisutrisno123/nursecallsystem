import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLicenseStatus, validateLicense } from '../utils/licenseValidator';

interface LicenseContextType {
  isLicenseValid: boolean;
  licenseKey: string | null;
  validationMessage: string;
  updateLicenseStatus: () => void;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [isLicenseValid, setIsLicenseValid] = useState(false);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState('');

  const updateLicenseStatus = () => {
    const status = getLicenseStatus();
    setIsLicenseValid(status.isValid);
    setLicenseKey(status.licenseKey);
    
    if (!status.licenseKey) {
      setValidationMessage('Belum ada lisensi. Silakan generate lisensi baru.');
    } else if (!status.isValid) {
      setValidationMessage('Kode lisensi tidak valid. Hubungi developer untuk mendapatkan kode lisensi yang benar.');
    } else {
      setValidationMessage('');
    }
  };

  useEffect(() => {
    updateLicenseStatus();
  }, []);

  return (
    <LicenseContext.Provider value={{
      isLicenseValid,
      licenseKey,
      validationMessage,
      updateLicenseStatus,
    }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) throw new Error('useLicense must be used within LicenseProvider');
  return context;
}
