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
  ward: string;
  bedCount: number;
  status: RoomStatus;
  patients?: Patient[];
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

export type UserRole = 'admin' | 'head_nurse' | 'nurse' | 'doctor';
export type UserStatus = 'active' | 'inactive';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
  submenu?: string;
  icon?: string;
}

export interface MenuPermission {
  menuId: string;
  menuName: string;
  icon: string;
  children?: {
    id: string;
    name: string;
    permissionCode: string;
  }[];
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  createdAt: string;
  lastLogin: string;
  avatar?: string;
  permissions: string[]; // array of permission codes
}
