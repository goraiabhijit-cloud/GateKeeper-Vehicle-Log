import React from 'react';
import { formatVehiclePlate, isValidVehicle, getStateFromPlate } from '../data/indianStates';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PlateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const PlateInput: React.FC<PlateInputProps> = ({ value, onChange }) => {
  const isValid = isValidVehicle(value, true);
  const stateName = getStateFromPlate(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatVehiclePlate(raw);
    onChange(formatted);
  };

  const setPreset = (preset: string) => {
    onChange(preset);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span>Vehicle Registration Number</span>
          <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-slate-500 font-medium">Format: WB39F 9009</span>
      </div>

      {/* Realistic HSRP Vehicle License Plate Styled Box */}
      <div className="relative rounded-xl overflow-hidden border-2 border-slate-900 bg-white shadow-md p-1">
        <div className="flex items-stretch bg-amber-50/20 rounded-lg overflow-hidden border border-slate-300">
          {/* Blue IND Badge Strip */}
          <div className="w-10 bg-blue-700 text-white flex flex-col items-center justify-between py-1.5 px-0.5 select-none shrink-0 border-r border-blue-900">
            <span className="text-[8px] font-bold text-blue-200">INDIA</span>
            <div className="w-4 h-4 rounded-full border border-amber-300 flex items-center justify-center">
              <span className="text-[7px] text-amber-300 font-black">✦</span>
            </div>
            <span className="text-[10px] font-extrabold tracking-tighter">IND</span>
          </div>

          {/* Actual Input */}
          <div className="relative flex-1 flex items-center px-3 py-1 bg-white">
            <input
              type="text"
              value={value}
              onChange={handleInputChange}
              maxLength={11}
              placeholder="WB39F 9009"
              autoComplete="off"
              spellCheck="false"
              className="w-full text-2xl font-mono font-black tracking-widest text-slate-900 placeholder:text-slate-300 uppercase focus:outline-none bg-transparent"
            />
            {value.length > 0 && (
              <div className="shrink-0 ml-2">
                {isValid ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>VALID</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>FORMAT</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* State Identification Badge & Live Feedback */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {stateName ? (
          <div className="flex items-center gap-1.5 text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>State: {stateName}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">
            Auto-masks with space after 5 characters (e.g. typing WB39F9009)
          </span>
        )}

        {/* Quick Test Presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Presets:</span>
          {(['WB39F 9009', 'DL04C 1190', 'MH12D 4567'] as const).map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setPreset(preset)}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-medium rounded border border-slate-300 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
