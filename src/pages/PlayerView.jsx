import React from 'react';
import { PixelCanvas } from '../components/PixelCanvas';
import { Maximize, Volume2, VolumeX, Lightbulb, ImageOff, Radio, CheckCircle2 } from 'lucide-react';

export function PlayerView({ gameState, onNavigate }) {
  const {
    questions,
    currentIndex,
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
  const remainingSec = (remainingMs / 1000).toFixed(2);
  const isWin = status === 'REVEALED' || status === 'TIMEOUT';
  const hasImages = questions.length > 0;
  const progressPct = Math.min(100, Math.max(0, (elapsedTime / duration) * 100));

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
    <div className="fixed inset-0 w-screen h-screen bg-[#000000] text-white flex flex-col items-center justify-between select-none font-sans overflow-hidden">
      
      {/* COMPACT TOP NAVIGATION BAR */}
      <header className="w-full bg-[#000000] border-b border-[#1F1F1F] px-4 py-2.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-white text-black font-mono font-bold text-xs flex items-center justify-center">
              P
            </span>
            <span className="font-bold text-xs tracking-wider uppercase text-white">PIXEL HEIST</span>
          </div>

          <span className="text-[#2A2A2A]">/</span>

          <span className="px-2 py-0.5 rounded bg-[#0A0A0A] border border-[#1F1F1F] text-[10px] font-mono text-[#A1A1AA]">
            ROUND {String(currentIndex + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Navigation Button */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('admin')}
              className="px-2.5 py-1 rounded bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] text-[11px] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              Admin Dashboard
            </button>
          )}

          <button
            onClick={toggleSound}
            className="p-1.5 rounded bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-[#0A0A0A] hover:bg-[#111111] border border-[#1F1F1F] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            title="Fullscreen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* CENTERED GAME CANVAS AREA */}
      <main className="w-full flex-1 relative flex flex-col items-center justify-center p-4">
        
        {/* LIVE HINT BANNER */}
        {hasImages && showHint && currentQuestion?.hint && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-none animate-slide-down">
            <div className="p-3 rounded bg-[#0A0A0A] border border-amber-500/40 shadow-xl text-center flex items-center justify-center gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-white font-medium">
                Hint: "{currentQuestion.hint}"
              </span>
            </div>
          </div>
        )}

        {/* DOMINANT PIXELATED IMAGE CANVAS */}
        <div className="w-full h-full max-w-4xl max-h-[70vh] relative flex items-center justify-center">
          {hasImages ? (
            <PixelCanvas
              imageSrc={currentQuestion?.image}
              status={status}
              elapsedTime={elapsedTime}
              duration={duration}
              isBordered={true}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-8 rounded bg-[#0A0A0A] border border-[#1F1F1F] text-center">
              <ImageOff className="w-10 h-10 text-[#71717A]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">PIXEL HEIST EXPO</h3>
              <p className="text-xs text-[#A1A1AA] max-w-xs">
                Waiting for organizer to upload target image...
              </p>
            </div>
          )}
        </div>

      </main>

      {/* BOTTOM FOOTER: TIMER & REVEAL STATUS BANNER */}
      <footer className="w-full bg-[#000000] border-t border-[#1F1F1F] p-4 flex flex-col items-center gap-2 z-30">
        
        {/* Thin 1px Linear Progress Bar */}
        {hasImages && (
          <div className="w-full max-w-2xl h-1 bg-[#111111] rounded-full overflow-hidden border border-[#1F1F1F]">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Status & Numerical Timer */}
        {hasImages && !isWin && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#71717A] uppercase tracking-wider">TIME REMAINING</span>
            <span className="text-2xl font-bold text-white font-mono tracking-tight">
              {remainingSec}s
            </span>
          </div>
        )}

        {/* Answer Revealed Banner */}
        {hasImages && isWin && (
          <div className="flex flex-col items-center text-center animate-fade-in">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-0.5">
              ANSWER REVEALED
            </span>
            <h2 className="text-3xl sm:text-5xl font-mono font-bold text-white uppercase tracking-wider">
              {currentQuestion?.answer}
            </h2>
            {revealedAtTime && (
              <span className="text-[11px] font-mono text-[#71717A] mt-1">
                Solved in {revealedAtTime}s
              </span>
            )}
          </div>
        )}

      </footer>

    </div>
  );
}
