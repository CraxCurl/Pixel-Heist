import React from 'react';
import { Maximize, Volume2, VolumeX, Shield, Monitor } from 'lucide-react';

export function GameHeader({
  status,
  soundMuted,
  toggleSound,
  currentRoute,
  onNavigate,
  showNavigation = true
}) {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:px-8 mb-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md shadow-xl">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-cyan-400 text-lg">
            PX
          </div>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 uppercase">
            PIXEL HEIST
          </h1>
          <p className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-wider">
            IMAGE IDENTIFICATION SHOWDOWN
          </p>
        </div>
      </div>

      {/* Live Status Pill */}
      <div className="flex items-center gap-3">
        <span className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-black uppercase tracking-widest border transition-all ${
          status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
          status === 'PAUSED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
          status === 'REVEALED' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' :
          status === 'TIMEOUT' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
          'bg-slate-950 text-slate-400 border-slate-800'
        }`}>
          ● {status === 'RUNNING' ? 'REVEALING LIVE' : status}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {showNavigation && (
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => onNavigate('player')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentRoute === 'player' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Player</span>
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentRoute === 'admin' ? 'bg-purple-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        )}

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleSound}
          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Fullscreen Trigger */}
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 font-bold text-xs tracking-wider transition-all"
          title="Enter Fullscreen Game Mode"
        >
          <Maximize className="w-4 h-4" />
          <span className="hidden sm:inline">FULLSCREEN</span>
        </button>
      </div>
    </header>
  );
}
