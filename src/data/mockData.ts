import { Room, NurseCall, FloorPlan, DashboardStats, Patient } from '../types';

const patients: Patient[] = [
  { id: 'p1', name: 'Ahmad Suryadi', age: 67, diagnosis: 'Hipertensi', admissionDate: '2026-01-10', doctor: 'dr. Siti Rahayu', allergies: ['Penicillin'] },
  { id: 'p2', name: 'Budi Hartono', age: 54, diagnosis: 'Diabetes Mellitus', admissionDate: '2026-01-12', doctor: 'dr. Andi Wijaya', allergies: [] },
  { id: 'p3', name: 'Citra Dewi', age: 45, diagnosis: 'Pneumonia', admissionDate: '2026-01-14', doctor: 'dr. Siti Rahayu', allergies: ['Sulfonamide'] },
  { id: 'p4', name: 'Dewi Lestari', age: 72, diagnosis: 'Gagal Jantung', admissionDate: '2026-01-08', doctor: 'dr. Bambang S.', allergies: ['Aspirin'] },
  { id: 'p5', name: 'Eko Prasetyo', age: 38, diagnosis: 'Appendicitis', admissionDate: '2026-01-15', doctor: 'dr. Rina Kusuma', allergies: [] },
  { id: 'p6', name: 'Fitri Handayani', age: 61, diagnosis: 'Stroke', admissionDate: '2026-01-11', doctor: 'dr. Andi Wijaya', allergies: ['Ibuprofen'] },
  { id: 'p7', name: 'Gunawan Wibisono', age: 55, diagnosis: 'COPD', admissionDate: '2026-01-09', doctor: 'dr. Siti Rahayu', allergies: [] },
  { id: 'p8', name: 'Heni Susanti', age: 48, diagnosis: 'Anemia', admissionDate: '2026-01-13', doctor: 'dr. Rina Kusuma', allergies: [] },
  { id: 'p9', name: 'Irfan Hakim', age: 70, diagnosis: 'CHF', admissionDate: '2026-01-07', doctor: 'dr. Bambang S.', allergies: ['Morphine'] },
  { id: 'p10', name: 'Joko Susilo', age: 59, diagnosis: 'Gastritis', admissionDate: '2026-01-14', doctor: 'dr. Andi Wijaya', allergies: [] },
  { id: 'p11', name: 'Kartini Wulandari', age: 43, diagnosis: 'Migrain', admissionDate: '2026-01-15', doctor: 'dr. Siti Rahayu', allergies: [] },
  { id: 'p12', name: 'Lukman Hakim', age: 65, diagnosis: 'Hipertensi + DM', admissionDate: '2026-01-10', doctor: 'dr. Rina Kusuma', allergies: ['Paracetamol'] },
];

