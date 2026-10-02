import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import { User, Department } from '../types';
import { 
  Phone, 
  Radio, 
  X, 
  Lock, 
  Clock, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PhoneMissed, 
  Trash2, 
  ShieldCheck, 
  Users 
} from 'lucide-react';

export const CallDirectoryModal: React.FC = () => {
  const { users, currentUser } = useAuth();
  const { isCallDirectoryOpen, closeCallDirectory, initiateCall, callHistory, clearHistory } = useCall();

  const [activeTab, setActiveTab] = useState<'directory' | 'history'>('directory');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<'All' | Department>('All');

  if (!isCallDirectoryOpen) return null;

  // Filter users excluding current logged-in user
  const otherUsers = users.filter(u => u.id !== currentUser?.id);

  const filteredUsers = otherUsers.filter(u => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.username.toLowerCase().includes(q)) return false;
    }
    if (deptFilter !== 'All' && u.department !== deptFilter) return false;
    return true;
  });

  const formatDuration = (secs: number) => {
    if (secs === 0) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const formatTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Phone className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Encrypted Staff Calling & Intercom</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] text-emerald-300 font-mono font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  E2EE Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct peer-to-peer 256-bit encrypted voice and radio transmission
              </p>
            </div>
          </div>

          <button
            onClick={closeCallDirectory}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'directory'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory ({otherUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Call History ({callHistory.length})</span>
          </button>
        </div>

        {/* Directory Tab */}
        {activeTab === 'directory' ? (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {/* Search and Dept Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value as 'All' | Department)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="All">All Roles</option>
                <option value="Management">Management</option>
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No staff members found matching criteria.
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{user.name}</span>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              user.department === 'Admin'
                                ? 'bg-purple-100 text-purple-800'
                                : user.department === 'Management'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {user.department}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{user.username}</div>
                      </div>
                    </div>

                    {/* Calling Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => initiateCall(user, 'voice')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        title="Start Encrypted Voice Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Voice Call</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => initiateCall(user, 'ptt')}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Start Push-To-Talk Radio Intercom"
                      >
                        <Radio className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="hidden sm:inline">PTT Radio</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Hint */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Tip: Open GateKeeper in two browser tabs with different accounts to test live ringing and bidirectional encrypted streaming!
              </span>
            </div>
          </div>
        ) : (
          /* History Tab */
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Encrypted call records</span>
              {callHistory.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {callHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No call history recorded.</div>
              ) : (
                callHistory.map(item => (
                  <div key={item.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          item.direction === 'incoming'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.direction === 'outgoing'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {item.direction === 'incoming' && <ArrowDownLeft className="w-4 h-4" />}
                        {item.direction === 'outgoing' && <ArrowUpRight className="w-4 h-4" />}
                        {item.direction === 'missed' && <PhoneMissed className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{item.peerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.callType === 'ptt' ? 'Radio PTT' : 'Voice Call'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{formatTimeAgo(item.timestamp)}</span>
                          <span>•</span>
                          <span>Duration: {formatDuration(item.durationSeconds)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Safety: {item.safetyNumber.slice(0, 9)}...
                        </div>
                      </div>
                    </div>

                    {/* Redial button */}
                    {users.find(u => u.id === item.peerId) && (
                      <button
                        type="button"
                        onClick={() => {
                          const target = users.find(u => u.id === item.peerId);
                          if (target) initiateCall(target, item.callType);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                        <span>Call Back</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted with AES-256-GCM & DTLS-SRTP</span>
          </div>
          <button
            type="button"
            onClick={closeCallDirectory}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
