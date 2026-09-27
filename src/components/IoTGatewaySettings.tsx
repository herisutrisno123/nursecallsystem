import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Wifi, WifiOff, Server, Database, Activity, 
  Plus, Edit2, Trash2, Save, RefreshCw, 
  AlertCircle, CheckCircle, Clock, Signal,
  Settings, Play, Pause, Download
} from 'lucide-react';

interface IoTDevice {
  id: string;
  name: string;
  type: 'nurse_call' | 'sensor' | 'gateway';
  ipAddress: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  roomNumber?: string;
  dataPoints: number;
}

interface GatewayConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: 'mqtt' | 'http' | 'tcp' | 'websocket';
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastConnected: string;
  pollingInterval: number;
  autoReconnect: boolean;
  database: string;
}

interface IoTLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  device?: string;
}

export default function IoTGatewaySettings() {
  const { checkPermission } = useAuth();
  
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig>({
    id: 'gw-001',
    name: 'NurseCall Gateway Utama',
    host: '192.168.1.100',
    port: 1883,
    protocol: 'mqtt',
    status: 'disconnected',
    lastConnected: '',
    pollingInterval: 5,
    autoReconnect: true,
    database: 'nursecall_db',
  });

  const [devices, setDevices] = useState<IoTDevice[]>([
    {
      id: 'dev-001',
      name: 'Nurse Call Panel Lantai 1',
      type: 'nurse_call',
      ipAddress: '192.168.1.101',
      port: 8080,
      status: 'online',
      lastSeen: new Date().toISOString(),
      roomNumber: '101-120',
      dataPoints: 1250,
    },
    {
      id: 'dev-002',
      name: 'Nurse Call Panel Lantai 2',
      type: 'nurse_call',
      ipAddress: '192.168.1.102',
      port: 8080,
      status: 'online',
      lastSeen: new Date().toISOString(),
      roomNumber: '201-220',
      dataPoints: 980,
    },
    {
      id: 'dev-003',
      name: 'Sensor Suhu Ruang ICU',
      type: 'sensor',
      ipAddress: '192.168.1.103',
      port: 8081,
      status: 'online',
      lastSeen: new Date().toISOString(),
      dataPoints: 5420,
    },
    {
      id: 'dev-004',
      name: 'Gateway Backup',
      type: 'gateway',
      ipAddress: '192.168.1.104',
      port: 1883,
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
      dataPoints: 0,
    },
  ]);

  const [logs, setLogs] = useState<IoTLog[]>([
    {
      id: 'log-001',
      timestamp: new Date().toISOString(),
      type: 'info',
      message: 'Sistem IoT Gateway dimulai',
    },
    {
      id: 'log-002',
      timestamp: new Date().toISOString(),
      type: 'success',
      message: 'Berhasil terhubung ke Nurse Call Panel Lantai 1',
      device: 'dev-001',
    },
    {
      id: 'log-003',
      timestamp: new Date().toISOString(),
      type: 'warning',
      message: 'Gateway Backup tidak merespon',
      device: 'dev-004',
    },
  ]);

  const [showAddDevice, setShowAddDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<IoTDevice | null>(null);
  const [newDevice, setNewDevice] = useState<Partial<IoTDevice>>({
    name: '',
    type: 'nurse_call',
    ipAddress: '',
    port: 8080,
    roomNumber: '',
  });

  // Simulasi koneksi gateway
  const connectGateway = () => {
    setGatewayConfig({ ...gatewayConfig, status: 'connecting' });
    addLog('info', 'Mencoba menghubungkan ke gateway...');
    
    setTimeout(() => {
      setGatewayConfig({ 
        ...gatewayConfig, 
        status: 'connected',
        lastConnected: new Date().toISOString()
      });
      addLog('success', 'Berhasil terhubung ke IoT Gateway');
      
      // Simulasi data dari devices
      setTimeout(() => {
        addLog('info', 'Mulai menerima data dari perangkat...', 'dev-001');
      }, 1000);
    }, 2000);
  };

  const disconnectGateway = () => {
    setGatewayConfig({ ...gatewayConfig, status: 'disconnected' });
    addLog('info', 'Gateway diputuskan');
  };

  const addLog = (type: IoTLog['type'], message: string, device?: string) => {
    const newLog: IoTLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      device,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const addDevice = () => {
    if (!newDevice.name || !newDevice.ipAddress) {
      addLog('error', 'Gagal menambah device: data tidak lengkap');
      return;
    }

    const device: IoTDevice = {
      id: `dev-${Date.now()}`,
      name: newDevice.name || '',
      type: newDevice.type || 'nurse_call',
      ipAddress: newDevice.ipAddress || '',
      port: newDevice.port || 8080,
      status: 'offline',
      lastSeen: new Date().toISOString(),
      roomNumber: newDevice.roomNumber,
      dataPoints: 0,
    };

    setDevices([...devices, device]);
    addLog('success', `Device "${device.name}" berhasil ditambahkan`, device.id);
    setShowAddDevice(false);
    setNewDevice({ name: '', type: 'nurse_call', ipAddress: '', port: 8080, roomNumber: '' });
  };

  const deleteDevice = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    setDevices(devices.filter(d => d.id !== deviceId));
    if (device) {
      addLog('warning', `Device "${device.name}" dihapus`, deviceId);
    }
  };

  const testConnection = (device: IoTDevice) => {
    addLog('info', `Menguji koneksi ke ${device.name}...`, device.id);
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      if (success) {
        addLog('success', `Koneksi ke ${device.name} berhasil`, device.id);
        setDevices(devices.map(d => 
          d.id === device.id ? { ...d, status: 'online', lastSeen: new Date().toISOString() } : d
        ));
      } else {
        addLog('error', `Koneksi ke ${device.name} gagal`, device.id);
        setDevices(devices.map(d => 
          d.id === device.id ? { ...d, status: 'error' } : d
        ));
      }
    }, 1500);
  };

  const exportLogs = () => {
    const logData = logs.map(log => ({
      timestamp: new Date(log.timestamp).toLocaleString('id-ID'),
      type: log.type,
      message: log.message,
      device: log.device || '-',
    }));
    
    const csv = [
      ['Timestamp', 'Type', 'Message', 'Device ID'].join(','),
      ...logData.map(row => [
        row.timestamp,
        row.type,
        `"${row.message}"`,
        row.device,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iot-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('info', 'Log IoT diekspor ke CSV');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-gray-400" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'offline':
      case 'disconnected':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      case 'connecting':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'error':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Gateway Configuration */}
      {checkPermission('settings.iot_gateway') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Konfigurasi IoT Gateway
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {gatewayConfig.status === 'connected' ? (
                <button
                  onClick={disconnectGateway}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Putuskan
                </button>
              ) : (
                <button
                  onClick={connectGateway}
                  disabled={gatewayConfig.status === 'connecting'}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  {gatewayConfig.status === 'connecting' ? 'Menghubungkan...' : 'Hubungkan'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Gateway
              </label>
              <input
                type="text"
                value={gatewayConfig.name}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Protocol
              </label>
              <select
                value={gatewayConfig.protocol}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, protocol: e.target.value as GatewayConfig['protocol'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="mqtt">MQTT</option>
                <option value="http">HTTP/REST</option>
                <option value="tcp">TCP Socket</option>
                <option value="websocket">WebSocket</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Host / IP Address
              </label>
              <input
                type="text"
                value={gatewayConfig.host}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, host: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Port
              </label>
              <input
                type="number"
                value={gatewayConfig.port}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, port: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Polling Interval (detik)
              </label>
              <input
                type="number"
                value={gatewayConfig.pollingInterval}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, pollingInterval: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Database
              </label>
              <input
                type="text"
                value={gatewayConfig.database}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, database: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="nursecall_db"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="autoReconnect"
              checked={gatewayConfig.autoReconnect}
              onChange={(e) => setGatewayConfig({ ...gatewayConfig, autoReconnect: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoReconnect" className="text-sm text-gray-700 dark:text-gray-300">
              Auto Reconnect jika koneksi terputus
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(gatewayConfig.status)}
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  Status: {gatewayConfig.status === 'connected' ? 'Terhubung' : 
                           gatewayConfig.status === 'connecting' ? 'Menghubungkan...' :
                           gatewayConfig.status === 'disconnected' ? 'Terputus' : 'Error'}
                </p>
                {gatewayConfig.lastConnected && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Terakhir terhubung: {new Date(gatewayConfig.lastConnected).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              Simpan Konfigurasi
            </button>
          </div>
        </div>
      )}

      {/* IoT Devices */}
      {checkPermission('settings.iot_devices') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Signal className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Device IoT ({devices.length})
              </h3>
            </div>
            <button
              onClick={() => setShowAddDevice(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Device
            </button>
          </div>

          <div className="space-y-3">
            {devices.map(device => (
              <div
                key={device.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-white">{device.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                        {device.status === 'online' ? 'Online' : 
                         device.status === 'offline' ? 'Offline' : 
                         device.status === 'error' ? 'Error' : device.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Tipe</p>
                        <p className="font-medium text-gray-800 dark:text-white capitalize">
                          {device.type.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">IP Address</p>
                        <p className="font-medium text-gray-800 dark:text-white font-mono">
                          {device.ipAddress}:{device.port}
                        </p>
                      </div>
                      {device.roomNumber && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Room</p>
                          <p className="font-medium text-gray-800 dark:text-white">{device.roomNumber}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Data Points</p>
                        <p className="font-medium text-gray-800 dark:text-white">{device.dataPoints.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Terakhir terlihat: {new Date(device.lastSeen).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => testConnection(device)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Test Connection"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingDevice(device);
                        setNewDevice(device);
                        setShowAddDevice(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDevice(device.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IoT Logs */}
      {checkPermission('settings.iot_logs') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Log Aktivitas IoT
              </h3>
            </div>
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map(log => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <Clock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getLogTypeColor(log.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${getLogTypeColor(log.type)}`}>
                    {log.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                    {log.device && ` • Device: ${log.device}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Device Modal */}
      {showAddDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {editingDevice ? 'Edit Device' : 'Tambah Device IoT'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Device
                </label>
                <input
                  type="text"
                  value={newDevice.name || ''}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Nurse Call Panel Lantai 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipe Device
                </label>
                <select
                  value={newDevice.type || 'nurse_call'}
                  onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value as IoTDevice['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="nurse_call">Nurse Call</option>
                  <option value="sensor">Sensor</option>
                  <option value="gateway">Gateway</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IP Address
                </label>
                <input
                  type="text"
                  value={newDevice.ipAddress || ''}
                  onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono"
                  placeholder="192.168.1.105"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={newDevice.port || 8080}
                  onChange={(e) => setNewDevice({ ...newDevice, port: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              {newDevice.type === 'nurse_call' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Number (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newDevice.roomNumber || ''}
                    onChange={(e) => setNewDevice({ ...newDevice, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="301-320"
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowAddDevice(false);
                  setEditingDevice(null);
                  setNewDevice({ name: '', type: 'nurse_call', ipAddress: '', port: 8080, roomNumber: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={addDevice}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                {editingDevice ? 'Update' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
