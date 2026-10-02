import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VehicleRecord, MovementType, VehicleType, GateId } from '../types';
import { getInitialRecords, formatDate } from '../data/seedData';
import { isValidVehicle, formatVehiclePlate } from '../data/indianStates';

export interface CSVExportOptions {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  movementFilter?: 'All' | 'Entry' | 'Exit';
}

interface RecordContextType {
  records: VehicleRecord[];
  addRecord: (
    vehicleNumber: string,
    date: string,
    time: string,
    meta?: {
      gate?: GateId | string;
      vehicleType?: VehicleType;
      movementType?: MovementType;
      driverName?: string;
      driverPhone?: string;
      purpose?: string;
      notes?: string;
      recordedByUid?: string;
      recordedByName?: string;
    }
  ) => { success: boolean; message: string; record?: VehicleRecord };
  updateRecord: (id: string, updates: Partial<VehicleRecord>) => { success: boolean; message: string };
  deleteRecord: (id: string) => { success: boolean; message: string };
  fetchDataByDate: (selectedDate: string) => VehicleRecord[];
  exportToCSV: (options: CSVExportOptions) => {
    success: boolean;
    rowCount: number;
    csvContent: string;
    filename: string;
  };
  shareCSV: (filename: string, csvContent: string) => Promise<{ success: boolean; message: string }>;
  resetDemoRecords: () => void;
}

const RecordContext = createContext<RecordContextType | undefined>(undefined);

const RECORDS_STORAGE_KEY = 'gatekeeper_records_v1';

