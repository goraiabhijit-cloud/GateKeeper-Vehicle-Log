import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecords } from '../context/RecordContext';
import { useCall } from '../context/CallContext';
import { Department } from '../types';
import { 
  UserPlus, 
  Users, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Briefcase, 
  Key, 
  Mail, 
  User, 
  Clock, 
  Activity,
  ToggleLeft,
  ToggleRight,
  Phone
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { users, currentUser, registerUser, updateUser, deleteUser, logs } = useAuth();
  const { records } = useRecords();
  const { initiateCall } = useCall();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [department, setDepartment] = useState<Department>('Management');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const result = registerUser(name, username, password, department);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setName('');
      setUsername('');
      setPassword('password123');
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleToggleStatus = (userId: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateUser(userId, { status: nextStatus });
  };

  const managementCount = users.filter(u => u.department === 'Management').length;
  const employeeCount = users.filter(u => u.department === 'Employee').length;

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 rounded-full border border-purple-200">
              Admin Console
            </span>
            <span className="text-xs text-slate-500">• User Provisioning & System Governance</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Access Control & User Registration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Only System Administrators can register new Management and Employee accounts in Firestore.
          </p>
        </div>

        {/* Quick System Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl text-center">
            <div className="text-lg font-black text-purple-900 font-mono">{users.length}</div>
            <div className="text-[10px] font-bold text-purple-700 uppercase">Users Total</div>
          </div>
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
            <div className="text-lg font-black text-indigo-900 font-mono">{records.length}</div>
            <div className="text-[10px] font-bold text-indigo-700 uppercase">Total Records</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-800">Register New Staff / Manager</h3>
          </div>

          <form onSubmit={handleRegister} className="p-6 space-y-4">
            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
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

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. David Miller"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email / Username</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. david.miller@gatekeeper.io"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Default demo: password123</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Department Role</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDepartment('Management')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    department === 'Management'
                      ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Management</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Input data, validate WB39F 9009, export CSV, edit logs.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDepartment('Employee')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    department === 'Employee'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Employee</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Query by date, view records list ($vNo - $time).
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User in Firestore (registerUser)</span>
              </button>
              <div className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                auth.createUserWithEmailAndPassword & db.collection("users").set()
              </div>
            </div>
          </form>
        </div>

        {/* User Directory Table (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-800">Registered Users Directory</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {managementCount} Managers • {employeeCount} Employees
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {users.map(u => (
                <div key={u.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        u.department === 'Admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : u.department === 'Management'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">{u.name}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            u.department === 'Admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.department === 'Management'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.department}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{u.username}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {u.id !== currentUser?.id && (
                      <button
                        type="button"
                        onClick={() => initiateCall(u, 'voice')}
                        title={`Call ${u.name} (Encrypted)`}
                        className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Call</span>
                      </button>
                    )}

                    <button
                      type="button"
                      title={u.status === 'active' ? 'Disable Account' : 'Enable Account'}
                      onClick={() => handleToggleStatus(u.id, u.status)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 border transition-colors ${
                        u.status === 'active'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'text-slate-500 bg-slate-100 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {u.status === 'active' ? (
                        <>
                          <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>

                    {u.department !== 'Admin' && (
                      <button
                        type="button"
                        title="Delete user"
                        onClick={() => deleteUser(u.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail / System Log Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-800">System Activity & Audit Log</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Last 10 events</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {logs.slice(0, 8).map(log => (
                <div key={log.id} className="p-3.5 text-xs flex items-start gap-3 hover:bg-slate-50">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-800">{log.action}</strong>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-mono text-[11px]">{log.actor}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
