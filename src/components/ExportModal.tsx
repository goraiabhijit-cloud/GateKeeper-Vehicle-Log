import React, { useState } from 'react';
import { useRecords } from '../context/RecordContext';
import { formatDate } from '../data/seedData';
import { 
  Download, 
  Share2, 
  Copy, 
  Calendar, 
  Check, 
  X, 
  FileSpreadsheet, 
  Filter, 
  Eye, 
  AlertCircle 
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { records, exportToCSV, shareCSV } = useRecords();

  const todayStr = formatDate(new Date());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = formatDate(sevenDaysAgo);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = formatDate(thirtyDaysAgo);

  const [startDate, setStartDate] = useState(sevenDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [movementFilter, setMovementFilter] = useState<'All' | 'Entry' | 'Exit'>('All');
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  // Calculate matching count
  const matchingRecords = records.filter(r => {
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    if (movementFilter !== 'All' && r.movementType !== movementFilter) return false;
    return true;
  });

  const handleDownload = () => {
    const result = exportToCSV({
      startDate,
      endDate,
      movementFilter,
    });
    setShareStatus(`Exported ${result.rowCount} records to ${result.filename} and saved to your device.`);
    setTimeout(() => setShareStatus(null), 5000);
  };

  const handleShare = async () => {
    // Generate CSV content
    const headers = ['date', 'time', 'vehicleNumber', 'timestamp', 'movementType', 'driverName', 'driverPhone'];
    const rows = matchingRecords.map(r => [
      `"${r.date}"`,
      `"${r.time}"`,
      `"${r.vehicleNumber}"`,
      r.timestamp,
      `"${r.movementType || 'Entry'}"`,
      `"${r.driverName || ''}"`,
      `"${r.driverPhone || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const filename = `vehicle_records_${startDate}_to_${endDate}.csv`;

    const res = await shareCSV(filename, csvContent);
    setShareStatus(res.message);
    setTimeout(() => setShareStatus(null), 6000);
  };

  const handleCopyClipboard = async () => {
    const headers = ['date', 'time', 'vehicleNumber', 'timestamp', 'movementType', 'driverName', 'driverPhone'];
    const rows = matchingRecords.map(r => [
      `"${r.date}"`,
      `"${r.time}"`,
      `"${r.vehicleNumber}"`,
      r.timestamp,
      `"${r.movementType || 'Entry'}"`,
      `"${r.driverName || ''}"`,
      `"${r.driverPhone || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    await navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const setPreset = (type: 'today' | '7days' | '30days' | 'all') => {
    if (type === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === '7days') {
      setStartDate(sevenDaysAgoStr);
      setEndDate(todayStr);
    } else if (type === '30days') {
      setStartDate(thirtyDaysAgoStr);
      setEndDate(todayStr);
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <FileSpreadsheet className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Export Vehicle Records</h3>
              <p className="text-xs text-slate-300">Generate CSV file with date, time, vehicleNumber & timestamp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification */}
        {shareStatus && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs font-medium text-emerald-800 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{shareStatus}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Date Presets
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPreset('today')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  startDate === todayStr && endDate === todayStr
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setPreset('7days')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  startDate === sevenDaysAgoStr && endDate === todayStr
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setPreset('30days')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  startDate === thirtyDaysAgoStr && endDate === todayStr
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => setPreset('all')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  startDate === '' && endDate === ''
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Movement Type Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Movement Type
            </label>
            <div className="flex gap-2">
              {(['All', 'Entry', 'Exit'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMovementFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    movementFilter === type
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Scope & Count Badge */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
              <span className="text-xs font-semibold text-indigo-950">
                {matchingRecords.length} records ready for export
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 hover:underline"
            >
              <Eye className="w-3.5 h-3.5" />
              {showPreview ? 'Hide Preview' : 'Preview CSV'}
            </button>
          </div>

          {/* CSV Preview */}
          {showPreview && (
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-40 border border-slate-800">
              <div className="text-indigo-400 font-bold mb-1">// CSV Format Headers & Sample Records</div>
              <div className="text-amber-300">
                date,time,vehicleNumber,timestamp,movementType,driverName,driverPhone
              </div>
              {matchingRecords.slice(0, 3).map(r => (
                <div key={r.id} className="text-slate-300 truncate">
                  "{r.date}","{r.time}","{r.vehicleNumber}",{r.timestamp},"{r.movementType || 'Entry'}","{r.driverName || ''}","{r.driverPhone || ''}"
                </div>
              ))}
              {matchingRecords.length > 3 && (
                <div className="text-slate-500 italic mt-1">... and {matchingRecords.length - 3} more rows</div>
              )}
            </div>
          )}

          {/* Required Fields Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-600" />
              Included Standard Fields:
            </div>
            <p className="text-[11px] text-slate-500">
              • <strong className="text-slate-700">date</strong> (YYYY-MM-DD), <strong className="text-slate-700">time</strong> (HH:mm), <strong className="text-slate-700">vehicleNumber</strong> (e.g. WB39F 9009), <strong className="text-slate-700">timestamp</strong> (Unix Epoch ms), plus driver and movement direction.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyClipboard}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy CSV
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" /> Share
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={matchingRecords.length === 0}
              className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Save to Device (.csv)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
