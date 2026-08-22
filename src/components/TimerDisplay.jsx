import React from 'react';

export function TimerDisplay({ elapsedTime, duration = 30000, status }) {
  const remainingMs = Math.max(0, duration - elapsedTime);
  const remainingSec = (remainingMs / 1000).toFixed(1);
  const progressRatio = Math.min(1, elapsedTime / duration);
  const strokeDashoffset = 283 * progressRatio; // 2 * PI * r (r = 45) -> ~283

  // Visual state styling based on remaining time
  let colorClass = 'text-cyan-400 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.3)]';
  let strokeColor = '#06b6d4';
  let isWarning = false;
  let isUrgent = false;

  if (remainingMs <= 5000 && remainingMs > 0 && status === 'RUNNING') {
    isUrgent = true;
    colorClass = 'text-red-500 border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.6)] animate-pulse';
    strokeColor = '#ef4444';
  } else if (remainingMs <= 10000 && remainingMs > 0 && status === 'RUNNING') {
    isWarning = true;
    colorClass = 'text-amber-400 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.4)]';
    strokeColor = '#f59e0b';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Circular Timer & High-Precision Display */}
      <div className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44 group">
        {/* Outer Glow Ring */}
        <div className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${colorClass}`} />

        {/* SVG Progress Arc */}
        <svg className="w-full h-full transform -rotate-90 p-2" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeDasharray="270"
            strokeDashoffset={270 * progressRatio}
            strokeLinecap="round"
            className="transition-all duration-100 ease-linear"
          />
        </svg>

        {/* Center Digital Clock */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-black text-3xl md:text-5xl tracking-tighter ${
            isUrgent ? 'text-red-500 animate-bounce' : isWarning ? 'text-amber-400' : 'text-slate-100'
          }`}>
            {status === 'IDLE' ? '30.0' : remainingSec}
          </span>
          <span className="text-[10px] md:text-xs font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
            {status === 'COUNTDOWN' ? 'GET READY' : status === 'REVEALED' ? 'REVEALED' : 'SECONDS'}
          </span>
        </div>
      </div>

      {/* Warning State Banner */}
      {isUrgent && (
        <div className="mt-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 font-bold text-xs tracking-wider uppercase animate-pulse">
          ⚡ TIME CRITICAL!
        </div>
      )}
      {isWarning && !isUrgent && (
        <div className="mt-2 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-300 font-semibold text-xs tracking-wider uppercase">
          ⚠️ 10 SECONDS LEFT
        </div>
      )}
    </div>
  );
}
