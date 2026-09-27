import type { ReactNode } from 'react';
import { dashboardStats, hourlyCallData, callTypeData, responseTimeData, nurseCalls } from '../data/mockData';
import { AreaChart, PieChart, LineChart } from './Charts';
import { useAuth } from '../context/AuthContext';
import { Activity, Phone, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp, Users, Lock } from 'lucide-react';

export default function Dashboard() {
  const { checkPermission } = useAuth();
  const stats = dashboardStats;
  const activeCalls = nurseCalls.filter(c => c.status === 'active');

  // Transform data for custom charts
  const hourlyChartData = hourlyCallData.map(d => ({
    label: d.hour.replace(':00', ''),
    value: d.calls,
    value2: d.emergency,
  }));

  const pieChartData = callTypeData.map(d => ({
    name: d.name,
    value: d.value,
    color: d.color,
  }));

  const responseChartData = responseTimeData.map(d => ({
    label: d.day,
    value: d.avgTime,
    value2: d.target,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Panggilan Hari Ini"
          value={stats.totalCallsToday}
          icon={<Phone className="w-6 h-6" />}
          color="bg-blue-500"
          trend="+12%"
        />
        <StatCard
          title="Panggilan Aktif"
          value={stats.activeCalls}
          icon={<Activity className="w-6 h-6" />}
          color="bg-red-500"
          pulse
        />
        <StatCard
          title="Rata-rata Respon"
          value={`${stats.avgResponseTime} min`}
          icon={<Clock className="w-6 h-6" />}
          color="bg-green-500"
          trend="-0.3 min"
        />
        <StatCard
          title="Panggilan Emergency"
          value={stats.emergencyCalls}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Terselesaikan"
          value={stats.resolvedCalls}
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-emerald-500"
        />
        <StatCard
          title="Tidak Terjawab"
          value={stats.missedCalls}
          icon={<XCircle className="w-6 h-6" />}
          color="bg-gray-500"
        />
        <StatCard
          title="Tingkat Respon"
          value={`${stats.responseRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-500"
          trend="+2.5%"
        />
        <StatCard
          title="Perawat Aktif"
          value={8}
          icon={<Users className="w-6 h-6" />}
          color="bg-indigo-500"
        />
      </div>

      {/* Charts Row */}
      {checkPermission('dashboard.charts') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Calls Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Panggilan Per Jam</h3>
            <AreaChart
              data={hourlyChartData}
              color="#3b82f6"
              color2="#ef4444"
              label1="Total Panggilan"
              label2="Emergency"
              height={280}
            />
          </div>

          {/* Call Type Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Jenis Panggilan</h3>
            <PieChart data={pieChartData} height={280} />
          </div>
        </div>
      )}

      {/* Response Time Chart & Active Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        {checkPermission('dashboard.charts') && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Waktu Respon (menit)</h3>
            <LineChart
              data={responseChartData}
              color="#8b5cf6"
              color2="#ef4444"
              label1="Rata-rata Respon"
              label2="Target (3 min)"
              height={250}
            />
          </div>
        )}

        {/* Active Calls List */}
        {checkPermission('dashboard.active_calls') ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Panggilan Aktif ({activeCalls.length})
            </h3>
            <div className="space-y-3 max-h-[250px] overflow-y-auto scrollbar-thin">
              {activeCalls.map(call => (
                <div key={call.id} className={`p-3 rounded-lg border-l-4 ${
                  call.priority === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  call.priority === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                  call.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-gray-800 dark:text-white">
                        Kamar {call.roomNumber} - {call.patientName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{call.notes}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                      call.type === 'emergency' ? 'bg-red-100 text-red-700' :
                      call.type === 'bathroom' ? 'bg-purple-100 text-purple-700' :
                      call.type === 'medication' ? 'bg-green-100 text-green-700' :
                      call.type === 'meal' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {call.type === 'emergency' ? '🚨 Emergency' :
                       call.type === 'bathroom' ? '🚿 KM Mandi' :
                       call.type === 'medication' ? '💊 Obat' :
                       call.type === 'meal' ? '🍽️ Makan' : '📞 Reguler'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(call.timestamp).toLocaleTimeString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !checkPermission('dashboard.charts') && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center col-span-full">
              <Lock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Anda tidak memiliki izin untuk melihat konten ini</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, pulse }: {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  trend?: string;
  pulse?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.startsWith('+') ? 'text-green-500' : 'text-blue-500'}`}>
              {trend} dari kemarin
            </p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg text-white ${pulse ? 'animate-pulse' : ''}`}>
          {icon}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${color} opacity-50`}></div>
    </div>
  );
}
