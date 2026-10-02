import { Room } from '../types';
import { X, ArrowLeft } from 'lucide-react';

interface RoomDetailViewProps {
  room: Room;
  onClose: () => void;
}

export default function RoomDetailView({ room, onClose }: RoomDetailViewProps) {
  const statusColors = {
    normal: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' },
    calling: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800' },
    emergency: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800' },
    answered: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' },
    offline: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-600' },
  };

  const status = statusColors[room.status];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="absolute inset-0 bg-white dark:bg-gray-800 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 ${status.bg} ${status.border} border-b-2 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-white/30 hover:bg-white/50 rounded-lg transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Denah Kamar {room.number}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bangsal {room.ward} • Lantai {room.floor}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Tutup"
            >
              <X className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Content - Full Screen Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Room Layout SVG */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 2400 1800" className="w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ maxHeight: '100%', maxWidth: '100%' }}>
                {/* Room Walls */}
                <rect x="200" y="200" width="2000" height="1400" fill="#f8fafc" stroke="#64748b" strokeWidth="16" rx="16" />
                
                {/* Floor Pattern */}
                <pattern id="floorPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <rect width="80" height="80" fill="#f1f5f9" />
                  <rect width="40" height="40" fill="#e2e8f0" />
                  <rect x="40" y="40" width="40" height="40" fill="#e2e8f0" />
                </pattern>
                <rect x="200" y="200" width="2000" height="1400" fill="url(#floorPattern)" />

                {/* Door - Pintu Masuk */}
                <rect x="200" y="800" width="16" height="240" fill="#8b5cf6" />
                <path d="M 200 800 Q 80 920 200 1040" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeDasharray="20,20" />
                <text x="60" y="940" fontSize="48" fill="#6b7280" fontWeight="bold">PINTU</text>

                {/* Window - Jendela */}
                <rect x="2184" y="480" width="16" height="320" fill="#06b6d4" />
                <line x1="2192" y1="480" x2="2192" y2="800" stroke="#67e8f9" strokeWidth="8" />
                <text x="2220" y="660" fontSize="40" fill="#6b7280">JENDELA</text>

                {/* Bathroom - Kamar Mandi */}
                <rect x="1520" y="200" width="680" height="480" fill="#e0f2fe" stroke="#0284c7" strokeWidth="8" rx="16" />
                <text x="1860" y="300" textAnchor="middle" fontSize="56" fill="#0369a1" fontWeight="bold">KAMAR MANDI</text>
                
                {/* Shower */}
                <circle cx="1680" cy="440" r="60" fill="#67e8f9" stroke="#0891b2" strokeWidth="8" />
                <circle cx="1680" cy="440" r="32" fill="#22d3ee" />
                <line x1="1680" y1="380" x2="1680" y2="440" stroke="#0891b2" strokeWidth="12" />
                <line x1="1660" y1="500" x2="1660" y2="540" stroke="#67e8f9" strokeWidth="6" />
                <line x1="1680" y1="500" x2="1680" y2="540" stroke="#67e8f9" strokeWidth="6" />
                <line x1="1700" y1="500" x2="1700" y2="540" stroke="#67e8f9" strokeWidth="6" />
                <text x="1680" y="600" textAnchor="middle" fontSize="40" fill="#0369a1">Shower</text>

                {/* Toilet */}
                <ellipse cx="1960" cy="440" rx="72" ry="100" fill="#f0f9ff" stroke="#0284c7" strokeWidth="8" />
                <ellipse cx="1960" cy="420" rx="48" ry="60" fill="#e0f2fe" stroke="#0284c7" strokeWidth="4" />
                <rect x="1912" y="340" width="96" height="32" fill="#0284c7" rx="8" />
                <text x="1960" y="600" textAnchor="middle" fontSize="40" fill="#0369a1">Toilet</text>

                {/* Sink */}
                <rect x="1760" y="620" width="120" height="40" fill="#f0f9ff" stroke="#0284c7" strokeWidth="6" rx="8" />
                <circle cx="1820" cy="640" r="12" fill="#0284c7" />
                <text x="1820" y="700" textAnchor="middle" fontSize="36" fill="#0369a1">Wastafel</text>

                {/* Beds - Tempat Tidur */}
                {Array.from({ length: room.bedCount }).map((_, idx) => {
                  const bedX = 320 + (idx * 560);
                  const bedY = 880;
                  return (
                    <g key={idx}>
                      {/* Bed Frame */}
                      <rect x={bedX} y={bedY} width="480" height="320" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="8" rx="16" />
                      
                      {/* Mattress */}
                      <rect x={bedX + 20} y={bedY + 20} width="440" height="280" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="4" rx="12" />
                      
                      {/* Pillow */}
                      <rect x={bedX + 40} y={bedY + 40} width="120" height="80" fill="#e9d5ff" stroke="#c4b5fd" strokeWidth="4" rx="12" />
                      <text x={bedX + 100} y={bedY + 92} textAnchor="middle" fontSize="32" fill="#6d28d9">Bantal</text>
                      
                      {/* Blanket */}
                      <rect x={bedX + 180} y={bedY + 40} width="260" height="240" fill="#ddd6fe" stroke="#a78bfa" strokeWidth="4" rx="8" />
                      <line x1={bedX + 200} y1={bedY + 80} x2={bedX + 420} y2={bedY + 80} stroke="#a78bfa" strokeWidth="2" />
                      <line x1={bedX + 200} y1={bedY + 140} x2={bedX + 420} y2={bedY + 140} stroke="#a78bfa" strokeWidth="2" />
                      <line x1={bedX + 200} y1={bedY + 200} x2={bedX + 420} y2={bedY + 200} stroke="#a78bfa" strokeWidth="2" />
                      <line x1={bedX + 200} y1={bedY + 260} x2={bedX + 420} y2={bedY + 260} stroke="#a78bfa" strokeWidth="2" />
                      
                      {/* Bed Label */}
                      <text x={bedX + 240} y={bedY + 380} textAnchor="middle" fontSize="44" fill="#6d28d9" fontWeight="bold">
                        TT {idx + 1}
                      </text>

                      {/* Patient Name (if occupied) */}
                      {room.patients && room.patients[idx] && (
                        <text x={bedX + 240} y={bedY - 40} textAnchor="middle" fontSize="40" fill="#4b5563" fontStyle="italic">
                          {room.patients[idx].name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Nurse Call Button */}
                <circle cx="400" cy="400" r="48" fill="#ef4444" stroke="#dc2626" strokeWidth="8" />
                <text x="400" y="420" textAnchor="middle" fontSize="40" fill="white" fontWeight="bold">!</text>
                <text x="400" y="500" textAnchor="middle" fontSize="36" fill="#dc2626">Nurse Call</text>

                {/* Room Dimensions */}
                <line x1="200" y1="1640" x2="2200" y2="1640" stroke="#94a3b8" strokeWidth="4" markerStart="url(#arrowStart)" markerEnd="url(#arrowEnd)" />
                <text x="1200" y="1720" textAnchor="middle" fontSize="48" fill="#64748b">6m</text>
                
                <line x1="2240" y1="200" x2="2240" y2="1600" stroke="#94a3b8" strokeWidth="4" />
                <text x="2320" y="900" textAnchor="middle" fontSize="48" fill="#64748b" transform="rotate(90 2320 900)">4m</text>

                {/* Arrow Markers */}
                <defs>
                  <marker id="arrowStart" markerWidth="40" markerHeight="40" refX="0" refY="12" orient="auto">
                    <path d="M0,12 L40,0 L40,24 Z" fill="#94a3b8" />
                  </marker>
                  <marker id="arrowEnd" markerWidth="40" markerHeight="40" refX="40" refY="12" orient="auto">
                    <path d="M0,0 L40,12 L0,24 Z" fill="#94a3b8" />
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Legend - Inline */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-3 flex-shrink-0">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Pintu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Jendela</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">KM Mandi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-600 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Kasur</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Nurse Call</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">📏 6m x 4m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Room Info */}
          <div className="w-64 p-3 flex flex-col gap-2 border-l border-gray-200 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className={`text-sm font-bold ${status.text}`}>
                {room.status === 'normal' ? 'Normal' :
                 room.status === 'calling' ? 'Memanggil' :
                 room.status === 'emergency' ? 'Emergency' :
                 room.status === 'answered' ? 'Dijawab' : 'Offline'}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tempat Tidur</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{room.bedCount} Unit</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Fasilitas</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                🛏️ {room.bedCount} Kasur<br/>
                🚿 1 Kamar Mandi
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Pasien</p>
              {room.patients && room.patients.length > 0 ? (
                <div className="space-y-2">
                  {room.patients.map((patient, idx) => (
                    <div key={idx} className="text-xs">
                      <p className="font-bold text-gray-800 dark:text-white">TT {idx + 1}:</p>
                      <p className="text-gray-700 dark:text-gray-300">{patient.name}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-[10px]">
                        {patient.age} tahun • {patient.diagnosis}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Kosong</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
