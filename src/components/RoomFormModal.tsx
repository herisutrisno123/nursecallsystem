import { useState, useEffect } from 'react';
import { Room, RoomStatus, Patient } from '../types';
import { X, Save } from 'lucide-react';

interface RoomFormModalProps {
  room?: Room | null;
  wards: string[];
  onSave: (room: Room) => void;
  onClose: () => void;
}

export default function RoomFormModal({ room, wards, onSave, onClose }: RoomFormModalProps) {
  const [formData, setFormData] = useState({
    number: '',
    ward: wards[0] || '',
    floor: 1,
    wing: 'Kiri',
    bedCount: 1,
    status: 'normal' as RoomStatus,
    patientName: '',
    patientAge: '',
    patientDiagnosis: '',
    patientDoctor: '',
  });

  useEffect(() => {
    if (room) {
      setFormData({
        number: room.number,
        ward: room.ward,
        floor: room.floor,
        wing: room.wing,
        bedCount: room.bedCount,
        status: room.status,
        patientName: room.patient?.name || '',
        patientAge: room.patient?.age?.toString() || '',
        patientDiagnosis: room.patient?.diagnosis || '',
        patientDoctor: room.patient?.doctor || '',
      });
    }
  }, [room]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRoom: Room = {
      id: room?.id || `r${Date.now()}`,
      number: formData.number,
      ward: formData.ward,
      floor: formData.floor,
      wing: formData.wing,
      bedCount: formData.bedCount,
      status: formData.status,
      position: room?.position || { x: 0, y: 0 },
      size: room?.size || { width: 120, height: 90 },
      patient: formData.patientName ? {
        id: room?.patient?.id || `p${Date.now()}`,
        name: formData.patientName,
        age: parseInt(formData.patientAge) || 0,
        diagnosis: formData.patientDiagnosis,
        doctor: formData.patientDoctor,
        admissionDate: room?.patient?.admissionDate || new Date().toISOString().split('T')[0],
        allergies: room?.patient?.allergies || [],
      } : undefined,
    };

    onSave(newRoom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {room ? 'Edit Kamar' : 'Tambah Kamar Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Room Info Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
              Informasi Kamar
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nomor Kamar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Contoh: 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bangsal *
                </label>
                <select
                  required
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  {wards.map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lantai
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sayap
                </label>
                <select
                  value={formData.wing}
                  onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="Kiri">Kiri</option>
                  <option value="Kanan">Kanan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jumlah Tempat Tidur
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={formData.bedCount}
                  onChange={(e) => setFormData({ ...formData, bedCount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="calling">Memanggil</option>
                  <option value="emergency">Emergency</option>
                  <option value="answered">Dijawab</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Patient Info Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
              Informasi Pasien (Opsional)
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Pasien
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Contoh: Ahmad Suryadi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Usia
                </label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={formData.patientAge}
                  onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Contoh: 45"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dokter Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={formData.patientDoctor}
                  onChange={(e) => setFormData({ ...formData, patientDoctor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Contoh: dr. Siti Rahayu"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Diagnosa
                </label>
                <input
                  type="text"
                  value={formData.patientDiagnosis}
                  onChange={(e) => setFormData({ ...formData, patientDiagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Contoh: Hipertensi"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {room ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