export const rooms: Room[] = [
  // Bangsal Mawar (Lantai 1 - Sayap Kiri)
  { id: 'r1', number: '101', floor: 1, wing: 'Kiri', ward: 'Mawar', bedCount: 2, status: 'calling', patient: patients[0], position: { x: 50, y: 80 }, size: { width: 80, height: 60 } },
  { id: 'r2', number: '102', floor: 1, wing: 'Kiri', ward: 'Mawar', bedCount: 1, status: 'normal', patient: patients[1], position: { x: 150, y: 80 }, size: { width: 80, height: 60 } },
  { id: 'r3', number: '103', floor: 1, wing: 'Kiri', ward: 'Mawar', bedCount: 2, status: 'emergency', patient: patients[2], position: { x: 250, y: 80 }, size: { width: 80, height: 60 } },
  { id: 'r4', number: '104', floor: 1, wing: 'Kiri', ward: 'Mawar', bedCount: 1, status: 'answered', patient: patients[3], position: { x: 350, y: 80 }, size: { width: 80, height: 60 } },
  
  // Bangsal Melati (Lantai 1 - Sayap Kiri Bawah)
  { id: 'r5', number: '105', floor: 1, wing: 'Kiri', ward: 'Melati', bedCount: 2, status: 'normal', patient: patients[4], position: { x: 50, y: 180 }, size: { width: 80, height: 60 } },
  { id: 'r6', number: '106', floor: 1, wing: 'Kiri', ward: 'Melati', bedCount: 1, status: 'calling', patient: patients[5], position: { x: 150, y: 180 }, size: { width: 80, height: 60 } },
  { id: 'r7', number: '107', floor: 1, wing: 'Kiri', ward: 'Melati', bedCount: 2, status: 'normal', patient: patients[6], position: { x: 250, y: 180 }, size: { width: 80, height: 60 } },
  { id: 'r8', number: '108', floor: 1, wing: 'Kiri', ward: 'Melati', bedCount: 1, status: 'offline', position: { x: 350, y: 180 }, size: { width: 80, height: 60 } },
  
  // Bangsal Anggrek (Lantai 1 - Sayap Kanan Atas)
  { id: 'r9', number: '109', floor: 1, wing: 'Kanan', ward: 'Anggrek', bedCount: 2, status: 'normal', patient: patients[7], position: { x: 500, y: 80 }, size: { width: 80, height: 60 } },
  { id: 'r10', number: '110', floor: 1, wing: 'Kanan', ward: 'Anggrek', bedCount: 1, status: 'calling', patient: patients[8], position: { x: 600, y: 80 }, size: { width: 80, height: 60 } },
  { id: 'r11', number: '111', floor: 1, wing: 'Kanan', ward: 'Anggrek', bedCount: 2, status: 'normal', patient: patients[9], position: { x: 700, y: 80 }, size: { width: 80, height: 60 } },
  { id: 'r12', number: '112', floor: 1, wing: 'Kanan', ward: 'Anggrek', bedCount: 1, status: 'answered', patient: patients[10], position: { x: 800, y: 80 }, size: { width: 80, height: 60 } },
  
  // Bangsal Tulip (Lantai 1 - Sayap Kanan Bawah)
  { id: 'r13', number: '113', floor: 1, wing: 'Kanan', ward: 'Tulip', bedCount: 2, status: 'normal', patient: patients[11], position: { x: 500, y: 180 }, size: { width: 80, height: 60 } },
  { id: 'r14', number: '114', floor: 1, wing: 'Kanan', ward: 'Tulip', bedCount: 1, status: 'emergency', position: { x: 600, y: 180 }, size: { width: 80, height: 60 } },
  { id: 'r15', number: '115', floor: 1, wing: 'Kanan', ward: 'Tulip', bedCount: 2, status: 'normal', position: { x: 700, y: 180 }, size: { width: 80, height: 60 } },
  { id: 'r16', number: '116', floor: 1, wing: 'Kanan', ward: 'Tulip', bedCount: 1, status: 'calling', position: { x: 800, y: 180 }, size: { width: 80, height: 60 } },
];

export const floorPlans: FloorPlan[] = [
  { id: 'floor1', name: 'Lantai 1 - Rawat Inap', floor: 1, rooms: rooms },
];

