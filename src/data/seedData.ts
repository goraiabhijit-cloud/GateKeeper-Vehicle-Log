import { User, VehicleRecord } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_001',
    name: 'Robert Ross (Admin)',
    username: 'admin@gatekeeper.io',
    password: 'password123',
    department: 'Admin',
    createdAt: '2026-09-01T08:00:00.000Z',
    status: 'active',
  },
  {
    id: 'usr_mgmt_002',
    name: 'Priya Sharma (Supervisor)',
    username: 'manager@gatekeeper.io',
    password: 'password123',
    department: 'Management',
    createdAt: '2026-09-05T09:30:00.000Z',
    status: 'active',
  },
  {
    id: 'usr_emp_003',
    name: 'Alex Chen (Gate Officer)',
    username: 'employee@gatekeeper.io',
    password: 'password123',
    department: 'Employee',
    createdAt: '2026-09-10T11:00:00.000Z',
    status: 'active',
  },
  {
    id: 'usr_emp_004',
    name: 'Suresh Kumar (Security Staff)',
    username: 'suresh@gatekeeper.io',
    password: 'password123',
    department: 'Employee',
    createdAt: '2026-09-15T14:15:00.000Z',
    status: 'active',
  },
];

// Helper to format Date to YYYY-MM-DD
export function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getInitialRecords(): VehicleRecord[] {
  const now = new Date();
  
  // Today's date
  const todayStr = formatDate(now);

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // 2 days ago
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = formatDate(twoDaysAgo);

  return [
    // Today's entries
    {
      id: 'rec_101',
      vehicleNumber: 'WB39F 9009',
      date: todayStr,
      time: '08:45',
      timestamp: new Date(`${todayStr}T08:45:00`).getTime(),
      gate: 'Gate 1 (Main)',
      vehicleType: 'Car',
      movementType: 'Entry',
      driverName: 'Vikram Das',
      driverPhone: '+91 98301 23456',
      purpose: 'Executive Meeting',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
      notes: 'Visitor Pass #410 issued',
    },
    {
      id: 'rec_102',
      vehicleNumber: 'DL04C 1190',
      date: todayStr,
      time: '09:15',
      timestamp: new Date(`${todayStr}T09:15:00`).getTime(),
      gate: 'Gate 2 (Cargo / Logistics)',
      vehicleType: 'Truck',
      movementType: 'Entry',
      driverName: 'Harpreet Singh',
      driverPhone: '+91 98110 54321',
      purpose: 'Raw Material Delivery',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
      notes: 'Invoice #INV-889 verified',
    },
    {
      id: 'rec_103',
      vehicleNumber: 'MH12D 4567',
      date: todayStr,
      time: '10:30',
      timestamp: new Date(`${todayStr}T10:30:00`).getTime(),
      gate: 'Gate 1 (Main)',
      vehicleType: 'Car',
      movementType: 'Entry',
      driverName: 'Anil Deshmukh',
      driverPhone: '+91 99220 87654',
      purpose: 'Client Consultation',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
      notes: 'Parked in Zone B',
    },
    {
      id: 'rec_104',
      vehicleNumber: 'KA05E 8821',
      date: todayStr,
      time: '11:05',
      timestamp: new Date(`${todayStr}T11:05:00`).getTime(),
      gate: 'Gate 3 (Employee / Staff)',
      vehicleType: 'Motorcycle',
      movementType: 'Entry',
      driverName: 'Rohan Naik',
      driverPhone: '+91 98450 11223',
      purpose: 'Employee Shift In',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
      notes: 'Employee ID #EMP-1092',
    },
    {
      id: 'rec_105',
      vehicleNumber: 'WB39F 9009',
      date: todayStr,
      time: '13:20',
      timestamp: new Date(`${todayStr}T13:20:00`).getTime(),
      gate: 'Gate 1 (Main)',
      vehicleType: 'Car',
      movementType: 'Exit',
      driverName: 'Vikram Das',
      driverPhone: '+91 98301 23456',
      purpose: 'Meeting Concluded',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
      notes: 'Visitor Pass surrendered',
    },
    {
      id: 'rec_106',
      vehicleNumber: 'TN07B 6543',
      date: todayStr,
      time: '14:10',
      timestamp: new Date(`${todayStr}T14:10:00`).getTime(),
      gate: 'Gate 2 (Cargo / Logistics)',
      vehicleType: 'Delivery Van',
      movementType: 'Entry',
      driverName: 'Karthik Raja',
      driverPhone: '+91 94440 99887',
      purpose: 'Courier Dispatch',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
      notes: '12 Parcels dispatched',
    },

    // Yesterday's entries
    {
      id: 'rec_201',
      vehicleNumber: 'WB39F 9009',
      date: yesterdayStr,
      time: '09:00',
      timestamp: new Date(`${yesterdayStr}T09:00:00`).getTime(),
      gate: 'Gate 1 (Main)',
      vehicleType: 'Car',
      movementType: 'Entry',
      driverName: 'Vikram Das',
      driverPhone: '+91 98301 23456',
      purpose: 'Site Inspection',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
    },
    {
      id: 'rec_202',
      vehicleNumber: 'GJ01A 3344',
      date: yesterdayStr,
      time: '10:45',
      timestamp: new Date(`${yesterdayStr}T10:45:00`).getTime(),
      gate: 'Gate 2 (Cargo / Logistics)',
      vehicleType: 'Truck',
      movementType: 'Entry',
      driverName: 'Jignesh Patel',
      driverPhone: '+91 98250 67890',
      purpose: 'Heavy Equipment Delivery',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
    },
    {
      id: 'rec_203',
      vehicleNumber: 'HR26D 5512',
      date: yesterdayStr,
      time: '14:00',
      timestamp: new Date(`${yesterdayStr}T14:00:00`).getTime(),
      gate: 'Gate 4 (Visitor)',
      vehicleType: 'Car',
      movementType: 'Entry',
      driverName: 'Deepak Sharma',
      driverPhone: '+91 98120 44556',
      purpose: 'Audit & Compliance',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
    },

    // Two days ago entries
    {
      id: 'rec_301',
      vehicleNumber: 'KA01M 7700',
      date: twoDaysAgoStr,
      time: '08:30',
      timestamp: new Date(`${twoDaysAgoStr}T08:30:00`).getTime(),
      gate: 'Gate 1 (Main)',
      vehicleType: 'Car',
      movementType: 'Entry',
      driverName: 'Naveen Rao',
      driverPhone: '+91 98800 12389',
      purpose: 'Board Meeting',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
    },
    {
      id: 'rec_302',
      vehicleNumber: 'UP32B 4410',
      date: twoDaysAgoStr,
      time: '11:15',
      timestamp: new Date(`${twoDaysAgoStr}T11:15:00`).getTime(),
      gate: 'Gate 2 (Cargo / Logistics)',
      vehicleType: 'Bus',
      movementType: 'Entry',
      driverName: 'Mahesh Mishra',
      driverPhone: '+91 94150 23412',
      purpose: 'Staff Shuttle 02',
      recordedByName: 'Priya Sharma (Supervisor)',
      recordedByUid: 'usr_mgmt_002',
    },
  ];
}