export const RecordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<VehicleRecord[]>(() => {
    try {
      const stored = localStorage.getItem(RECORDS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load records from storage', e);
    }
    return getInitialRecords();
  });

  // Save to localStorage whenever records change
  useEffect(() => {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  /**
   * Save Vehicle Record logic matching user specification:
   * "Use a Regex (Regular Expression) to validate the vehicle number format WB39F 9009...
   * fun saveData(vNumber: String, date: String, time: String) {
   *     if (!isValidVehicle(vNumber)) {
   *         Toast.makeText(this, "Invalid Format (e.g. WB39F 9009)", Toast.LENGTH_SHORT).show()
   *         return
   *     }
   *     val record = hashMapOf("vehicleNumber" to vNumber, "date" to date, "time" to time, "timestamp" to FieldValue.serverTimestamp())
   *     db.collection("records").add(record)
   * }"
   */
  const addRecord = (
    vNumber: string,
    date: string,
    time: string,
    meta?: {
      gate?: GateId | string;
      vehicleType?: VehicleType;
      movementType?: MovementType;
      driverName?: string;
      driverPhone?: string;
      purpose?: string;
      notes?: string;
      recordedByUid?: string;
      recordedByName?: string;
    }
  ) => {
    const formatted = formatVehiclePlate(vNumber.trim());

    if (!isValidVehicle(formatted, true)) {
      return {
        success: false,
        message: 'Invalid Format (e.g. WB39F 9009). Must follow standard registration format.',
      };
    }

    if (!date) {
      return { success: false, message: 'Please provide a valid entry date.' };
    }

    if (!time) {
      return { success: false, message: 'Please provide a valid entry time.' };
    }

    // Construct timestamp
    let ts = Date.now();
    try {
      const parsed = new Date(`${date}T${time}:00`).getTime();
      if (!isNaN(parsed)) {
        ts = parsed;
      }
    } catch {
      ts = Date.now();
    }

    const newRecord: VehicleRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      vehicleNumber: formatted,
      date,
      time,
      timestamp: ts,
      gate: meta?.gate || 'Gate 1 (Main)',
      vehicleType: meta?.vehicleType || 'Car',
      movementType: meta?.movementType || 'Entry',
      driverName: meta?.driverName || '',
      driverPhone: meta?.driverPhone || '',
      purpose: meta?.purpose || 'Standard Access',
      notes: meta?.notes || '',
      recordedByUid: meta?.recordedByUid,
      recordedByName: meta?.recordedByName,
    };

    setRecords(prev => [newRecord, ...prev]);

    return {
      success: true,
      message: `Record saved for vehicle ${formatted} at ${time}`,
      record: newRecord,
    };
  };

  const updateRecord = (id: string, updates: Partial<VehicleRecord>) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id === id) {
          return { ...r, ...updates };
        }
        return r;
      })
    );
    return { success: true, message: 'Record updated successfully' };
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    return { success: true, message: 'Record deleted from database' };
  };

  /**
   * Fetch data by date matching user specification:
   * "db.collection("records")
   *    .whereEqualTo("date", selectedDate)
   *    .orderBy("timestamp", Query.Direction.DESCENDING)"
   */
  const fetchDataByDate = useCallback(
    (selectedDate: string): VehicleRecord[] => {
      if (!selectedDate) return [];
      return records
        .filter(r => r.date === selectedDate)
        .sort((a, b) => b.timestamp - a.timestamp);
    },
    [records]
  );

  /**
   * Export to CSV with Date Range option (User prompt request)
   * Includes fields: date, time, vehicleNumber, timestamp, plus gate, movementType, driverName, purpose
   */
  const exportToCSV = (options: CSVExportOptions) => {
    const { startDate, endDate, movementFilter } = options;

    const filtered = records
      .filter(r => {
        if (startDate && r.date < startDate) return false;
        if (endDate && r.date > endDate) return false;
        if (movementFilter && movementFilter !== 'All' && r.movementType !== movementFilter) return false;
        return true;
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    // CSV Headers
    const headers = [
      'date',
      'time',
      'vehicleNumber',
      'timestamp',
      'isoTimestamp',
      'movementType',
      'driverName',
      'driverPhone',
      'recordedBy',
    ];

    const escapeCsv = (val: unknown): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filtered.map(r => [
      escapeCsv(r.date),
      escapeCsv(r.time),
      escapeCsv(r.vehicleNumber),
      r.timestamp,
      escapeCsv(new Date(r.timestamp).toISOString()),
      escapeCsv(r.movementType || 'Entry'),
      escapeCsv(r.driverName || ''),
      escapeCsv(r.driverPhone || ''),
      escapeCsv(r.recordedByName || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const filename = `vehicle_records_${startDate || 'all'}_to_${endDate || 'all'}.csv`;

    // Trigger file download to device storage
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      rowCount: filtered.length,
      csvContent,
      filename,
    };
  };

  /**
   * Share CSV using Web Share API or Clipboard fallback
   */
  const shareCSV = async (filename: string, csvContent: string): Promise<{ success: boolean; message: string }> => {
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const file = new File([blob], filename, { type: 'text/csv' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'GateKeeper Vehicle Records Export',
          text: `Export of vehicle entry records (${filename})`,
          files: [file],
        });
        return { success: true, message: 'Shared successfully via device share sheet.' };
      } else if (navigator.share) {
        await navigator.share({
          title: 'GateKeeper Vehicle Records Export',
          text: `Vehicle Entry Records Export (${filename})\n\n${csvContent.slice(0, 1500)}...`,
        });
        return { success: true, message: 'Shared successfully via share dialog.' };
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(csvContent);
        return {
          success: true,
          message: 'Web Share not supported in this browser. CSV content copied to clipboard!',
        };
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, message: 'Sharing was cancelled by user.' };
      }
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(csvContent);
        return {
          success: true,
          message: 'CSV copied to clipboard for manual sharing.',
        };
      } catch {
        return { success: false, message: 'Failed to share file.' };
      }
    }
  };

  const resetDemoRecords = () => {
    const initial = getInitialRecords();
    setRecords(initial);
    localStorage.removeItem(RECORDS_STORAGE_KEY);
  };

  return (
    <RecordContext.Provider
      value={{
        records,
        addRecord,
        updateRecord,
        deleteRecord,
        fetchDataByDate,
        exportToCSV,
        shareCSV,
        resetDemoRecords,
      }}
    >
      {children}
    </RecordContext.Provider>
  );
};

export const useRecords = () => {
  const context = useContext(RecordContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordProvider');
  }
  return context;
};
