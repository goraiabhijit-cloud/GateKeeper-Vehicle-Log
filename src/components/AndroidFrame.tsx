import React from 'react';
import { Wifi, BatteryMedium, Signal, ChevronLeft, Home, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AndroidFrameProps {
  children: React.ReactNode;
  onExit: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children, onExit }) => {
  const { currentUser } = useAuth();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 min-h-[calc(100vh-4rem)] bg-slate-900/90 backdrop-blur-md">
      {/* Frame Switcher Bar */}
      <div className="mb-4 flex items-center justify-between w-full max-w-[420px] text-xs text-slate-300 px-2">
        <span className="font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Android Pixel 8 Simulator
        </span>
        <button
          onClick={onExit}
          className="text-xs text-indigo-300 hover:text-white underline font-semibold"
        >
          Switch to Desktop Full View
        </button>
      </div>

      {/* Android Device Body */}
      <div className="relative w-full max-w-[412px] h-[840px] bg-slate-950 rounded-[44px] p-3 shadow-2xl ring-1 ring-white/20 shadow-indigo-500/10 flex flex-col overflow-hidden">
        {/* Hardware Bezel & Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
        </div>

        {/* Screen Viewport */}
        <div className="w-full h-full bg-slate-100 rounded-[34px] overflow-hidden flex flex-col relative">
          {/* Android Status Bar */}
          <div className="h-8 bg-slate-900 text-white px-5 flex items-center justify-between text-[11px] font-mono select-none shrink-0 z-40">
            <span>{timeStr}</span>
            <div className="flex items-center gap-2">
              <Signal className="w-3.5 h-3.5 text-white/90" />
              <Wifi className="w-3.5 h-3.5 text-white/90" />
              <BatteryMedium className="w-4 h-4 text-white/90" />
            </div>
          </div>

          {/* Android App Bar */}
          <div className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-30">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">GateKeeper Android</span>
            </div>
            {currentUser && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                {currentUser.department}
              </span>
            )}
          </div>

          {/* Android Screen Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {children}
          </div>

          {/* Android Navigation Bar */}
          <div className="h-10 bg-slate-950 text-slate-400 flex items-center justify-around shrink-0 px-8 z-40 select-none border-t border-slate-900">
            <button
              type="button"
              className="p-1 hover:text-white transition-colors"
              title="Android Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-1 hover:text-white transition-colors"
              title="Android Home"
            >
              <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
            </button>
            <button
              type="button"
              className="p-1 hover:text-white transition-colors"
              title="Android Recent Apps"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