export const nurseCalls: NurseCall[] = [
  { id: 'nc1', roomId: 'r1', roomNumber: '101', patientName: 'Ahmad Suryadi', type: 'regular', priority: 'medium', timestamp: '2026-01-16T08:30:00', status: 'active', notes: 'Pasien meminta bantuan minum obat' },
  { id: 'nc2', roomId: 'r3', roomNumber: '103', patientName: 'Citra Dewi', type: 'emergency', priority: 'critical', timestamp: '2026-01-16T08:28:00', status: 'active', notes: 'Sesak napas berat' },
  { id: 'nc3', roomId: 'r6', roomNumber: '106', patientName: 'Fitri Handayani', type: 'bathroom', priority: 'medium', timestamp: '2026-01-16T08:25:00', status: 'active', notes: 'Butuh bantuan ke kamar mandi' },
  { id: 'nc4', roomId: 'r10', roomNumber: '110', patientName: 'Irfan Hakim', type: 'medication', priority: 'high', timestamp: '2026-01-16T08:20:00', status: 'active', notes: 'Meminta obat jantung' },
  { id: 'nc5', roomId: 'r16', roomNumber: '116', patientName: '-', type: 'regular', priority: 'low', timestamp: '2026-01-16T08:15:00', status: 'active', notes: 'Panggilan umum' },
  { id: 'nc6', roomId: 'r4', roomNumber: '104', patientName: 'Dewi Lestari', type: 'regular', priority: 'medium', timestamp: '2026-01-16T07:45:00', duration: 5, status: 'answered', respondedBy: 'Ns. Rina', notes: 'Minta air minum' },
  { id: 'nc7', roomId: 'r12', roomNumber: '112', patientName: 'Kartini Wulandari', type: 'medication', priority: 'low', timestamp: '2026-01-16T07:30:00', duration: 3, status: 'resolved', respondedBy: 'Ns. Dewi', notes: 'Obat migrain diberikan' },
  { id: 'nc8', roomId: 'r2', roomNumber: '102', patientName: 'Budi Hartono', type: 'meal', priority: 'low', timestamp: '2026-01-16T07:00:00', duration: 2, status: 'resolved', respondedBy: 'Ns. Rina', notes: 'Sarapan diantar' },
  { id: 'nc9', roomId: 'r5', roomNumber: '105', patientName: 'Eko Prasetyo', type: 'regular', priority: 'medium', timestamp: '2026-01-16T06:45:00', duration: 8, status: 'resolved', respondedBy: 'Ns. Budi', notes: 'Nyeri luka operasi' },
  { id: 'nc10', roomId: 'r7', roomNumber: '107', patientName: 'Gunawan Wibisono', type: 'emergency', priority: 'high', timestamp: '2026-01-16T06:30:00', duration: 15, status: 'resolved', respondedBy: 'dr. Siti', notes: 'Oksigen diberikan' },
  { id: 'nc11', roomId: 'r9', roomNumber: '109', patientName: 'Heni Susanti', type: 'bathroom', priority: 'low', timestamp: '2026-01-16T06:15:00', duration: 4, status: 'resolved', respondedBy: 'Ns. Dewi', notes: 'Bantuan ke kamar mandi' },
  { id: 'nc12', roomId: 'r11', roomNumber: '111', patientName: 'Joko Susilo', type: 'regular', priority: 'medium', timestamp: '2026-01-16T05:30:00', duration: 6, status: 'answered', respondedBy: 'Ns. Rina', notes: 'Cek tekanan darah' },
  { id: 'nc13', roomId: 'r14', roomNumber: '114', patientName: '-', type: 'emergency', priority: 'critical', timestamp: '2026-01-16T04:00:00', duration: 20, status: 'resolved', respondedBy: 'dr. Bambang', notes: 'Emergency ditangani' },
  { id: 'nc14', roomId: 'r13', roomNumber: '113', patientName: 'Lukman Hakim', type: 'medication', priority: 'medium', timestamp: '2026-01-16T03:00:00', duration: 3, status: 'resolved', respondedBy: 'Ns. Budi', notes: 'Insulin diberikan' },
  { id: 'nc15', roomId: 'r8', roomNumber: '108', patientName: '-', type: 'regular', priority: 'low', timestamp: '2026-01-16T02:00:00', status: 'missed', notes: 'Tidak terjawab - kamar kosong' },
];

export const dashboardStats: DashboardStats = {
  totalCallsToday: 47,
  activeCalls: 5,
  avgResponseTime: 3.2,
  emergencyCalls: 4,
  resolvedCalls: 38,
  missedCalls: 4,
  responseRate: 91.5,
};

export const hourlyCallData = [
  { hour: '00:00', calls: 2, emergency: 0 },
  { hour: '01:00', calls: 1, emergency: 0 },
  { hour: '02:00', calls: 3, emergency: 0 },
  { hour: '03:00', calls: 2, emergency: 0 },
  { hour: '04:00', calls: 4, emergency: 1 },
  { hour: '05:00', calls: 3, emergency: 0 },
  { hour: '06:00', calls: 5, emergency: 1 },
  { hour: '07:00', calls: 8, emergency: 0 },
  { hour: '08:00', calls: 12, emergency: 2 },
  { hour: '09:00', calls: 7, emergency: 0 },
];

export const callTypeData = [
  { name: 'Reguler', value: 18, color: '#3b82f6' },
  { name: 'Emergency', value: 4, color: '#ef4444' },
  { name: 'Kamar Mandi', value: 8, color: '#8b5cf6' },
  { name: 'Makan', value: 10, color: '#f59e0b' },
  { name: 'Obat', value: 7, color: '#10b981' },
];

export const responseTimeData = [
  { day: 'Sen', avgTime: 2.8, target: 3 },
  { day: 'Sel', avgTime: 3.1, target: 3 },
  { day: 'Rab', avgTime: 2.5, target: 3 },
  { day: 'Kam', avgTime: 3.8, target: 3 },
  { day: 'Jum', avgTime: 3.2, target: 3 },
  { day: 'Sab', avgTime: 2.9, target: 3 },
  { day: 'Min', avgTime: 3.2, target: 3 },
];
