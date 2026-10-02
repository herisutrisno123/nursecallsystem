import { Room } from '../types';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className={`px-4 py-3 ${status.bg} ${status.border} border-b-2 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Denah Kamar {room.number}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Bangsal {room.ward} • Lantai {room.floor}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-gray-800 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Room Layout SVG - Compact */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
            <svg viewBox="0 0 500 350" className="w-full h-auto max-h-[45vh]">
              {/* Room Walls */}
              <rect x="40" y="40" width="420" height="270" fill="#f8fafc" stroke="#64748b" strokeWidth="3" rx="3" />
              
              {/* Floor Pattern */}
              <pattern id="floorPattern" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
                <rect width="15" height="15" fill="#f1f5f9" />
                <rect width="7.5" height="7.5" fill="#e2e8f0" />
                <rect x="7.5" y="7.5" width="7.5" height="7.5" fill="#e2e8f0" />
              </pattern>
              <rect x="40" y="40" width="420" height="270" fill="url(#floorPattern)" />

              {/* Door - Pintu Masuk */}
              <rect x="40" y="160" width="3" height="50" fill="#8b5cf6" />
              <path d="M 40 160 Q 15 185 40 210" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="10" y="190" fontSize="10" fill="#6b7280" fontWeight="bold">PINTU</text>

              {/* Window - Jendela */}
              <rect x="457" y="90" width="3" height="70" fill="#06b6d4" />
              <line x1="458.5" y1="90" x2="458.5" y2="160" stroke="#67e8f9" strokeWidth="1.5" />
              <text x="465" y="130" fontSize="9" fill="#6b7280">JENDELA</text>

              {/* Bathroom - Kamar Mandi */}
              <rect x="320" y="40" width="140" height="100" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" rx="3" />
              <text x="390" y="58" textAnchor="middle" fontSize="11" fill="#0369a1" fontWeight="bold">KAMAR MANDI</text>
              
              {/* Shower */}
              <circle cx="350" cy="95" r="12" fill="#67e8f9" stroke="#0891b2" strokeWidth="1.5" />
              <circle cx="350" cy="95" r="6" fill="#22d3ee" />
              <line x1="350" y1="83" x2="350" y2="95" stroke="#0891b2" strokeWidth="2" />
              <line x1="346" y1="107" x2="346" y2="115" stroke="#67e8f9" strokeWidth="1" />
              <line x1="350" y1="107" x2="350" y2="115" stroke="#67e8f9" strokeWidth="1" />
              <line x1="354" y1="107" x2="354" y2="115" stroke="#67e8f9" strokeWidth="1" />
              <text x="350" y="128" textAnchor="middle" fontSize="8" fill="#0369a1">Shower</text>

              {/* Toilet */}
              <ellipse cx="420" cy="95" rx="14" ry="20" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5" />
              <ellipse cx="420" cy="91" rx="9" ry="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
              <rect x="410" y="75" width="20" height="6" fill="#0284c7" rx="1.5" />
              <text x="420" y="128" textAnchor="middle" fontSize="8" fill="#0369a1">Toilet</text>

              {/* Sink */}
              <rect x="375" y="125" width="25" height="8" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1" rx="1.5" />
              <circle cx="387.5" cy="129" r="2" fill="#0284c7" />
              <text x="387.5" y="142" textAnchor="middle" fontSize="7" fill="#0369a1">Wastafel</text>

              {/* Beds - Tempat Tidur */}
              {Array.from({ length: room.bedCount }).map((_, idx) => {
                const bedX = 60 + (idx * 120);
                const bedY = 170;
                return (
                  <g key={idx}>
                    {/* Bed Frame */}
                    <rect x={bedX} y={bedY} width="100" height="70" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="1.5" rx="3" />
                    
                    {/* Mattress */}
                    <rect x={bedX + 4} y={bedY + 4} width="92" height="62" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="0.8" rx="2" />
                    
                    {/* Pillow */}
                    <rect x={bedX + 8} y={bedY + 8} width="25" height="16" fill="#e9d5ff" stroke="#c4b5fd" strokeWidth="0.8" rx="2" />
                    <text x={bedX + 20.5} y={bedY + 19} textAnchor="middle" fontSize="7" fill="#6d28d9">Bantal</text>
                    
                    {/* Blanket */}
                    <rect x={bedX + 38} y={bedY + 8} width="54" height="54" fill="#ddd6fe" stroke="#a78bfa" strokeWidth="0.8" rx="1.5" />
                    <line x1={bedX + 42} y1={bedY + 18} x2={bedX + 88} y2={bedY + 18} stroke="#a78bfa" strokeWidth="0.4" />
                    <line x1={bedX + 42} y1={bedY + 30} x2={bedX + 88} y2={bedY + 30} stroke="#a78bfa" strokeWidth="0.4" />
                    <line x1={bedX + 42} y1={bedY + 42} x2={bedX + 88} y2={bedY + 42} stroke="#a78bfa" strokeWidth="0.4" />
                    <line x1={bedX + 42} y1={bedY + 54} x2={bedX + 88} y2={bedY + 54} stroke="#a78bfa" strokeWidth="0.4" />
                    
                    {/* Bed Label */}
                    <text x={bedX + 50} y={bedY + 82} textAnchor="middle" fontSize="9" fill="#6d28d9" fontWeight="bold">
                      TT {idx + 1}
                    </text>

                    {/* Patient Name (if occupied) */}
                    {room.patient && idx === 0 && (
                      <text x={bedX + 50} y={bedY - 8} textAnchor="middle" fontSize="8" fill="#4b5563" fontStyle="italic">
                        {room.patient.name}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nurse Call Button */}
              <circle cx="80" cy="80" r="10" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
              <text x="80" y="84" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">!</text>
              <text x="80" y="100" textAnchor="middle" fontSize="8" fill="#dc2626">Nurse Call</text>

              {/* Room Dimensions */}
              <line x1="40" y1="320" x2="460" y2="320" stroke="#94a3b8" strokeWidth="0.8" markerStart="url(#arrowStart)" markerEnd="url(#arrowEnd)" />
              <text x="250" y="335" textAnchor="middle" fontSize="10" fill="#64748b">6m</text>
              
              <line x1="470" y1="40" x2="470" y2="310" stroke="#94a3b8" strokeWidth="0.8" />
              <text x="485" y="175" textAnchor="middle" fontSize="10" fill="#64748b" transform="rotate(90 485 175)">4m</text>

              {/* Arrow Markers */}
              <defs>
                <marker id="arrowStart" markerWidth="8" markerHeight="8" refX="0" refY="2.5" orient="auto">
                  <path d="M0,2.5 L8,0 L8,5 Z" fill="#94a3b8" />
                </marker>
                <marker id="arrowEnd" markerWidth="8" markerHeight="8" refX="8" refY="2.5" orient="auto">
                  <path d="M0,0 L8,2.5 L0,5 Z" fill="#94a3b8" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Room Info - Compact */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
              <p className={`text-sm font-bold ${status.text}`}>
                {room.status === 'normal' ? 'Normal' :
                 room.status === 'calling' ? 'Memanggil' :
                 room.status === 'emergency' ? 'Emergency' :
                 room.status === 'answered' ? 'Dijawab' : 'Offline'}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Tempat Tidur</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{room.bedCount} Unit</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Pasien</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                {room.patient ? room.patient.name.split(' ')[0] : 'Kosong'}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Fasilitas</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                🛏️{room.bedCount} 🚿1
              </p>
            </div>
          </div>

          {/* Legend - Inline */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Pintu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Jendela</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">KM Mandi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-purple-600 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Kasur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Nurse Call</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-700 dark:text-gray-300">📏 6m x 4m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
