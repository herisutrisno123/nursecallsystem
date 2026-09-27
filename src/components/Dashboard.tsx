import { dashboardStats, hourlyCallData, callTypeData, responseTimeData, nurseCalls } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts';
import { Activity, Phone, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';

export default function Dashboard() {
  const stats = dashboardStats;
  const activeCalls = nurseCalls.filter(c => c.status === 'active');

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Calls Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Panggilan Per Jam</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyCallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="calls" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Total" />
              <Area type="monotone" dataKey="emergency" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Emergency" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Call Type Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Jenis Panggilan</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={callTypeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {callTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Time Chart & Active Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Waktu Respon (menit)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="avgTime" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="Rata-rata" />
              <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active Calls List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Panggilan Aktif ({activeCalls.length})
          </h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
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
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    call.type === 'emergency' ? 'bg-red-100 text-red-700' :
                    call.type === 'bathroom' ? 'bg-purple-100 text-purple-700' :
                    call.type === 'medication' ? 'bg-green-100 text-green-700' :
                    call.type === 'meal' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {call.type === 'emergency' ? '🚨 Emergency' :
                     call.type === 'bathroom' ? '🚿 Kamar Mandi' :
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
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, pulse }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
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
