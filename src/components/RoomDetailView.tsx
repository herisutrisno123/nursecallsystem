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
        {/* Floating Info Bar - Top Left */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 10,
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '4px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          
          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Kamar {room.number}</span>
            <span style={{ opacity: 0.6 }}>•</span>
            <span>Bangsal {room.ward}</span>
            <span style={{ opacity: 0.6 }}>•</span>
            <span>Lantai {room.floor}</span>
          </div>
        </div>

        {/* Content - Full Screen Layout */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '0' }}>
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

              {/* Bathroom - Kamar Mandi - ukuran sama dengan tempat tidur (480x320) */}
              <rect x="1520" y="200" width="480" height="320" fill="#e0f2fe" stroke="#0284c7" strokeWidth="8" rx="16" />
              <text x="1760" y="260" textAnchor="middle" fontSize="40" fill="#0369a1" fontWeight="bold">KAMAR MANDI</text>
              
              {/* Shower - diperkecil proporsional */}
              <circle cx="1640" cy="360" r="40" fill="#67e8f9" stroke="#0891b2" strokeWidth="6" />
              <circle cx="1640" cy="360" r="22" fill="#22d3ee" />
              <line x1="1640" y1="320" x2="1640" y2="360" stroke="#0891b2" strokeWidth="8" />
              <line x1="1625" y1="400" x2="1625" y2="430" stroke="#67e8f9" strokeWidth="4" />
              <line x1="1640" y1="400" x2="1640" y2="430" stroke="#67e8f9" strokeWidth="4" />
              <line x1="1655" y1="400" x2="1655" y2="430" stroke="#67e8f9" strokeWidth="4" />
              <text x="1640" y="470" textAnchor="middle" fontSize="28" fill="#0369a1">Shower</text>

              {/* Toilet - diperkecil proporsional */}
              <ellipse cx="1880" cy="360" rx="48" ry="66" fill="#f0f9ff" stroke="#0284c7" strokeWidth="6" />
              <ellipse cx="1880" cy="346" rx="32" ry="40" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
              <rect x="1848" y="294" width="64" height="22" fill="#0284c7" rx="6" />
              <text x="1880" y="470" textAnchor="middle" fontSize="28" fill="#0369a1">Toilet</text>

              {/* Sink - diperkecil proporsional */}
              <rect x="1720" y="480" width="80" height="26" fill="#f0f9ff" stroke="#0284c7" strokeWidth="4" rx="6" />
              <circle cx="1760" cy="493" r="8" fill="#0284c7" />
              <text x="1760" y="530" textAnchor="middle" fontSize="24" fill="#0369a1">Wastafel</text>

              {/* Beds - Tempat Tidur dengan Kasur 3D Lengkap */}
              {Array.from({ length: room.bedCount }).map((_, idx) => {
                const bedX = 320 + (idx * 560);
                const bedY = 880;
                return (
                  <g key={idx}>
                    {/* Bed Frame - Kotak tempat tidur ungu */}
                    <rect x={bedX} y={bedY} width="480" height="320" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="8" rx="16" />
                    
                    {/* Mattress - Kasur BIRU dengan bentuk realistis */}
                    <defs>
                      <linearGradient id={`mattressGrad${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
                      </linearGradient>
                      <filter id={`mattressShadow${idx}`}>
                        <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                        <feOffset dx="3" dy="3" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.4"/>
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Mattress Base - Kasur biru tebal */}
                    <rect x={bedX + 30} y={bedY + 30} width="420" height="260" fill={`url(#mattressGrad${idx})`} stroke="#1e40af" strokeWidth="4" rx="20" filter={`url(#mattressShadow${idx})`} />
                    
                    {/* Mattress Top Surface - Permukaan kasur */}
                    <rect x={bedX + 35} y={bedY + 35} width="410" height="40" fill="#93c5fd" opacity="0.8" rx="15" />
                    
                    {/* Pillow - Bantal putih di bagian atas kasur */}
                    <defs>
                      <linearGradient id={`pillowGrad${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#f9fafb', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#e5e7eb', stopOpacity: 1 }} />
                      </linearGradient>
                      <filter id={`pillowShadow${idx}`}>
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                        <feOffset dx="1" dy="2" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <ellipse cx={bedX + 240} cy={bedY + 80} rx="120" ry="35" fill="url(#pillowGrad${idx})" stroke="#d1d5db" strokeWidth="3" filter={`url(#pillowShadow${idx})`} />
                    <ellipse cx={bedX + 240} cy={bedY + 78} rx="115" ry="30" fill="#ffffff" opacity="0.6" />
                    {/* Bantal detail - lipatan */}
                    <path d={`M ${bedX + 140} ${bedY + 80} Q ${bedX + 240} ${bedY + 95} ${bedX + 340} ${bedY + 80}`} 
                          fill="none" stroke="#e5e7eb" strokeWidth="2" opacity="0.8" />
                    
                    {/* Blanket/ Selimut - menutupi 2/3 bagian bawah kasur */}
                    <defs>
                      <linearGradient id={`blanketGrad${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#fde68a', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <rect x={bedX + 35} y={bedY + 130} width="410" height="155" fill="url(#blanketGrad${idx})" stroke="#f59e0b" strokeWidth="3" rx="10" />
                    
                    {/* Selimut detail - lipatan 3D */}
                    <path d={`M ${bedX + 50} ${bedY + 150} Q ${bedX + 150} ${bedY + 165} ${bedX + 250} ${bedY + 150}`} 
                          fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.7" />
                    <path d={`M ${bedX + 200} ${bedY + 190} Q ${bedX + 300} ${bedY + 205} ${bedX + 400} ${bedY + 190}`} 
                          fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.7" />
                    <path d={`M ${bedX + 80} ${bedY + 230} Q ${bedX + 200} ${bedY + 245} ${bedX + 320} ${bedY + 230}`} 
                          fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.7" />
                    <path d={`M ${bedX + 150} ${bedY + 260} Q ${bedX + 280} ${bedY + 275} ${bedX + 410} ${bedY + 260}`} 
                          fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.7" />
                    
                    {/* Bed Label - TT 1, TT 2, dst */}
                    <text x={bedX + 240} y={bedY + 200} textAnchor="middle" fontSize="56" fill="#6d28d9" fontWeight="bold" opacity="0.5">
                      TT {idx + 1}
                    </text>

                    {/* Patient Name - fontSize 48 */}
                    {room.patients && room.patients[idx] && (
                      <text x={bedX + 240} y={bedY - 40} textAnchor="middle" fontSize="48" fill="#1f2937" fontWeight="bold">
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
