import { useState } from 'react';
import { nurseCalls } from '../data/mockData';
import { NurseCall } from '../types';
import { Phone, Search, Filter, Clock, AlertTriangle, CheckCircle, XCircle, PhoneCall } from 'lucide-react';

export default function CallLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredCalls = nurseCalls.filter(call => {
    const matchesSearch = call.roomNumber.includes(searchTerm) ||
      call.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (call.notes && call.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || call.status === filterStatus;
    const matchesType = filterType === 'all' || call.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Phone className="w-4 h-4 text-red-500 animate-pulse" />;
      case 'answered': return <PhoneCall className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'missed': return <XCircle className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'answered': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'missed': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default: return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return '🚨';
      case 'bathroom': return '🚿';
      case 'medication': return '💊';
      case 'meal': return '🍽️';
      default: return '📞';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nomor kamar, nama pasien, atau catatan..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="answered">Dijawab</option>
              <option value="resolved">Selesai</option>
              <option value="missed">Tidak Terjawab</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
          >
            <option value="all">Semua Jenis</option>
            <option value="regular">Reguler</option>
            <option value="emergency">Emergency</option>
            <option value="bathroom">Kamar Mandi</option>
            <option value="medication">Obat</option>
            <option value="meal">Makan</option>
          </select>
        </div>
      </div>

      {/* Call Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kamar</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Pasien</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Jenis</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Prioritas</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Respon Oleh</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Durasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCalls.map(call => (
                <tr key={call.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  call.status === 'active' ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                }`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(call.status)}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(call.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      {call.roomNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{call.patientName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">
                      {getTypeIcon(call.type)} {call.type === 'emergency' ? 'Emergency' :
                        call.type === 'bathroom' ? 'Kamar Mandi' :
                        call.type === 'medication' ? 'Obat' :
                        call.type === 'meal' ? 'Makan' : 'Reguler'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityBadge(call.priority)}`}>
                      {call.priority === 'critical' ? 'Kritis' :
                       call.priority === 'high' ? 'Tinggi' :
                       call.priority === 'medium' ? 'Sedang' : 'Rendah'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(call.status)}`}>
                      {call.status === 'active' ? '🔴 Aktif' :
                       call.status === 'answered' ? '🔵 Dijawab' :
                       call.status === 'resolved' ? '🟢 Selesai' : '⚪ Tidak Terjawab'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {call.respondedBy || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {call.duration ? `${call.duration} min` : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCalls.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Tidak ada data panggilan ditemukan</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total" value={filteredCalls.length} color="bg-blue-500" />
        <SummaryCard label="Aktif" value={filteredCalls.filter(c => c.status === 'active').length} color="bg-red-500" />
        <SummaryCard label="Selesai" value={filteredCalls.filter(c => c.status === 'resolved').length} color="bg-green-500" />
        <SummaryCard label="Tidak Terjawab" value={filteredCalls.filter(c => c.status === 'missed').length} color="bg-gray-500" />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      <div className={`h-1 ${color} rounded-full mt-2`}></div>
    </div>
  );
}
