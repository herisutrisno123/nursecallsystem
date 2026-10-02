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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 py-2 ${status.bg} ${status.border} border-b-2 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
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

        {/* Content - Full Screen Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Room Layout SVG */}
          <div className="flex-1 p-3 flex flex-col">
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-2 flex items-center justify-center">
              <svg viewBox="0 0 600 450" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Room Walls */}
                <rect x="50" y="50" width="500" height="350" fill="#f8fafc" stroke="#64748b" strokeWidth="4" rx="4" />
                
                {/* Floor Pattern */}
                <pattern id="floorPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill="#f1f5f9" />
                  <rect width="10" height="10" fill="#e2e8f0" />
                  <rect x="10" y="10" width="10" height="10" fill="#e2e8f0" />
                </pattern>
                <rect x="50" y="50" width="500" height="350" fill="url(#floorPattern)" />

                {/* Door - Pintu Masuk */}
                <rect x="50" y="200" width="4" height="60" fill="#8b5cf6" />
                <path d="M 50 200 Q 20 230 50 260" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" />
                <text x="15" y="235" fontSize="12" fill="#6b7280" fontWeight="bold">PINTU</text>

                {/* Window - Jendela */}
                <rect x="546" y="120" width="4" height="80" fill="#06b6d4" />
                <line x1="548" y1="120" x2="548" y2="200" stroke="#67e8f9" strokeWidth="2" />
                <text x="555" y="165" fontSize="10" fill="#6b7280">JENDELA</text>

                {/* Bathroom - Kamar Mandi */}
                <rect x="380" y="50" width="170" height="120" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" rx="4" />
                <text x="465" y="75" textAnchor="middle" fontSize="14" fill="#0369a1" fontWeight="bold">KAMAR MANDI</text>
                
                {/* Shower */}
                <circle cx="420" cy="110" r="15" fill="#67e8f9" stroke="#0891b2" strokeWidth="2" />
                <circle cx="420" cy="110" r="8" fill="#22d3ee" />
                <line x1="420" y1="95" x2="420" y2="110" stroke="#0891b2" strokeWidth="3" />
                <line x1="415" y1="125" x2="415" y2="135" stroke="#67e8f9" strokeWidth="1.5" />
                <line x1="420" y1="125" x2="420" y2="135" stroke="#67e8f9" strokeWidth="1.5" />
                <line x1="425" y1="125" x2="425" y2="135" stroke="#67e8f9" strokeWidth="1.5" />
                <text x="420" y="150" textAnchor="middle" fontSize="10" fill="#0369a1">Shower</text>

                {/* Toilet */}
                <ellipse cx="490" cy="110" rx="18" ry="25" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
                <ellipse cx="490" cy="105" rx="12" ry="15" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
                <rect x="478" y="85" width="24" height="8" fill="#0284c7" rx="2" />
                <text x="490" y="150" textAnchor="middle" fontSize="10" fill="#0369a1">Toilet</text>

                {/* Sink */}
                <rect x="440" y="155" width="30" height="10" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5" rx="2" />
                <circle cx="455" cy="160" r="3" fill="#0284c7" />
                <text x="455" y="175" textAnchor="middle" fontSize="9" fill="#0369a1">Wastafel</text>

                {/* Beds - Tempat Tidur */}
                {Array.from({ length: room.bedCount }).map((_, idx) => {
                  const bedX = 80 + (idx * 140);
                  const bedY = 220;
                  return (
                    <g key={idx}>
                      {/* Bed Frame */}
                      <rect x={bedX} y={bedY} width="120" height="80" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2" rx="4" />
                      
                      {/* Mattress */}
                      <rect x={bedX + 5} y={bedY + 5} width="110" height="70" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="1" rx="3" />
                      
                      {/* Pillow */}
                      <rect x={bedX + 10} y={bedY + 10} width="30" height="20" fill="#e9d5ff" stroke="#c4b5fd" strokeWidth="1" rx="3" />
                      <text x={bedX + 25} y={bedY + 23} textAnchor="middle" fontSize="8" fill="#6d28d9">Bantal</text>
                      
                      {/* Blanket */}
                      <rect x={bedX + 45} y={bedY + 10} width="65" height="60" fill="#ddd6fe" stroke="#a78bfa" strokeWidth="1" rx="2" />
                      <line x1={bedX + 50} y1={bedY + 20} x2={bedX + 105} y2={bedY + 20} stroke="#a78bfa" strokeWidth="0.5" />
                      <line x1={bedX + 50} y1={bedY + 35} x2={bedX + 105} y2={bedY + 35} stroke="#a78bfa" strokeWidth="0.5" />
                      <line x1={bedX + 50} y1={bedY + 50} x2={bedX + 105} y2={bedY + 50} stroke="#a78bfa" strokeWidth="0.5" />
                      <line x1={bedX + 50} y1={bedY + 65} x2={bedX + 105} y2={bedY + 65} stroke="#a78bfa" strokeWidth="0.5" />
                      
                      {/* Bed Label */}
                      <text x={bedX + 60} y={bedY + 95} textAnchor="middle" fontSize="11" fill="#6d28d9" fontWeight="bold">
                        TT {idx + 1}
                      </text>

                      {/* Patient Name (if occupied) */}
                      {room.patients && room.patients[idx] && (
                        <text x={bedX + 60} y={bedY - 10} textAnchor="middle" fontSize="10" fill="#4b5563" fontStyle="italic">
                          {room.patients[idx].name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Nurse Call Button */}
                <circle cx="100" cy="100" r="12" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                <text x="100" y="105" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">!</text>
                <text x="100" y="125" textAnchor="middle" fontSize="9" fill="#dc2626">Nurse Call</text>

                {/* Room Dimensions */}
                <line x1="50" y1="410" x2="550" y2="410" stroke="#94a3b8" strokeWidth="1" markerStart="url(#arrowStart)" markerEnd="url(#arrowEnd)" />
                <text x="300" y="430" textAnchor="middle" fontSize="12" fill="#64748b">6m</text>
                
                <line x1="560" y1="50" x2="560" y2="400" stroke="#94a3b8" strokeWidth="1" />
                <text x="580" y="225" textAnchor="middle" fontSize="12" fill="#64748b" transform="rotate(90 580 225)">4m</text>

                {/* Arrow Markers */}
                <defs>
                  <marker id="arrowStart" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto">
                    <path d="M0,3 L10,0 L10,6 Z" fill="#94a3b8" />
                  </marker>
                  <marker id="arrowEnd" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto">
                    <path d="M0,0 L10,3 L0,6 Z" fill="#94a3b8" />
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Legend - Inline */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 mt-2">
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
