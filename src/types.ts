export type Department = 'Management' | 'Employee' | 'Admin';

export interface User {
  id: string; // User UID
  name: string;
  username: string; // email / username
  password?: string;
  department: Department;
  createdAt: string;
  status: 'active' | 'inactive';
}

export type VehicleType = 'Car' | 'Truck' | 'Motorcycle' | 'Delivery Van' | 'Bus' | 'Other';
export type GateId = 'Gate 1 (Main)' | 'Gate 2 (Cargo / Logistics)' | 'Gate 3 (Employee / Staff)' | 'Gate 4 (Visitor)';
export type MovementType = 'Entry' | 'Exit';

export interface VehicleRecord {
  id: string;
  vehicleNumber: string; // e.g. "WB39F 9009"
  date: string; // YYYY-MM-DD
  time: string; // HH:mm format (e.g. "14:35")
  timestamp: number; // Unix timestamp in ms
  gate?: GateId | string;
  vehicleType?: VehicleType;
  movementType?: MovementType;
  driverName?: string;
  driverPhone?: string;
  purpose?: string;
  recordedByUid?: string;
  recordedByName?: string;
  notes?: string;
}

export interface SystemLog {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  details: string;
}
