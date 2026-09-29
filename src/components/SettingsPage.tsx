import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Bell, Database, Save, RotateCcw, Wifi, Target, Key } from 'lucide-react';
import IoTGatewaySettings from './IoTGatewaySettings';
import SLASettings from './SLASettings';
import LicenseSettings from './LicenseSettings';

type SettingsTab = 'general' | 'notifications' | 'backup' | 'iot' | 'sla' | 'license';

export default function SettingsPage() {
  const { checkPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs = [
    { id: 'general' as SettingsTab, label: 'Pengaturan Umum', icon: <Settings className="w-4 h-4" />, permission: 'settings.general' },
    { id: 'notifications' as SettingsTab, label: 'Notifikasi', icon: <Bell className="w-4 h-4" />, permission: 'settings.notifications' },
    { id: 'backup' as SettingsTab, label: 'Backup & Restore', icon: <Database className="w-4 h-4" />, permission: 'settings.backup' },
    { id: 'iot' as SettingsTab, label: 'IoT Gateway', icon: <Wifi className="w-4 h-4" />, permission: 'settings.iot_gateway' },
    { id: 'sla' as SettingsTab, label: 'SLA Management', icon: <Target className="w-4 h-4" />, permission: 'settings.sla' },
    { id: 'license' as SettingsTab, label: 'Lisensi', icon: <Key className="w-4 h-4" />, permission: 'settings.license' },
  ];

  const availableTabs = tabs.filter(tab => checkPermission(tab.permission));

  if (availableTabs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Akses Ditolak</h2>
        <p className="text-gray-500 dark:text-gray-400">Anda tidak memiliki izin untuk mengakses halaman pengaturan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Pengaturan</h2>
        </div>
        <div className="flex gap-2">
          {availableTabs.map(tab => (
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
        </div>
      </div>

      {/* Settings Content */}
      {activeTab === 'general' && checkPermission('settings.general') && <GeneralSettings />}
      {activeTab === 'notifications' && checkPermission('settings.notifications') && <NotificationSettings />}
      {activeTab === 'backup' && checkPermission('settings.backup') && <BackupSettings />}
      {activeTab === 'iot' && checkPermission('settings.iot_gateway') && <IoTGatewaySettings />}
      {activeTab === 'sla' && checkPermission('settings.sla') && <SLASettings />}
      {activeTab === 'license' && checkPermission('settings.license') && <LicenseSettings />}
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Pengaturan Umum</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nama Rumah Sakit
          </label>
          <input
            type="text"
            defaultValue="RS Sehat Selalu"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zona Waktu
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
            <option>WIB (UTC+7)</option>
            <option>WITA (UTC+8)</option>
            <option>WIT (UTC+9)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Waktu Respon (menit)
          </label>
          <input
            type="number"
            defaultValue={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Pengaturan Notifikasi</h3>
      <div className="space-y-4">
        <ToggleSetting
          label="Notifikasi Panggilan Emergency"
          description="Tampilkan notifikasi pop-up untuk panggilan emergency"
          defaultChecked={true}
        />
        <ToggleSetting
          label="Notifikasi Panggilan Aktif"
          description="Tampilkan notifikasi untuk semua panggilan aktif"
          defaultChecked={true}
        />
        <ToggleSetting
          label="Notifikasi Panggilan Tidak Terjawab"
          description="Kirim notifikasi jika panggilan tidak dijawab dalam 5 menit"
          defaultChecked={true}
        />
        <ToggleSetting
          label="Suara Alarm"
          description="Aktifkan suara alarm untuk panggilan emergency"
          defaultChecked={false}
        />
        <ToggleSetting
          label="Email Notifikasi"
          description="Kirim ringkasan harian via email"
          defaultChecked={false}
        />
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

function BackupSettings() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Backup & Restore</h3>
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Backup Terakhir</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">16 Januari 2026, 08:30 WIB</p>
          <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Ukuran: 2.4 MB</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white mb-3">Backup Data</h4>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-800 dark:text-white">Backup Lengkap</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Semua data sistem</p>
                </div>
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400">Download</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-800 dark:text-white">Backup Log Panggilan</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Data log panggilan saja</p>
                </div>
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400">Download</span>
            </button>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white mb-3">Restore Data</h4>
          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <Database className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Drag & drop file backup atau</p>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
              Pilih File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, defaultChecked }: { label: string; description: string; defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-gray-800 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
