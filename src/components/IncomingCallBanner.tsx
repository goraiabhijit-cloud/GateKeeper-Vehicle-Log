import React from 'react';
import { useCall } from '../context/CallContext';
import { Phone, PhoneOff, ShieldCheck, Radio, Lock } from 'lucide-react';

export const IncomingCallBanner: React.FC = () => {
  const { incomingCall, acceptIncomingCall, declineIncomingCall } = useCall();

  if (!incomingCall) return null;

  const { caller, callType, encryption } = incomingCall;

  return (
    <div className="fixed top-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-slate-950 text-white rounded-2xl shadow-2xl border-2 border-indigo-500/80 p-5 animate-in slide-in-from-top-4 duration-300 ring-4 ring-indigo-500/20">
      {/* Top security tag */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>E2EE 256-bit Encrypted Call</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase">
          {callType === 'ptt' ? 'Radio Intercom' : 'Direct Audio'}
        </span>
      </div>

      {/* Caller info */}
      <div className="py-4 flex items-center gap-3.5">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-600/40">
            {caller.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
            <Radio className="w-2.5 h-2.5 text-white animate-pulse" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-black text-white truncate">{caller.name}</div>
          <div className="text-xs text-indigo-300 font-medium">{caller.department} Department</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Safety PIN: {encryption.safetyNumber.slice(0, 9)}...
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={declineIncomingCall}
          className="py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-rose-500/40"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Decline</span>
        </button>

        <button
          type="button"
          onClick={acceptIncomingCall}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 animate-bounce"
        >
          <Phone className="w-4 h-4" />
          <span>Accept Call</span>
        </button>
      </div>
    </div>
  );
};
