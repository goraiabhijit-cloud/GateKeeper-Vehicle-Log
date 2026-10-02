import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecords } from '../context/RecordContext';
import { useCall } from '../context/CallContext';
import { PlateInput } from './PlateInput';
import { ExportModal } from './ExportModal';
import { formatDate } from '../data/seedData';
import { MovementType } from '../types';
import { 
  Calendar, 
  Clock, 
  FileSpreadsheet, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ArrowRightCircle, 
  ArrowLeftCircle, 
  User as UserIcon, 
  Phone, 
  RotateCcw,
  Radio
} from 'lucide-react';

export const ManagementView: React.FC = () => {
  const { currentUser } = useAuth();
  const { records, addRecord, deleteRecord } = useRecords();
  const { openCallDirectory } = useCall();

  const now = new Date();
  const todayStr = formatDate(now);
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [vehicleNumber, setVehicleNumber] = useState('WB39F 9009');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(currentTimeStr);
  const [movementType, setMovementType] = useState<MovementType>('Entry');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const setTimeToNow = () => {
    const current = new Date();
    setDate(formatDate(current));
    setTime(`${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const result = addRecord(vehicleNumber, date, time, {
      movementType,
      driverName,
      driverPhone,
      recordedByUid: currentUser?.id,
      recordedByName: currentUser?.name,
    });

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      // Reset form partially for next entry
      setVehicleNumber('');
      setDriverName('');
      setDriverPhone('');
      // update time to now
      setTimeToNow();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  // Recent entries for this gate manager
  const recentRecords = records.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Management View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
              Management Portal
            </span>
            <span className="text-xs text-slate-500">• Vehicle Data Ingestion & Control</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Gate Entry & Dispatch Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <strong className="text-slate-700">{currentUser?.name}</strong> (Department: {currentUser?.department})
          </p>
        </div>

        {/* Action Buttons: Encrypted Radio Call + CSV Export */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCallDirectory}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Radio className="w-4 h-4" />
            <span>Radio / Call Staff</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Vehicle Records (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Data Entry Form on Left + Recent Entries on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-800">Record Vehicle Entry / Exit</h3>
            </div>
            <button
              type="button"
              onClick={setTimeToNow}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Time to Now
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 animate-in fade-in ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Vehicle Number Component with Regex Validation & Auto-Mask */}
            <PlateInput
              value={vehicleNumber}
              onChange={setVehicleNumber}
              required
            />

            {/* Movement Type Toggle: Entry or Exit */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Movement Direction
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMovementType('Entry')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    movementType === 'Entry'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowRightCircle className="w-4 h-4" />
                  <span>VEHICLE ENTRY (IN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('Exit')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    movementType === 'Exit'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowLeftCircle className="w-4 h-4" />
                  <span>VEHICLE EXIT (OUT)</span>
                </button>
              </div>
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Date (YYYY-MM-DD)</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Time (24-Hour HH:MM)</span>
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Driver Details (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Driver Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Das"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Driver Phone</span>
                </label>
                <input
                  type="text"
                  placeholder="+91 98301 23456"
                  value={driverPhone}
                  onChange={e => setDriverPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Vehicle Entry Record (saveData)</span>
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2 font-mono">
                Regex verified: ^[A-Z]{'{2}'}[0-9]{'{2}'}[A-Z]{'{1}'}\s[0-9]{'{4}'}$
              </p>
            </div>
          </form>
        </div>

        {/* Live Records & Management Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-bold text-sm text-slate-800">Recent Records</h3>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-500">
                {records.length} Total Logged
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
              {recentRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No vehicle records recorded yet. Submit your first entry above.
                </div>
              ) : (
                recentRecords.map(item => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-slate-900 text-sm tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.vehicleNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.movementType === 'Exit'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.movementType || 'Entry'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-medium text-slate-700">{item.time}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                      {item.driverName && (
                        <div className="text-[11px] text-slate-400 truncate">
                          Driver: {item.driverName}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      title="Delete record"
                      onClick={() => deleteRecord(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSV Export Modal with Date Range Selector */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
