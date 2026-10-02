import { useState } from 'react';
import { rooms as initialRooms } from '../data/mockData';
import { Room, RoomStatus } from '../types';
import { MapPin, Bed, AlertTriangle, Phone, Eye, Plus, Edit } from 'lucide-react';
import RoomDetailView from './RoomDetailView';
import RoomFormModal from './RoomFormModal';

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
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<RoomStatus | 'all'>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [showRoomDetail, setShowRoomDetail] = useState<Room | null>(null);
  const [showRoomForm, setShowRoomForm] = useState<Room | null>(null);

  // Get unique wards
  const wards = Array.from(new Set(rooms.map((r: Room) => r.ward)));
  
  // Filter rooms by ward and status
  const filteredRooms = rooms.filter((r: Room) => {
    const wardMatch = selectedWard === 'all' || r.ward === selectedWard;
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    return wardMatch && statusMatch;
  });

  const statusCounts = {
    normal: rooms.filter((r: Room) => r.status === 'normal').length,
    calling: rooms.filter((r: Room) => r.status === 'calling').length,
    emergency: rooms.filter((r: Room) => r.status === 'emergency').length,
    answered: rooms.filter((r: Room) => r.status === 'answered').length,
    offline: rooms.filter((r: Room) => r.status === 'offline').length,
  };

  // Ward statistics
  const wardStats = wards.map(ward => {
    const wardRooms = rooms.filter((r: Room) => r.ward === ward);
    return {
      name: ward,
      totalRooms: wardRooms.length,
      totalBeds: wardRooms.reduce((sum: number, r: Room) => sum + r.bedCount, 0),
      occupiedBeds: wardRooms.filter((r: Room) => r.patients && r.patients.length > 0).reduce((sum: number, r: Room) => sum + (r.patients?.length || 0), 0),
      calling: wardRooms.filter((r: Room) => r.status === 'calling').length,
      emergency: wardRooms.filter((r: Room) => r.status === 'emergency').length,
    };
  });

  // Handle save room (add or edit)
  const handleSaveRoom = (room: Room) => {
    const existingIndex = rooms.findIndex((r: Room) => r.id === room.id);
    if (existingIndex >= 0) {
      // Update existing room
      const updatedRooms = [...rooms];
      updatedRooms[existingIndex] = room;
      setRooms(updatedRooms);
    } else {
      // Add new room with calculated position
      const lastRoom = rooms[rooms.length - 1];
      const newPosition = {
        x: lastRoom ? lastRoom.position.x + 140 : 50,
        y: lastRoom ? lastRoom.position.y : 80,
      };
      setRooms([...rooms, { ...room, position: newPosition }]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Ward Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Bangsal</h3>
          </div>
          <button
            onClick={() => setShowRoomForm({} as Room)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Kamar
          </button>
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
        <div className="relative w-full">
          <svg
            viewBox="0 0 1060 300"
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background */}
            <rect x="0" y="0" width="1060" height="300" fill="#f8fafc" rx="12" stroke="#e2e8f0" strokeWidth="2" />

            {/* Corridor */}
            <rect x="20" y="145" width="1020" height="15" fill="#e2e8f0" rx="3" />
            <text x="530" y="156" textAnchor="middle" fill="#64748b" fontSize="9">KORIDOR</text>

            {/* Nurse Station */}
            <rect x="480" y="260" width="100" height="25" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" rx="6" />
            <text x="530" y="276" textAnchor="middle" fill="#1e40af" fontSize="8" fontWeight="bold">👩‍⚕️ POS PERAWAT</text>

            {/* Wing Labels */}
            <text x="260" y="40" textAnchor="middle" fill="#374151" fontSize="12" fontWeight="bold">SAYAP KIRI</text>
            <text x="800" y="40" textAnchor="middle" fill="#374151" fontSize="12" fontWeight="bold">SAYAP KANAN</text>

            {/* Divider */}
            <line x1="530" y1="45" x2="530" y2="140" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />

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
                  y={room.position.y + 13}
                  textAnchor="middle"
                  fill="#1f2937"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {room.number}
                </text>
                
                {/* Ward Name */}
                <text
                  x={room.position.x + room.size.width / 2}
                  y={room.position.y + 22}
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="6"
                >
                  {room.ward}
                </text>
                
                {/* Bed Icons - Visualisasi Kasur */}
                {Array.from({ length: room.bedCount }).map((_, idx) => {
                  const bedX = room.position.x + 10 + (idx * 28);
                  const bedY = room.position.y + 35;
                  return (
                    <g key={idx}>
                      {/* Bed Frame - Kasur */}
                      <rect
                        x={bedX}
                        y={bedY}
                        width="24"
                        height="15"
                        fill="#8b5cf6"
                        stroke="#6d28d9"
                        strokeWidth="0.8"
                        rx="1.5"
                      />
                      {/* Pillow - Bantal */}
                      <rect
                        x={bedX + 1.5}
                        y={bedY + 1.5}
                        width="6"
                        height="5"
                        fill="#e9d5ff"
                        stroke="#c4b5fd"
                        strokeWidth="0.4"
                        rx="0.8"
                      />
                      {/* Blanket - Selimut */}
                      <rect
                        x={bedX + 9}
                        y={bedY + 1.5}
                        width="13"
                        height="12"
                        fill="#c4b5fd"
                        stroke="#a78bfa"
                        strokeWidth="0.4"
                        rx="0.8"
                      />
                      {/* Blanket Pattern - Motif Selimut */}
                      <line
                        x1={bedX + 10}
                        y1={bedY + 3}
                        x2={bedX + 21}
                        y2={bedY + 3}
                        stroke="#a78bfa"
                        strokeWidth="0.3"
                      />
                      <line
                        x1={bedX + 10}
                        y1={bedY + 6.5}
                        x2={bedX + 21}
                        y2={bedY + 6.5}
                        stroke="#a78bfa"
                        strokeWidth="0.3"
                      />
                      <line
                        x1={bedX + 10}
                        y1={bedY + 10}
                        x2={bedX + 21}
                        y2={bedY + 10}
                        stroke="#a78bfa"
                        strokeWidth="0.3"
                      />
                    </g>
                  );
                })}
                
                {/* Bathroom Icon - Kamar Mandi */}
                <g>
                  {/* Bathroom Room - Ruangan Kamar Mandi */}
                  <rect
                    x={room.position.x + room.size.width - 30}
                    y={room.position.y + 35}
                    width="24"
                    height="24"
                    fill="#06b6d4"
                    stroke="#0891b2"
                    strokeWidth="0.8"
                    rx="2"
                  />
                  {/* Shower Head - Kepala Shower */}
                  <circle
                    cx={room.position.x + room.size.width - 18}
                    cy={room.position.y + 42}
                    r="3.5"
                    fill="#67e8f9"
                    stroke="#22d3ee"
                    strokeWidth="0.4"
                  />
                  {/* Shower Pipe - Pipa Shower */}
                  <line
                    x1={room.position.x + room.size.width - 18}
                    y1={room.position.y + 38.5}
                    x2={room.position.x + room.size.width - 18}
                    y2={room.position.y + 42}
                    stroke="#22d3ee"
                    strokeWidth="1.2"
                  />
                  {/* Water Drops - Tetesan Air */}
                  <line
                    x1={room.position.x + room.size.width - 18}
                    y1={room.position.y + 45.5}
                    x2={room.position.x + room.size.width - 18}
                    y2={room.position.y + 50}
                    stroke="#67e8f9"
                    strokeWidth="0.8"
                  />
                  <line
                    x1={room.position.x + room.size.width - 21}
                    y1={room.position.y + 47}
                    x2={room.position.x + room.size.width - 21}
                    y2={room.position.y + 50}
                    stroke="#67e8f9"
                    strokeWidth="0.8"
                  />
                  <line
                    x1={room.position.x + room.size.width - 15}
                    y1={room.position.y + 47}
                    x2={room.position.x + room.size.width - 15}
                    y2={room.position.y + 50}
                    stroke="#67e8f9"
                    strokeWidth="0.8"
                  />
                  {/* Toilet Icon - Ikon Toilet */}
                  <ellipse
                    cx={room.position.x + room.size.width - 24}
                    cy={room.position.y + 54}
                    rx="2.5"
                    ry="3.5"
                    fill="#e0f2fe"
                    stroke="#0284c7"
                    strokeWidth="0.4"
                  />
                </g>
                
                {/* Patient Name (if occupied) */}
                {room.patients && room.patients.length > 0 && (
                  <text
                    x={room.position.x + room.size.width / 2}
                    y={room.position.y + room.size.height - 6}
                    textAnchor="middle"
                    fill="#4b5563"
                    fontSize="7"
                    fontWeight="500"
                  >
                    {room.patients[0].name.split(' ').slice(0, 2).join(' ')}
                  </text>
                )}
                
                {/* Status Indicator */}
                {(room.status === 'calling' || room.status === 'emergency') && (
                  <circle
                    cx={room.position.x + room.size.width - 8}
                    cy={room.position.y + 8}
                    r="5"
                    fill={room.status === 'emergency' ? '#ef4444' : '#f59e0b'}
                    stroke="white"
                    strokeWidth="1.2"
                    className="animate-pulse"
                  />
                )}

                {/* View Floor Plan Button - Eye Icon */}
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoomDetail(room);
                  }}
                  className="cursor-pointer"
                >
                  <circle
                    cx={room.position.x + 12}
                    cy={room.position.y + room.size.height - 12}
                    r="6"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="0.8"
                    opacity="0.8"
                  />
                  <text
                    x={room.position.x + 12}
                    y={room.position.y + room.size.height - 9}
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                  >
                    👁
                  </text>
                </g>
              </g>
            ))}

            {/* Tooltip for hovered room */}
            {hoveredRoom && (() => {
              const room = rooms.find(r => r.id === hoveredRoom);
              if (!room) return null;
              
              // Adjust tooltip position to avoid cutoff
              let tooltipX = room.position.x + room.size.width + 5;
              let tooltipY = room.position.y;
              
              // If tooltip would go off right edge, show it on the left
              if (tooltipX + 160 > 1060) {
                tooltipX = room.position.x - 165;
              }
              
              // If tooltip would go off bottom edge, move it up
              if (tooltipY + 75 > 300) {
                tooltipY = 300 - 75;
              }
              
              return (
                <g>
                  <rect x={tooltipX} y={tooltipY} width="160" height="75" fill="#1f2937" rx="6" opacity="0.95" />
                  <text x={tooltipX + 8} y={tooltipY + 16} fill="#fff" fontSize="10" fontWeight="bold">
                    Kamar {room.number}
                  </text>
                  <text x={tooltipX + 8} y={tooltipY + 28} fill="#a78bfa" fontSize="8">
                    🏠 Bangsal {room.ward}
                  </text>
                  <text x={tooltipX + 8} y={tooltipY + 40} fill="#d1d5db" fontSize="8">
                    👤 {room.patients?.[0]?.name || 'Kosong'}
                  </text>
                  <text x={tooltipX + 8} y={tooltipY + 52} fill="#d1d5db" fontSize="8">
                    🛏️ {room.bedCount} Kasur | 🚿 KM
                  </text>
                  <text x={tooltipX + 8} y={tooltipY + 66} fill={
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
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300 dark:border-gray-600">
            <div className="w-6 h-4 rounded bg-purple-500 border border-purple-700"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">🛏️ Kasur</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyan-500 border border-cyan-700"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">🚿 Kamar Mandi</span>
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
              className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${statusColors[room.status]} ${
                selectedRoom?.id === room.id ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : ''
              }`}
            >
              <div className="text-center">
                <p className="font-bold text-sm">{room.number}</p>
                <p className="text-xs mt-1 text-purple-600 dark:text-purple-400">
                  {room.ward}
                </p>
                <p className="text-xs mt-1 truncate">
                  {room.patients?.[0]?.name.split(' ')[0] || 'Kosong'}
                </p>
                <div className="flex justify-center gap-1 mt-2 text-xs">
                  <span title={`${room.bedCount} Kasur`}>🛏️{room.bedCount}</span>
                  <span title="Kamar Mandi">🚿</span>
                </div>
                <div className="flex justify-center mt-1">
                  {room.status === 'calling' && <Phone className="w-3 h-3 animate-pulse" />}
                  {room.status === 'emergency' && <AlertTriangle className="w-3 h-3 animate-pulse" />}
                  {room.status === 'answered' && <CheckIcon />}
                  {room.status === 'normal' && <Bed className="w-3 h-3" />}
                  {room.status === 'offline' && <span className="text-xs">⚫</span>}
                </div>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => setShowRoomDetail(room)}
                    className="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    title="Lihat Denah Kamar"
                  >
                    <Eye className="w-3 h-3" />
                    Denah
                  </button>
                  <button
                    onClick={() => setShowRoomForm(room)}
                    className="flex-1 px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    title="Edit Kamar"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRoom(room);
                      onRoomSelect(room);
                    }}
                    className="flex-1 px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                    title="Detail Pasien"
                  >
                    Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Detail View Modal */}
      {showRoomDetail && (
        <RoomDetailView
          room={showRoomDetail}
          onClose={() => setShowRoomDetail(null)}
        />
      )}

      {/* Room Form Modal */}
      {showRoomForm && (
        <RoomFormModal
          room={showRoomForm.id ? showRoomForm : null}
          wards={wards}
          onSave={handleSaveRoom}
          onClose={() => setShowRoomForm(null)}
        />
      )}
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
