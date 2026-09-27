import { useState } from 'react';
import { rooms } from '../data/mockData';
import { Room, RoomStatus } from '../types';
import { MapPin, Bed, User, AlertTriangle, Phone, Bath, Pill, UtensilsCrossed } from 'lucide-react';

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

  const filteredRooms = filterStatus === 'all' ? rooms : rooms.filter(r => r.status === filterStatus);

  const statusCounts = {
    normal: rooms.filter(r => r.status === 'normal').length,
    calling: rooms.filter(r => r.status === 'calling').length,
    emergency: rooms.filter(r => r.status === 'emergency').length,
    answered: rooms.filter(r => r.status === 'answered').length,
    offline: rooms.filter(r => r.status === 'offline').length,
  };

  return (
    <div className="space-y-4">
      {/* Filter & Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Peta Lantai 1 - Rawat Inap</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="Semua"
              count={rooms.length}
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
                  y={room.position.y + 18}
                  textAnchor="middle"
                  fill="#1f2937"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {room.number}
                </text>
                {/* Patient Name */}
                {room.patient && (
                  <text
                    x={room.position.x + room.size.width / 2}
                    y={room.position.y + 33}
                    textAnchor="middle"
                    fill="#4b5563"
                    fontSize="8"
                  >
                    {room.patient.name.split(' ').slice(0, 2).join(' ')}
                  </text>
                )}
                {/* Bed Count */}
                <text
                  x={room.position.x + room.size.width / 2}
                  y={room.position.y + 48}
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="8"
                >
                  🛏️ {room.bedCount} bed
                </text>
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
                  <rect x={tooltipX} y={tooltipY} width="120" height="50" fill="#1f2937" rx="6" opacity="0.95" />
                  <text x={tooltipX + 8} y={tooltipY + 16} fill="#fff" fontSize="10" fontWeight="bold">
                    Kamar {room.number}
                  </text>
                  <text x={tooltipX + 8} y={tooltipY + 30} fill="#d1d5db" fontSize="9">
                    {room.patient?.name || 'Kosong'}
                  </text>
                  <text x={tooltipX + 8} y={tooltipY + 43} fill={
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

function FilterButton({ label, count, active, onClick, color }: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
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
