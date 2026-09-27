import { Room } from '../types';
import { X, User, Bed, Calendar, Stethoscope, AlertCircle, Phone, MapPin } from 'lucide-react';

interface RoomDetailProps {
  room: Room | null;
  onClose: () => void;
}

export default function RoomDetail({ room, onClose }: RoomDetailProps) {
  if (!room) return null;

  const statusLabel: Record<string, string> = {
    normal: '🟢 Normal',
    calling: '🟡 Memanggil',
    emergency: '🔴 Emergency',
    answered: '🔵 Dijawab',
    offline: '⚫ Offline',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 ${
          room.status === 'emergency' ? 'bg-gradient-to-r from-red-500 to-red-600' :
          room.status === 'calling' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
          room.status === 'answered' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
          room.status === 'offline' ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
          'bg-gradient-to-r from-green-500 to-emerald-600'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-white/80" />
                <h2 className="text-2xl font-bold text-white">Kamar {room.number}</h2>
              </div>
              <p className="text-white/80 text-sm mt-1">Lantai {room.floor} • Sayap {room.wing}</p>
              <div className="mt-3 inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
                {statusLabel[room.status]}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Room Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Bed className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tempat Tidur</p>
                <p className="font-semibold text-gray-800 dark:text-white">{room.bedCount} Bed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Phone className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nurse Call</p>
                <p className="font-semibold text-gray-800 dark:text-white">Aktif</p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          {room.patient ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Data Pasien
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Nama</p>
                  <p className="font-medium text-gray-800 dark:text-white">{room.patient.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Usia</p>
                  <p className="font-medium text-gray-800 dark:text-white">{room.patient.age} tahun</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Diagnosa</p>
                  <p className="font-medium text-gray-800 dark:text-white">{room.patient.diagnosis}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Dokter</p>
                  <p className="font-medium text-gray-800 dark:text-white">{room.patient.doctor}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Tanggal Masuk
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {new Date(room.patient.admissionDate).toLocaleDateString('id-ID', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Allergies */}
              {room.patient.allergies.length > 0 && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                    <AlertCircle className="w-3 h-3 text-red-500" /> Alergi
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {room.patient.allergies.map((allergy, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                        ⚠️ {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center text-gray-500 dark:text-gray-400">
              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Kamar kosong - tidak ada pasien</p>
            </div>
          )}

          {/* Action Buttons */}
          {(room.status === 'calling' || room.status === 'emergency') && (
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Jawab Panggilan
              </button>
              <button className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Stethoscope className="w-4 h-4" /> Panggil Dokter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
