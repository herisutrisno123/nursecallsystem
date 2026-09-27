import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Calendar, TrendingUp, Award, Download, Filter } from 'lucide-react';

type ReportTab = 'daily' | 'monthly' | 'performance';

export default function ReportsPage() {
  const { checkPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<ReportTab>('daily');

  const tabs = [
    { id: 'daily' as ReportTab, label: 'Laporan Harian', icon: <Calendar className="w-4 h-4" />, permission: 'reports.daily' },
    { id: 'monthly' as ReportTab, label: 'Laporan Bulanan', icon: <FileText className="w-4 h-4" />, permission: 'reports.monthly' },
    { id: 'performance' as ReportTab, label: 'Kinerja Perawat', icon: <Award className="w-4 h-4" />, permission: 'reports.performance' },
  ];

  const availableTabs = tabs.filter(tab => checkPermission(tab.permission));

  if (availableTabs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Akses Ditolak</h2>
        <p className="text-gray-500 dark:text-gray-400">Anda tidak memiliki izin untuk mengakses halaman laporan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Laporan</h2>
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

      {/* Report Content */}
      {activeTab === 'daily' && checkPermission('reports.daily') && <DailyReport />}
      {activeTab === 'monthly' && checkPermission('reports.monthly') && <MonthlyReport />}
      {activeTab === 'performance' && checkPermission('reports.performance') && <PerformanceReport />}
    </div>
  );
}

function DailyReport() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Laporan Harian</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatBox label="Total Panggilan" value="47" color="bg-blue-500" />
          <StatBox label="Emergency" value="4" color="bg-red-500" />
          <StatBox label="Rata-rata Respon" value="3.2 min" color="bg-green-500" />
        </div>
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Laporan harian menampilkan ringkasan panggilan nurse call untuk hari ini. Data diperbarui secara real-time.
          </p>
        </div>
      </div>
    </div>
  );
}

function MonthlyReport() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Laporan Bulanan</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatBox label="Total Panggilan" value="1,247" color="bg-blue-500" />
          <StatBox label="Emergency" value="89" color="bg-red-500" />
          <StatBox label="Rata-rata Respon" value="3.1 min" color="bg-green-500" />
          <StatBox label="Tingkat Respon" value="94.2%" color="bg-purple-500" />
        </div>
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Laporan bulanan menampilkan tren panggilan nurse call selama sebulan terakhir. Termasuk analisis pola panggilan dan kinerja respon.
          </p>
        </div>
      </div>
    </div>
  );
}

function PerformanceReport() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Kinerja Perawat</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Perawat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Panggilan Direspon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Rata-rata Respon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">Ns. Rina Kusuma</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">156</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">2.8 min</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">⭐ 4.9</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">Ns. Dewi Lestari</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">142</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">3.1 min</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">⭐ 4.7</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">Ns. Budi Santoso</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">138</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">3.3 min</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">⭐ 4.5</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
