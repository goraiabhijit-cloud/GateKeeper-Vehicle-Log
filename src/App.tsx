import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RecordProvider } from './context/RecordContext';
import { CallProvider } from './context/CallContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { ManagementView } from './components/ManagementView';
import { EmployeeView } from './components/EmployeeView';
import { AdminView } from './components/AdminView';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AndroidFrame } from './components/AndroidFrame';
import { CallModal } from './components/CallModal';
import { IncomingCallBanner } from './components/IncomingCallBanner';
import { CallDirectoryModal } from './components/CallDirectoryModal';
import { Department } from './types';
import { Briefcase, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, switchUserRole } = useAuth();
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // If user is not logged in, render the clean login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
        />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          {isMobileFrame ? (
            <AndroidFrame onExit={() => setIsMobileFrame(false)}>
              <LoginView />
            </AndroidFrame>
          ) : (
            <LoginView />
          )}
        </main>
        <ArchitectureModal
          isOpen={isArchitectureOpen}
          onClose={() => setIsArchitectureOpen(false)}
        />
        <IncomingCallBanner />
        <CallModal />
        <CallDirectoryModal />
      </div>
    );
  }

  // Active view matches department
  const activeDepartment = currentUser.department;

  const renderCurrentView = () => {
    switch (activeDepartment) {
      case 'Management':
        return <ManagementView />;
      case 'Employee':
        return <EmployeeView />;
      case 'Admin':
        return <AdminView />;
      default:
        return <ManagementView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Quick Role Navigation Subbar */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Active Portal:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => switchUserRole('Management')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeDepartment === 'Management'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Management View</span>
              </button>

              <button
                type="button"
                onClick={() => switchUserRole('Employee')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeDepartment === 'Employee'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Employee View</span>
              </button>

              <button
                type="button"
                onClick={() => switchUserRole('Admin')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeDepartment === 'Admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin View</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 hidden md:block">
            {activeDepartment === 'Management' && 'Validates WB39F 9009 regex, auto-masks plate, exports CSV & encrypted intercom'}
            {activeDepartment === 'Employee' && 'Select date to query records, view in format: "$vNo - $time" & encrypted calling'}
            {activeDepartment === 'Admin' && 'Registers new Management and Employee accounts in Firestore auth schema'}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isMobileFrame ? (
          <AndroidFrame onExit={() => setIsMobileFrame(false)}>
            {renderCurrentView()}
          </AndroidFrame>
        ) : (
          renderCurrentView()
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© GateKeeper Security Solutions • Vehicle Ingress & In-Premises Registry</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Format: <strong>WB39F 9009</strong></span>
            <span>•</span>
            <span>E2EE Calling: <strong>AES-256-GCM / DTLS-SRTP</strong></span>
          </div>
        </div>
      </footer>

      {/* Architecture & Code Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Encrypted Calling Modals */}
      <IncomingCallBanner />
      <CallModal />
      <CallDirectoryModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RecordProvider>
        <CallProvider>
          <AppContent />
        </CallProvider>
      </RecordProvider>
    </AuthProvider>
  );
}
