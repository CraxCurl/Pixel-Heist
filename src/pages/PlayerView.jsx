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
          <div className="flex flex-col items-center justify-center gap-3 text-center p-8 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
            <ImageOff className="w-12 h-12 text-[#71717A]" />
            <h2 className="text-xl font-mono font-bold text-white uppercase tracking-widest">PIXEL HEIST</h2>
            <p className="text-xs text-[#A1A1AA] max-w-sm">
              Waiting for organizer to upload target image...
            </p>
          </div>
        )}
      </div>

      {/* FLOATING CONTROLS (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={toggleSound}
          className="p-2 rounded bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#A1A1AA]" />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* VERCEL-MATCHING HINT POPUP OVERLAY */}
      {hasImages && showHint && currentQuestion?.hint && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 pointer-events-none animate-slide-down">
          <div className="p-3.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-left flex items-center gap-3 shadow-2xl">
            <div className="w-8 h-8 rounded bg-[#111111] border border-[#2A2A2A] flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
                HINT UNLOCKED
              </span>
              <p className="text-white font-medium text-xs sm:text-sm mt-0.5 truncate">
                "{currentQuestion.hint}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TIMER BADGE */}
      {hasImages && status !== 'REVEALED' && status !== 'TIMEOUT' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
          <div className="px-5 py-2 rounded-full bg-[#0A0A0A] border border-[#1F1F1F] shadow-2xl flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${
              status === 'RUNNING' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            <span className="font-mono font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {remainingSec}s
            </span>
          </div>
        </div>
      )}

      {/* FLOATING REVEAL ANSWER BANNER */}
      {hasImages && (status === 'REVEALED' || status === 'TIMEOUT') && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 pointer-events-none animate-fade-in">
          <div className="p-5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] shadow-2xl text-center">
            <span className="text-[11px] font-mono font-medium tracking-widest text-emerald-400 uppercase block mb-1">
              ANSWER REVEALED
            </span>
            <h2 className="text-3xl sm:text-5xl font-mono font-bold text-white tracking-wider uppercase">
              {currentQuestion?.answer}
            </h2>
            {revealedAtTime && (
              <p className="text-[#71717A] font-mono text-xs mt-1.5">
                Revealed in <span className="text-white font-semibold">{revealedAtTime}s</span>
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
