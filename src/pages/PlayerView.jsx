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
  const isWin = status === 'REVEALED' || status === 'TIMEOUT';
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
    <div className="fixed inset-0 w-screen h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden select-none font-sans">
      <ConfettiEffect active={isWin} />

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
          <div className="flex flex-col items-center justify-center gap-3 text-center p-8 rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F]">
            <ImageOff className="w-12 h-12 text-[#71717A]" />
            <h2 className="text-xl font-mono font-bold text-white uppercase tracking-widest">PIXEL HEIST</h2>
            <p className="text-xs text-[#A1A1AA] max-w-sm">
              Waiting for organizer to upload target image...
            </p>
          </div>
        )}
      </div>

      {/* FLOATING TRANSPARENT CONTROLS (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-[#0A0A0A]/80 hover:bg-[#111111] border border-[#2A2A2A] text-[#A1A1AA] hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
          title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-full bg-[#0A0A0A]/80 hover:bg-[#111111] border border-[#2A2A2A] text-[#A1A1AA] hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* LIVE HINT POPUP OVERLAY */}
      {hasImages && showHint && currentQuestion?.hint && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-none animate-slide-down">
          <div className="p-4 rounded-2xl bg-[#0A0A0A]/90 backdrop-blur-xl border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] text-center flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase block">
                💡 EXPO HINT UNLOCKED
              </span>
              <p className="text-white font-medium text-xs sm:text-sm mt-0.5">
                "{currentQuestion.hint}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TRANSPARENT TIMER BADGE (Restored Earlier Clean Glass Style) */}
      {hasImages && status !== 'REVEALED' && status !== 'TIMEOUT' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
          <div className="px-6 py-2.5 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-[#2A2A2A] shadow-2xl flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              status === 'RUNNING' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            <span className="font-mono font-bold text-3xl sm:text-4xl text-white tracking-tight">
              {remainingSec}s
            </span>
          </div>
        </div>
      )}

      {/* FLOATING TRANSPARENT REVEAL ANSWER BANNER */}
      {hasImages && (status === 'REVEALED' || status === 'TIMEOUT') && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 pointer-events-none animate-fade-in">
          <div className="p-6 rounded-3xl bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.15)] text-center">
            <span className="text-xs font-mono font-semibold tracking-widest text-emerald-400 uppercase block mb-1">
              ANSWER REVEALED
            </span>
            <h2 className="text-4xl sm:text-6xl font-mono font-bold text-white tracking-wider uppercase">
              {currentQuestion?.answer}
            </h2>
            {revealedAtTime && (
              <p className="text-[#A1A1AA] font-mono text-xs mt-2">
                Revealed in <span className="text-white font-semibold">{revealedAtTime}s</span>
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
