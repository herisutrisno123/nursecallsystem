import { useEffect, useState } from 'react';
import ClientData from './components/ClientData';
import LicenseManager from './components/LicenseManager';
import LoginPage from './components/LoginPage';
import DatabaseConnection from './components/DatabaseConnection';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Building2, KeyRound, User, Menu, X, LogOut, CheckCircle2, AlertCircle, Database } from 'lucide-react';

type Tab = 'clients' | 'licenses' | 'db';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

function AppContent() {
  const { currentUser, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('clients');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  // Bersihkan toast saat unmount
  useEffect(() => () => setToasts([]), []);

  const handleLogin = (username: string) => {
    login(username);
  };

  const handleLogout = () => {
    logout();
    setActiveTab('clients');
  };

  const tabs = [
    { id: 'clients' as Tab, label: 'Data Klien', icon: <Building2 className="w-5 h-5" /> },
    { id: 'licenses' as Tab, label: 'Kelola Lisensi', icon: <KeyRound className="w-5 h-5" /> },
    { id: 'db' as Tab, label: 'Koneksi Database', icon: <Database className="w-5 h-5" /> },
  ];

  // Tampilkan halaman login jika belum login
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">Nursecall Monitor</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sistem Manajemen Lisensi</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentUser?.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role === 'head_nurse' ? 'Head Nurse' : currentUser?.role === 'doctor' ? 'Dokter' : 'Nurse'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <nav className="flex flex-col gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentUser?.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role === 'head_nurse' ? 'Head Nurse' : currentUser?.role === 'doctor' ? 'Dokter' : 'Nurse'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Info Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                <span>Layanan Lisensi Online</span>
              </span>
              <span className="hidden sm:inline text-blue-200">|</span>
              <span className="hidden sm:inline">🔐 Nursecall Monitor License Server v2.0</span>
            </div>
            <div className="text-blue-200 text-xs">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'clients' && <ClientData onNotify={notify} />}
        {activeTab === 'licenses' && <LicenseManager onNotify={notify} />}
        {activeTab === 'db' && <DatabaseConnection onNotify={notify} />}
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] space-y-2 w-80 max-w-[calc(100vw-3rem)]">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-[fadeIn_.2s_ease-out] ${
              t.type === 'success'
                ? 'bg-white border-green-200 text-green-800'
                : 'bg-white border-red-200 text-red-800'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            {t.message}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
            <p>© 2026 Nursecall Monitor - Sistem Manajemen Lisensi Penggunaan Aplikasi</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Server Lisensi Online
              </span>
              <span>Lisensi tervalidasi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
