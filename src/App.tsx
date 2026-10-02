import { useState } from 'react';
import Dashboard from './components/Dashboard';
import FloorMap from './components/FloorMap';
import CallLog from './components/CallLog';
import AccountManagement from './components/AccountManagement';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import RoomDetail from './components/RoomDetail';
import LoginPage from './components/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LicenseProvider, useLicense } from './context/LicenseContext';
import { Room } from './types';
import { LayoutDashboard, Map, PhoneCall, Users, Bell, User, Menu, X, LogOut, FileText, Settings, AlertTriangle, Key } from 'lucide-react';

type Tab = 'dashboard' | 'map' | 'calls' | 'accounts' | 'reports' | 'settings';

function AppContent() {
  const { currentUser, login, logout, checkMenuAccess } = useAuth();
  const { isLicenseValid, validationMessage } = useLicense();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDetail, setShowRoomDetail] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications] = useState(5);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // Load company logo from localStorage
  useState(() => {
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      setCompanyLogo(savedLogo);
    }
  });

  // Jika lisensi tidak valid, paksa ke tab settings
  if (!isLicenseValid && activeTab !== 'settings') {
    setActiveTab('settings');
  }

  const handleLogin = (username: string) => {
    login(username);
  };

  const handleLogout = () => {
    logout();
    setActiveTab('dashboard');
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomDetail(true);
  };

  const allTabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, menuId: 'dashboard' },
    { id: 'map' as Tab, label: 'Bangsal', icon: <Map className="w-5 h-5" />, menuId: 'map' },
    { id: 'calls' as Tab, label: 'Log Panggilan', icon: <PhoneCall className="w-5 h-5" />, menuId: 'calls' },
    { id: 'accounts' as Tab, label: 'Kelola Akun', icon: <Users className="w-5 h-5" />, menuId: 'accounts' },
    { id: 'reports' as Tab, label: 'Laporan', icon: <FileText className="w-5 h-5" />, menuId: 'reports' },
    { id: 'settings' as Tab, label: 'Pengaturan', icon: <Settings className="w-5 h-5" />, menuId: 'settings' },
  ];

  // Filter tabs based on permissions AND license validity
  const tabs = allTabs.filter(tab => {
    // Jika lisensi tidak valid, hanya tampilkan menu Pengaturan
    if (!isLicenseValid) {
      return tab.id === 'settings';
    }
    // Jika lisensi valid, cek permission
    return checkMenuAccess(tab.menuId);
  });

  // Show login page if not logged in
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
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt="Logo Perusahaan" 
                  className="w-10 h-10 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">NurseCall Monitor</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sistem Monitoring Nurse Call</p>
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
              {/* Notification Bell */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>

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

      {/* Live Status Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>5 Panggilan Aktif</span>
              </span>
              <span className="hidden sm:inline text-blue-200">|</span>
              <span className="hidden sm:inline">🚨 2 Emergency</span>
              <span className="hidden sm:inline text-blue-200">|</span>
              <span className="hidden sm:inline">⏱️ Rata-rata respon: 3.2 menit</span>
            </div>
            <div className="text-blue-200 text-xs">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* License Warning Banner */}
      {!isLicenseValid && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Lisensi Tidak Valid</p>
                  <p className="text-sm text-red-100">{validationMessage || 'Silakan masukkan kode lisensi yang valid di menu Pengaturan → Lisensi'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && isLicenseValid && <Dashboard />}
        {activeTab === 'map' && isLicenseValid && <FloorMap onRoomSelect={handleRoomSelect} />}
        {activeTab === 'calls' && isLicenseValid && <CallLog />}
        {activeTab === 'accounts' && isLicenseValid && <AccountManagement />}
        {activeTab === 'reports' && isLicenseValid && <ReportsPage />}
        {activeTab === 'settings' && <SettingsPage />}
        
        {/* License Required Message */}
        {!isLicenseValid && activeTab !== 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-12 text-center">
            <Key className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Lisensi Diperlukan</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {validationMessage || 'Silakan masukkan kode lisensi yang valid untuk mengakses aplikasi.'}
            </p>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Buka Pengaturan Lisensi
            </button>
          </div>
        )}
      </main>

      {/* Room Detail Modal */}
      {showRoomDetail && (
        <RoomDetail
          room={selectedRoom}
          onClose={() => {
            setShowRoomDetail(false);
            setSelectedRoom(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
            <p>© 2026 NurseCall Monitor - Sistem Monitoring Nurse Call RS</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Sistem Online
              </span>
              <span>Terhubung ke 16 perangkat</span>
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
      <LicenseProvider>
        <AppContent />
      </LicenseProvider>
    </AuthProvider>
  );
}
