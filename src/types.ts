export type RoomStatus = 'normal' | 'calling' | 'emergency' | 'answered' | 'offline';
export type CallType = 'regular' | 'emergency' | 'bathroom' | 'meal' | 'medication';
export type CallPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  admissionDate: string;
  doctor: string;
  allergies: string[];
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  wing: string;
  bedCount: number;
  status: RoomStatus;
  patient?: Patient;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface NurseCall {
  id: string;
  roomId: string;
  roomNumber: string;
  patientName: string;
  type: CallType;
  priority: CallPriority;
  timestamp: string;
  duration?: number;
  status: 'active' | 'answered' | 'resolved' | 'missed';
  respondedBy?: string;
  notes?: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  floor: number;
  rooms: Room[];
}

export interface DashboardStats {
  totalCallsToday: number;
  activeCalls: number;
  avgResponseTime: number;
  emergencyCalls: number;
  resolvedCalls: number;
  missedCalls: number;
  responseRate: number;
}
