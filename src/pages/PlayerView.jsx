import React from 'react';
import { PixelCanvas } from '../components/PixelCanvas';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { Maximize, Volume2, VolumeX, Lightbulb, ImageOff } from 'lucide-react';

export function PlayerView({ gameState }) {
  const {
    questions,
    currentQuestion,
    status,
    elapsedTime,
    duration,
    revealedAtTime,
    showHint,
    soundMuted,
    toggleSound
  } = gameState;

  const remainingMs = Math.max(0, duration - elapsedTime);
  const remainingSec = (remainingMs / 1000).toFixed(1);
  const isWin = status === 'REVEALED';
  const hasImages = questions.length > 0;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden select-none font-sans">
      <ConfettiEffect active={isWin} />

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* FULLSCREEN PIXELATED IMAGE CANVAS */}
      <div className="w-full h-full relative flex items-center justify-center">
        {hasImages ? (
          <PixelCanvas
            imageSrc={currentQuestion?.image}
            status={status}
            elapsedTime={elapsedTime}
            duration={duration}
            isBordered={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-center p-6 bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-md">
            <ImageOff className="w-16 h-16 text-cyan-400/50 animate-pulse" />
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">PIXEL HEIST</h2>
            <p className="text-slate-400 text-sm max-w-md">
              Waiting for Admin to upload image questions on <code className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded">/admin</code>...
            </p>
          </div>
        )}
      </div>

      {/* FLOATING TRANSPARENT CONTROLS */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-transparent">
        <button
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-slate-950/40 hover:bg-slate-900/70 border border-white/10 text-slate-300 hover:text-white backdrop-blur-md transition-all"
          title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-full bg-slate-950/40 hover:bg-slate-900/70 border border-white/10 text-slate-300 hover:text-white backdrop-blur-md transition-all"
          title="Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* LIVE HINT POPUP OVERLAY */}
      {hasImages && showHint && currentQuestion?.hint && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-none animate-fade-in-up">
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/80 backdrop-blur-xl border border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.4)] text-center flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Lightbulb className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block">
                💡 EXPO HINT UNLOCKED
              </span>
              <p className="text-white font-bold text-sm sm:text-base leading-tight mt-0.5">
                "{currentQuestion.hint}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TRANSPARENT TIMER */}
      {hasImages && status !== 'REVEALED' && status !== 'TIMEOUT' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
          <div className="px-6 py-2.5 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              status === 'RUNNING' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            <span className="font-mono font-black text-3xl sm:text-4xl text-white tracking-tight">
              {remainingSec}s
            </span>
          </div>
        </div>
      )}

      {/* FLOATING TRANSPARENT REVEAL ANSWER BANNER */}
      {hasImages && (status === 'REVEALED' || status === 'TIMEOUT') && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 pointer-events-none animate-fade-in-up">
          <div className="p-6 rounded-3xl bg-slate-950/60 backdrop-blur-xl border border-white/15 shadow-[0_0_50px_rgba(0,240,255,0.2)] text-center">
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase block mb-1">
              ANSWER REVEALED
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-200 tracking-wider uppercase drop-shadow-lg">
              {currentQuestion?.answer}
            </h2>
            {revealedAtTime && (
              <p className="text-slate-400 text-xs font-semibold mt-2">
                Revealed in <span className="text-cyan-400">{revealedAtTime}s</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
