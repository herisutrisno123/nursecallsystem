import { useState } from 'react';
import { rooms } from '../data/mockData';
import { Room, RoomStatus } from '../types';
import { MapPin, Bed, AlertTriangle, Phone } from 'lucide-react';

interface FloorMapProps {
  onRoomSelect: (room: Room) => void;
}

const statusColors: Record<RoomStatus, string> = {
  normal: 'bg-green-100 border-green-400 text-green-800',
  calling: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  emergency: 'bg-red-100 border-red-500 text-red-800',
  answered: 'bg-blue-100 border-blue-400 text-blue-800',
  offline: 'bg-gray-100 border-gray-300 text-gray-500',
};

const statusBgColors: Record<RoomStatus, string> = {
  normal: 'fill-green-200 stroke-green-500',
  calling: 'fill-yellow-200 stroke-yellow-500',
  emergency: 'fill-red-200 stroke-red-500',
  answered: 'fill-blue-200 stroke-blue-500',
  offline: 'fill-gray-200 stroke-gray-400',
};

const statusLabels: Record<RoomStatus, string> = {
  normal: 'Normal',
  calling: 'Memanggil',
  emergency: 'Emergency',
  answered: 'Dijawab',
  offline: 'Offline',
};

export default function FloorMap({ onRoomSelect }: FloorMapProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<RoomStatus | 'all'>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');

  // Get unique wards
  const wards = Array.from(new Set(rooms.map(r => r.ward)));
  
  // Filter rooms by ward and status
  const filteredRooms = rooms.filter(r => {
    const wardMatch = selectedWard === 'all' || r.ward === selectedWard;
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    return wardMatch && statusMatch;
  });

  const statusCounts = {
    normal: rooms.filter(r => r.status === 'normal').length,
    calling: rooms.filter(r => r.status === 'calling').length,
    emergency: rooms.filter(r => r.status === 'emergency').length,
    answered: rooms.filter(r => r.status === 'answered').length,
    offline: rooms.filter(r => r.status === 'offline').length,
  };

  // Ward statistics
  const wardStats = wards.map(ward => {
    const wardRooms = rooms.filter(r => r.ward === ward);
    return {
      name: ward,
      totalRooms: wardRooms.length,
      totalBeds: wardRooms.reduce((sum, r) => sum + r.bedCount, 0),
      occupiedBeds: wardRooms.filter(r => r.patient).reduce((sum, r) => sum + r.bedCount, 0),
      calling: wardRooms.filter(r => r.status === 'calling').length,
      emergency: wardRooms.filter(r => r.status === 'emergency').length,
    };
  });

  return (
    <div className="space-y-4">
      {/* Ward Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Bangsal</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Semua Bangsal"
            count={rooms.length}
            active={selectedWard === 'all'}
            onClick={() => setSelectedWard('all')}
            color="bg-purple-500"
          />
          {wards.map(ward => {
            const wardRooms = rooms.filter(r => r.ward === ward);
            const wardCalling = wardRooms.filter(r => r.status === 'calling').length;
            const wardEmergency = wardRooms.filter(r => r.status === 'emergency').length;
            return (
              <FilterButton
                key={ward}
                label={`Bangsal ${ward}`}
                count={wardRooms.length}
                active={selectedWard === ward}
                onClick={() => setSelectedWard(ward)}
                color="bg-purple-500"
                subtitle={wardCalling > 0 || wardEmergency > 0 ? `🔔${wardCalling} 🚨${wardEmergency}` : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Ward Statistics */}
      {selectedWard === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wardStats.map(stat => (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Bangsal {stat.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Kamar:</span>
                  <span className="font-medium text-gray-800 dark:text-white">{stat.totalRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Bed:</span>
                  <span className="font-medium text-gray-800 dark:text-white">{stat.totalBeds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Terisi:</span>
                  <span className="font-medium text-gray-800 dark:text-white">{stat.occupiedBeds}/{stat.totalBeds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Panggilan Aktif:</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">{stat.calling}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Emergency:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{stat.emergency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {selectedWard === 'all' ? 'Peta Lantai 1 - Semua Bangsal' : `Peta Lantai 1 - Bangsal ${selectedWard}`}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="Semua"
              count={filteredRooms.length}
              active={filterStatus === 'all'}
              onClick={() => setFilterStatus('all')}
              color="bg-gray-500"
            />
            <FilterButton
              label="Normal"
              count={statusCounts.normal}
              active={filterStatus === 'normal'}
              onClick={() => setFilterStatus('normal')}
              color="bg-green-500"
            />
            <FilterButton
              label="Memanggil"
              count={statusCounts.calling}
              active={filterStatus === 'calling'}
              onClick={() => setFilterStatus('calling')}
              color="bg-yellow-500"
            />
            <FilterButton
              label="Emergency"
              count={statusCounts.emergency}
              active={filterStatus === 'emergency'}
              onClick={() => setFilterStatus('emergency')}
              color="bg-red-500"
            />
            <FilterButton
              label="Dijawab"
              count={statusCounts.answered}
              active={filterStatus === 'answered'}
              onClick={() => setFilterStatus('answered')}
              color="bg-blue-500"
            />
            <FilterButton
              label="Offline"
              count={statusCounts.offline}
              active={filterStatus === 'offline'}
              onClick={() => setFilterStatus('offline')}
              color="bg-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Floor Map SVG */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox="0 0 930 300"
            className="w-full min-w-[700px] h-auto"
            style={{ maxHeight: '500px' }}
          >
            {/* Background */}
            <rect x="0" y="0" width="930" height="300" fill="#f8fafc" rx="12" stroke="#e2e8f0" strokeWidth="2" />

            {/* Corridor */}
            <rect x="30" y="150" width="870" height="20" fill="#e2e8f0" rx="4" />
            <text x="465" y="164" textAnchor="middle" className="text-[10px]" fill="#64748b" fontSize="10">KORIDOR</text>

            {/* Nurse Station */}
            <rect x="420" y="240" width="100" height="45" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" rx="8" />
            <text x="470" y="260" textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="bold">NURSE STATION</text>
            <text x="470" y="275" textAnchor="middle" fill="#3b82f6" fontSize="9">👩‍⚕️ Pos Perawat</text>

            {/* Wing Labels */}
            <text x="200" y="40" textAnchor="middle" fill="#374151" fontSize="14" fontWeight="bold">SAYAP KIRI</text>
            <text x="700" y="40" textAnchor="middle" fill="#374151" fontSize="14" fontWeight="bold">SAYAP KANAN</text>

            {/* Divider */}
            <line x1="465" y1="50" x2="465" y2="140" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />

            {/* Rooms */}
            {filteredRooms.map(room => (
              <g
                key={room.id}
                onClick={() => {
                  setSelectedRoom(room);
                  onRoomSelect(room);
                }}
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
                className="cursor-pointer"
              >
                {/* Room Background */}
                <rect
                  x={room.position.x}
                  y={room.position.y}
                  width={room.size.width}
                  height={room.size.height}
                  className={`${statusBgColors[room.status]} transition-all duration-200`}
                  strokeWidth={hoveredRoom === room.id ? 3 : 2}
                  rx="6"
                  style={{
                    filter: hoveredRoom === room.id ? 'brightness(0.95)' : 'none',
                    transform: hoveredRoom === room.id ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: `${room.position.x + room.size.width / 2}px ${room.position.y + room.size.height / 2}px`,
                  }}
                />
                
                {/* Room Number */}
                <text
                  x={room.position.x + room.size.width / 2}
                  y={room.position.y + 15}
                  textAnchor="middle"
                  fill="#1f2937"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {room.number}
                </text>
                
                {/* Ward Name */}
                <text
                  x={room.position.x + room.size.width / 2}
                  y={room.position.y + 25}
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="7"
                >
                  {room.ward}
                </text>
                
                {/* Bed Icons */}
                {Array.from({ length: room.bedCount }).map((_, idx) => {
                  const bedX = room.position.x + 10 + (idx * 20);
                  const bedY = room.position.y + 35;
                  return (
                    <g key={idx}>
                      {/* Bed Frame */}
                      <rect
                        x={bedX}
                        y={bedY}
                        width="16"
                        height="10"
                        fill="#8b5cf6"
                        stroke="#6d28d9"
                        strokeWidth="0.5"
                        rx="1"
                      />
                      {/* Pillow */}
                      <rect
                        x={bedX + 1}
                        y={bedY + 1}
                        width="4"
                        height="3"
                        fill="#e9d5ff"
                        rx="0.5"
                      />
                      {/* Blanket */}
                      <rect
                        x={bedX + 6}
                        y={bedY + 1}
                        width="9"
                        height="8"
                        fill="#c4b5fd"
                        rx="0.5"
                      />
                    </g>
                  );
                })}
                
                {/* Bathroom Icon */}
                <g>
                  <rect
                    x={room.position.x + room.size.width - 20}
                    y={room.position.y + 35}
                    width="14"
                    height="14"
                    fill="#06b6d4"
                    stroke="#0891b2"
                    strokeWidth="0.5"
                    rx="2"
                  />
                  {/* Shower Head */}
                  <circle
                    cx={room.position.x + room.size.width - 13}
                    cy={room.position.y + 39}
                    r="2"
                    fill="#67e8f9"
                  />
                  {/* Water Drops */}
                  <line
                    x1={room.position.x + room.size.width - 13}
                    y1={room.position.y + 41}
                    x2={room.position.x + room.size.width - 13}
                    y2={room.position.y + 44}
                    stroke="#67e8f9"
                    strokeWidth="0.5"
                  />
                  <line
                    x1={room.position.x + room.size.width - 15}
                    y1={room.position.y + 42}
                    x2={room.position.x + room.size.width - 15}
                    y2={room.position.y + 44}
                    stroke="#67e8f9"
                    strokeWidth="0.5"
                  />
                  <line
                    x1={room.position.x + room.size.width - 11}
                    y1={room.position.y + 42}
                    x2={room.position.x + room.size.width - 11}
                    y2={room.position.y + 44}
                    stroke="#67e8f9"
                    strokeWidth="0.5"
                  />
                </g>
                
                {/* Patient Name (if occupied) */}
                {room.patient && (
                  <text
                    x={room.position.x + room.size.width / 2}
                    y={room.position.y + room.size.height - 5}
                    textAnchor="middle"
                    fill="#4b5563"
                    fontSize="7"
                    fontWeight="500"
                  >
                    {room.patient.name.split(' ').slice(0, 2).join(' ')}
                  </text>
                )}
                
                {/* Status Indicator */}
                {(room.status === 'calling' || room.status === 'emergency') && (
                  <circle
                    cx={room.position.x + room.size.width - 8}
                    cy={room.position.y + 8}
                    r="5"
                    fill={room.status === 'emergency' ? '#ef4444' : '#f59e0b'}
                    className="animate-pulse"
                  />
                )}
              </g>
            ))}

            {/* Tooltip for hovered room */}
            {hoveredRoom && (() => {
              const room = rooms.find(r => r.id === hoveredRoom);
              if (!room) return null;
              const tooltipX = room.position.x + room.size.width + 5;
              const tooltipY = room.position.y;
              return (
                <g>
                  <rect x={tooltipX} y={tooltipY} width="140" height="65" fill="#1f2937" rx="6" opacity="0.95" />
                  <text x={tooltipX + 8} y={tooltipY + 16} fill="#fff" fontSize="10" fontWeight="bold">
                    Kamar {room.number} - Bangsal {room.ward}
                  </text>
                  <text x={tooltipX + 8} y={tooltipY + 30} fill="#d1d5db" fontSize="9">
                    {room.patient?.name || 'Kosong'}
                  </text>
                  <text x={tooltipX + 8} y={tooltipY + 43} fill="#d1d5db" fontSize="9">
                    {room.bedCount} Bed
                  </text>
                  <text x={tooltipX + 8} y={tooltipY + 56} fill={
                    room.status === 'emergency' ? '#ef4444' :
                    room.status === 'calling' ? '#f59e0b' :
                    room.status === 'answered' ? '#3b82f6' :
                    room.status === 'offline' ? '#9ca3af' : '#22c55e'
                  } fontSize="9" fontWeight="bold">
                    {statusLabels[room.status]}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-200 border-2 border-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-200 border-2 border-yellow-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Memanggil</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-200 border-2 border-red-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-200 border-2 border-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Dijawab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200 border-2 border-gray-400"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Offline</span>
          </div>
        </div>
      </div>

      {/* Room Grid View */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Detail Kamar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              onClick={() => {
                setSelectedRoom(room);
                onRoomSelect(room);
              }}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${statusColors[room.status]} ${
                selectedRoom?.id === room.id ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : ''
              }`}
            >
              <div className="text-center">
                <p className="font-bold text-sm">{room.number}</p>
                <p className="text-xs mt-1 truncate">
                  {room.patient?.name.split(' ')[0] || 'Kosong'}
                </p>
                <div className="flex justify-center mt-1">
                  {room.status === 'calling' && <Phone className="w-3 h-3 animate-pulse" />}
                  {room.status === 'emergency' && <AlertTriangle className="w-3 h-3 animate-pulse" />}
                  {room.status === 'answered' && <CheckIcon />}
                  {room.status === 'normal' && <Bed className="w-3 h-3" />}
                  {room.status === 'offline' && <span className="text-xs">⚫</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ label, count, active, onClick, color, subtitle }: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
  subtitle?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
        active
          ? `${color} text-white shadow-md`
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'}`}>
        {count}
      </span>
      {subtitle && (
        <span className="text-[10px] opacity-75">{subtitle}</span>
      )}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}
