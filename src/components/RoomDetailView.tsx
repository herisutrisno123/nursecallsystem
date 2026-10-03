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
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className={`px-3 py-2 ${status.bg} ${status.border} border-b-2 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-2 py-1 bg-white/30 hover:bg-white/50 rounded transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  Kamar {room.number}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {room.ward} • Lantai {room.floor}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5 text-gray-800 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Content - Full Screen Layout */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '4px' }}>
          {/* Room Layout SVG - Full Width */}
          <div style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
            <svg 
              viewBox="0 0 2400 1800" 
              style={{ width: '100%', height: '100%', display: 'block' }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Room Walls - 4x lebih besar */}
              <rect x="200" y="200" width="2000" height="1400" fill="#f8fafc" stroke="#64748b" strokeWidth="16" rx="16" />
              
              {/* Floor Pattern */}
              <pattern id="floorPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="#f1f5f9" />
                <rect width="40" height="40" fill="#e2e8f0" />
                <rect x="40" y="40" width="40" height="40" fill="#e2e8f0" />
              </pattern>
              <rect x="200" y="200" width="2000" height="1400" fill="url(#floorPattern)" />

              {/* Door - Pintu Masuk - 4x lebih besar */}
              <rect x="200" y="800" width="16" height="240" fill="#8b5cf6" />
              <path d="M 200 800 Q 80 920 200 1040" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeDasharray="20,20" />
              <text x="60" y="940" fontSize="48" fill="#6b7280" fontWeight="bold">PINTU</text>

              {/* Window - Jendela - 4x lebih besar */}
              <rect x="2184" y="480" width="16" height="320" fill="#06b6d4" />
              <line x1="2192" y1="480" x2="2192" y2="800" stroke="#67e8f9" strokeWidth="8" />
              <text x="2220" y="660" fontSize="40" fill="#6b7280">JENDELA</text>

              {/* Bathroom - Kamar Mandi - 4x lebih besar */}
              <rect x="1520" y="200" width="680" height="480" fill="#e0f2fe" stroke="#0284c7" strokeWidth="8" rx="16" />
              <text x="1860" y="300" textAnchor="middle" fontSize="56" fill="#0369a1" fontWeight="bold">KAMAR MANDI</text>
              
              {/* Shower - 4x lebih besar */}
              <circle cx="1680" cy="440" r="60" fill="#67e8f9" stroke="#0891b2" strokeWidth="8" />
              <circle cx="1680" cy="440" r="32" fill="#22d3ee" />
              <line x1="1680" y1="380" x2="1680" y2="440" stroke="#0891b2" strokeWidth="12" />
              <line x1="1660" y1="500" x2="1660" y2="540" stroke="#67e8f9" strokeWidth="6" />
              <line x1="1680" y1="500" x2="1680" y2="540" stroke="#67e8f9" strokeWidth="6" />
              <line x1="1700" y1="500" x2="1700" y2="540" stroke="#67e8f9" strokeWidth="6" />
              <text x="1680" y="600" textAnchor="middle" fontSize="40" fill="#0369a1">Shower</text>

              {/* Toilet - 4x lebih besar */}
              <ellipse cx="1960" cy="440" rx="72" ry="100" fill="#f0f9ff" stroke="#0284c7" strokeWidth="8" />
              <ellipse cx="1960" cy="420" rx="48" ry="60" fill="#e0f2fe" stroke="#0284c7" strokeWidth="4" />
              <rect x="1912" y="340" width="96" height="32" fill="#0284c7" rx="8" />
              <text x="1960" y="600" textAnchor="middle" fontSize="40" fill="#0369a1">Toilet</text>

              {/* Sink - 4x lebih besar */}
              <rect x="1760" y="620" width="120" height="40" fill="#f0f9ff" stroke="#0284c7" strokeWidth="6" rx="8" />
              <circle cx="1820" cy="640" r="12" fill="#0284c7" />
              <text x="1820" y="700" textAnchor="middle" fontSize="36" fill="#0369a1">Wastafel</text>

              {/* Beds - Tempat Tidur - 4x LEBIH BESAR */}
              {Array.from({ length: room.bedCount }).map((_, idx) => {
                const bedX = 320 + (idx * 560);
                const bedY = 880;
                return (
                  <g key={idx}>
                    {/* Bed Frame - 480x320 (4x dari 120x80) */}
                    <rect x={bedX} y={bedY} width="480" height="320" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="8" rx="16" />
                    
                    {/* Mattress - 440x280 */}
                    <rect x={bedX + 20} y={bedY + 20} width="440" height="280" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="4" rx="12" />
                    
                    {/* Bed Label - fontSize 44 (4x dari 11) */}
                    <text x={bedX + 240} y={bedY + 180} textAnchor="middle" fontSize="56" fill="#6d28d9" fontWeight="bold">
                      TT {idx + 1}
                    </text>

                    {/* Patient Name - fontSize 40 (4x dari 10) */}
                    {room.patients && room.patients[idx] && (
                      <text x={bedX + 240} y={bedY - 40} textAnchor="middle" fontSize="40" fill="#4b5563" fontStyle="italic">
                        {room.patients[idx].name}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nurse Call Button - r=48 (4x dari 12) */}
              <circle cx="400" cy="400" r="48" fill="#ef4444" stroke="#dc2626" strokeWidth="8" />
              <text x="400" y="420" textAnchor="middle" fontSize="40" fill="white" fontWeight="bold">!</text>
              <text x="400" y="500" textAnchor="middle" fontSize="36" fill="#dc2626">Nurse Call</text>

              {/* Room Dimensions - 4x lebih besar */}
              <line x1="200" y1="1640" x2="2200" y2="1640" stroke="#94a3b8" strokeWidth="4" markerStart="url(#arrowStart)" markerEnd="url(#arrowEnd)" />
              <text x="1200" y="1720" textAnchor="middle" fontSize="48" fill="#64748b">6m</text>
              
              <line x1="2240" y1="200" x2="2240" y2="1600" stroke="#94a3b8" strokeWidth="4" />
              <text x="2320" y="900" textAnchor="middle" fontSize="48" fill="#64748b" transform="rotate(90 2320 900)">4m</text>

              {/* Arrow Markers - 4x lebih besar */}
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
        </div>
      </div>
    </div>
  );
}
