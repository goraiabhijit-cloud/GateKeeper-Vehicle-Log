import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecords } from '../context/RecordContext';
import { useCall } from '../context/CallContext';
import { formatDate } from '../data/seedData';
import { 
  Calendar, 
  Search, 
  Car, 
  Clock, 
  ArrowRightCircle, 
  ArrowLeftCircle, 
  Printer, 
  ListFilter, 
  Database, 
  ChevronRight,
  Shield,
  FileSpreadsheet,
  Radio
} from 'lucide-react';
import { ExportModal } from './ExportModal';

export const EmployeeView: React.FC = () => {
  const { currentUser } = useAuth();
  const { fetchDataByDate, records } = useRecords();
  const { openCallDirectory } = useCall();

  const now = new Date();
  const todayStr = formatDate(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = formatDate(twoDaysAgo);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [movementFilter, setMovementFilter] = useState<'All' | 'Entry' | 'Exit'>('All');
  const [viewMode, setViewMode] = useState<'standard' | 'simpleList'>('standard');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Query records for selected date using exact method specified: fetchDataByDate
  const dateRecords = fetchDataByDate(selectedDate);

  // Apply search and filter
  const filteredRecords = dateRecords.filter(r => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchPlate = r.vehicleNumber.toLowerCase().includes(q);
      const matchDriver = r.driverName?.toLowerCase().includes(q);
      if (!matchPlate && !matchDriver) return false;
    }
    if (movementFilter !== 'All' && r.movementType !== movementFilter) return false;
    return true;
  });

  // Simple string list matching user's Android code specification: "$vNo - $time"
  const formattedStringList = filteredRecords.map(r => `${r.vehicleNumber} - ${r.time}`);

  // Daily statistics
  const totalEntries = dateRecords.filter(r => r.movementType !== 'Exit').length;
  const totalExits = dateRecords.filter(r => r.movementType === 'Exit').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Employee View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              Employee Portal
            </span>
            <span className="text-xs text-slate-500">• Vehicle Registry & Date Query</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Gate Log Reader & Date Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <strong className="text-slate-700">{currentUser?.name}</strong> (Staff ID: {currentUser?.id})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openCallDirectory}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Radio className="w-4 h-4" />
            <span>Radio / Call Staff</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Print Daily Sheet</span>
          </button>
        </div>
      </div>

      {/* Date Picker Bar & Query Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Select Date (Firestore Query: whereEqualTo("date", selectedDate))</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-800"
              />
              {/* Quick Date Chips */}
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  selectedDate === todayStr
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(yesterdayStr)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  selectedDate === yesterdayStr
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(twoDaysAgoStr)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  selectedDate === twoDaysAgoStr
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                2 Days Ago
              </button>
            </div>
          </div>

          {/* Daily Stats Summary */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-xl font-black text-slate-900 font-mono">{dateRecords.length}</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase">Total on Date</div>
            </div>
            <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <div className="text-xl font-black text-emerald-800 font-mono">{totalEntries}</div>
              <div className="text-[10px] font-semibold text-emerald-700 uppercase">Entries (In)</div>
            </div>
            <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <div className="text-xl font-black text-amber-800 font-mono">{totalExits}</div>
              <div className="text-[10px] font-semibold text-amber-700 uppercase">Exits (Out)</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* Search Box */}
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plate (e.g. WB39, 9009) or driver..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Movement Filter */}
          <div className="md:col-span-3">
            <select
              value={movementFilter}
              onChange={e => setMovementFilter(e.target.value as 'All' | 'Entry' | 'Exit')}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
            >
              <option value="All">All Moves</option>
              <option value="Entry">Entry (In)</option>
              <option value="Exit">Exit (Out)</option>
            </select>
          </div>

          {/* Display Mode Toggle */}
          <div className="md:col-span-2 flex items-center justify-end">
            <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex">
              <button
                type="button"
                onClick={() => setViewMode('standard')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  viewMode === 'standard' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('simpleList')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  viewMode === 'simpleList' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                List ($vNo - $time)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Query Results Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Section Title & Code Insight */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-sm text-slate-800">
              Queried Records for: <span className="font-mono text-indigo-700 font-extrabold">{selectedDate}</span>
            </span>
            <span className="text-xs text-slate-400">({filteredRecords.length} records found)</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            orderBy("timestamp", DESCENDING)
          </div>
        </div>

        {/* View Mode: Simple List matching "$vNo - $time" specification */}
        {viewMode === 'simpleList' ? (
          <div className="p-6">
            <div className="bg-slate-900 rounded-xl p-5 text-slate-100 font-mono text-sm space-y-2 border border-slate-800">
              <div className="text-xs text-indigo-400 font-bold border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>// RecyclerView Data: List&lt;String&gt; ("$vNo - $time")</span>
                <span>Count: {formattedStringList.length}</span>
              </div>
              {formattedStringList.length === 0 ? (
                <div className="text-slate-500 py-4 italic text-xs">No records for {selectedDate}</div>
              ) : (
                formattedStringList.map((str, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-1 hover:text-emerald-400 transition-colors">
                    <span className="text-slate-600 select-none w-6 text-right text-xs">{(idx + 1).toString().padStart(2, '0')}.</span>
                    <span className="font-bold text-amber-300">{str}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* View Mode: Rich Card View with Details */
          <div className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <Car className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">No records found for {selectedDate}</p>
                <p className="text-xs text-slate-400">
                  Select another date above (like Today or Yesterday) or clear your search filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(todayStr);
                    setSearchQuery('');
                    setMovementFilter('All');
                  }}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  Reset Date to Today ({todayStr})
                </button>
              </div>
            ) : (
              filteredRecords.map((item, index) => (
                <div key={item.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column: Number Plate & Standard Code format */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-1">
                      {index + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Highlighting prompt format: $vNo - $time */}
                        <div className="inline-flex items-center bg-slate-900 text-white rounded-lg px-2.5 py-1 font-mono font-extrabold text-sm tracking-wider shadow-2xs">
                          <span>{item.vehicleNumber}</span>
                          <span className="text-slate-400 mx-1.5">-</span>
                          <span className="text-amber-400">{item.time}</span>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            item.movementType === 'Exit'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {item.movementType || 'Entry'}
                        </span>
                      </div>

                      {item.driverName && (
                        <div className="text-xs text-slate-600 flex items-center gap-2 pt-0.5">
                          <span>Driver: <strong className="text-slate-800">{item.driverName}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Time badge & Verifier */}
                  <div className="text-left sm:text-right shrink-0 space-y-0.5 pl-12 sm:pl-0">
                    <div className="text-xs font-mono font-semibold text-slate-500 flex sm:justify-end items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.time} hrs</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Logged by: {item.recordedByName || 'System'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* CSV Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
