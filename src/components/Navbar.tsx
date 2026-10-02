import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import { Department } from '../types';
import { 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  LogOut, 
  Code2, 
  RotateCcw,
  Briefcase,
  UserCheck,
  ShieldAlert,
  PhoneCall,
  Lock
} from 'lucide-react';
import { useRecords } from '../context/RecordContext';

interface NavbarProps {
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenArchitecture: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMobileFrame,
  onToggleMobileFrame,
  onOpenArchitecture,
}) => {
  const { currentUser, logout, switchUserRole, resetAllUsers } = useAuth();
  const { resetDemoRecords } = useRecords();
  const { openCallDirectory, activeCall, callHistory } = useCall();

  const handleResetData = () => {
    if (window.confirm('Reset all users and sample vehicle records to default demo data?')) {
      resetAllUsers();
      resetDemoRecords();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg">
                  GateKeeper
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                  Vehicle Log
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Role-Based Gate Ingress & Date Registry
              </p>
            </div>
          </div>

          {/* Center: Quick Role Switcher for Testability */}
          {currentUser && (
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Role:
              </span>
              <button
                type="button"
                onClick={() => switchUserRole('Management')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  currentUser.department === 'Management'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Management</span>
              </button>

              <button
                type="button"
                onClick={() => switchUserRole('Employee')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  currentUser.department === 'Employee'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Employee</span>
              </button>

              <button
                type="button"
                onClick={() => switchUserRole('Admin')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  currentUser.department === 'Admin'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          )}

          {/* Right Actions: Mobile frame toggle, Encrypted Call, Architecture, Profile, Logout */}
          <div className="flex items-center gap-2">
            {/* Encrypted Call / Radio Button */}
            {currentUser && (
              <button
                type="button"
                onClick={openCallDirectory}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 relative group"
                title="Encrypted Staff Calling & Intercom"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Encrypted Calls</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse"></span>
                {activeCall && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white animate-ping"></span>
                )}
              </button>
            )}

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={handleResetData}
              title="Reset Demo Database"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors hidden sm:flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Android Architecture Spec Modal */}
            <button
              type="button"
              onClick={onOpenArchitecture}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Android Spec</span>
            </button>

            {/* Mobile / Android Simulator View Toggle */}
            <button
              type="button"
              onClick={onToggleMobileFrame}
              title={isMobileFrame ? 'Switch to Full Dashboard' : 'Preview in Android Mobile Frame'}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-xs font-semibold ${
                isMobileFrame
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isMobileFrame ? (
                <>
                  <Monitor className="w-4 h-4" />
                  <span className="hidden md:inline">Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden md:inline">Android View</span>
                </>
              )}
            </button>

            {/* User Profile Pill & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {currentUser.department}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
