import { useState } from 'react';
import { Save, RotateCcw, Target, Clock, TrendingUp, AlertTriangle, Bell, FileText } from 'lucide-react';

interface SLAConfig {
  responseTime: {
    target: number;
    warning: number;
    critical: number;
  };
  availability: {
    target: number;
    maintenanceWindow: string;
  };
  resolutionTime: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  escalation: {
    level1: number;
    level2: number;
    level3: number;
    autoEscalate: boolean;
  };
  thresholds: {
    missedCalls: number;
    responseRate: number;
    systemDowntime: number;
  };
  reporting: {
    dailyReport: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
    emailRecipients: string;
  };
}

export default function SLASettings() {
  const [slaConfig, setSlaConfig] = useState<SLAConfig>({
    responseTime: {
      target: 3,
      warning: 2,
      critical: 5,
    },
    availability: {
      target: 99.5,
      maintenanceWindow: '02:00-04:00',
    },
    resolutionTime: {
      low: 60,
      medium: 30,
      high: 15,
      critical: 5,
    },
    escalation: {
      level1: 5,
      level2: 10,
      level3: 15,
      autoEscalate: true,
    },
    thresholds: {
      missedCalls: 5,
      responseRate: 95,
      systemDowntime: 30,
    },
    reporting: {
      dailyReport: true,
      weeklyReport: true,
      monthlyReport: true,
      emailRecipients: 'admin@rs-sehat.com, head.nurse@rs-sehat.com',
    },
  });

  const updateConfig = (section: keyof SLAConfig, field: string, value: any) => {
    setSlaConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Response Time SLA */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">SLA Response Time</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Target waktu respon nurse call</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Respon (menit)
            </label>
            <input
              type="number"
              value={slaConfig.responseTime.target}
              onChange={(e) => updateConfig('responseTime', 'target', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Waktu maksimal untuk merespon panggilan</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Peringatan (menit)
            </label>
            <input
              type="number"
              value={slaConfig.responseTime.warning}
              onChange={(e) => updateConfig('responseTime', 'warning', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kirim peringatan sebelum target tercapai</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kritis (menit)
            </label>
            <input
              type="number"
              value={slaConfig.responseTime.critical}
              onChange={(e) => updateConfig('responseTime', 'critical', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Anggap kritis jika melebihi waktu ini</p>
          </div>
        </div>
      </div>

      {/* Availability SLA */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">SLA Availability</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Target uptime sistem</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Uptime (%)
            </label>
            <input
              type="number"
              value={slaConfig.availability.target}
              onChange={(e) => updateConfig('availability', 'target', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="0"
              max="100"
              step="0.1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Persentase uptime sistem per bulan</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jendela Maintenance
            </label>
            <input
              type="text"
              value={slaConfig.availability.maintenanceWindow}
              onChange={(e) => updateConfig('availability', 'maintenanceWindow', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="02:00-04:00"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Waktu maintenance tidak dihitung downtime</p>
          </div>
        </div>
      </div>

      {/* Resolution Time SLA */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">SLA Resolution Time</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Target waktu penyelesaian berdasarkan prioritas</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Low Priority (menit)
            </label>
            <input
              type="number"
              value={slaConfig.resolutionTime.low}
              onChange={(e) => updateConfig('resolutionTime', 'low', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Medium Priority (menit)
            </label>
            <input
              type="number"
              value={slaConfig.resolutionTime.medium}
              onChange={(e) => updateConfig('resolutionTime', 'medium', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              High Priority (menit)
            </label>
            <input
              type="number"
              value={slaConfig.resolutionTime.high}
              onChange={(e) => updateConfig('resolutionTime', 'high', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Critical Priority (menit)
            </label>
            <input
              type="number"
              value={slaConfig.resolutionTime.critical}
              onChange={(e) => updateConfig('resolutionTime', 'critical', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Escalation Rules */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">SLA Escalation Rules</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Aturan eskalasi panggilan berdasarkan waktu</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level 1 - Head Nurse (menit)
              </label>
              <input
                type="number"
                value={slaConfig.escalation.level1}
                onChange={(e) => updateConfig('escalation', 'level1', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                min="1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Eskalasi ke Head Nurse setelah X menit</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level 2 - Manager (menit)
              </label>
              <input
                type="number"
                value={slaConfig.escalation.level2}
                onChange={(e) => updateConfig('escalation', 'level2', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                min="1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Eskalasi ke Manager setelah X menit</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level 3 - Director (menit)
              </label>
              <input
                type="number"
                value={slaConfig.escalation.level3}
                onChange={(e) => updateConfig('escalation', 'level3', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                min="1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Eskalasi ke Director setelah X menit</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoEscalate"
              checked={slaConfig.escalation.autoEscalate}
              onChange={(e) => updateConfig('escalation', 'autoEscalate', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoEscalate" className="text-sm text-gray-700 dark:text-gray-300">
              Otomatis eskalasi jika tidak ada respon
            </label>
          </div>
        </div>
      </div>

      {/* SLA Thresholds */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">SLA Thresholds</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ambang batas peringatan pelanggaran SLA</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maksimal Missed Calls per Jam
            </label>
            <input
              type="number"
              value={slaConfig.thresholds.missedCalls}
              onChange={(e) => updateConfig('thresholds', 'missedCalls', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alert jika panggilan tidak terjawab melebihi jumlah ini</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Response Rate (%)
            </label>
            <input
              type="number"
              value={slaConfig.thresholds.responseRate}
              onChange={(e) => updateConfig('thresholds', 'responseRate', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="0"
              max="100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alert jika tingkat respon di bawah persentase ini</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maksimal Downtime (menit)
            </label>
            <input
              type="number"
              value={slaConfig.thresholds.systemDowntime}
              onChange={(e) => updateConfig('thresholds', 'systemDowntime', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alert jika sistem down melebihi durasi ini</p>
          </div>
        </div>
      </div>

      {/* SLA Reporting */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">SLA Reporting</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Konfigurasi laporan kepatuhan SLA</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dailyReport"
                checked={slaConfig.reporting.dailyReport}
                onChange={(e) => updateConfig('reporting', 'dailyReport', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="dailyReport" className="text-sm text-gray-700 dark:text-gray-300">
                Laporan Harian
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="weeklyReport"
                checked={slaConfig.reporting.weeklyReport}
                onChange={(e) => updateConfig('reporting', 'weeklyReport', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="weeklyReport" className="text-sm text-gray-700 dark:text-gray-300">
                Laporan Mingguan
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="monthlyReport"
                checked={slaConfig.reporting.monthlyReport}
                onChange={(e) => updateConfig('reporting', 'monthlyReport', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="monthlyReport" className="text-sm text-gray-700 dark:text-gray-300">
                Laporan Bulanan
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Penerima Laporan
            </label>
            <input
              type="text"
              value={slaConfig.reporting.emailRecipients}
              onChange={(e) => updateConfig('reporting', 'emailRecipients', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="email1@domain.com, email2@domain.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pisahkan dengan koma untuk multiple email</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          <Save className="w-4 h-4" />
          Simpan Konfigurasi SLA
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <RotateCcw className="w-4 h-4" />
          Reset ke Default
        </button>
      </div>
    </div>
  );
}
