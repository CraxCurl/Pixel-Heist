import React from 'react';
import { GameHeader } from '../components/GameHeader';
import { PixelCanvas } from '../components/PixelCanvas';
import { TimerDisplay } from '../components/TimerDisplay';
import { RevealScreen } from '../components/RevealScreen';
import { AdminControls } from '../components/AdminControls';

export function DualView({ gameState, onNavigate }) {
  const {
    currentQuestion,
    status,
    elapsedTime,
    duration,
    revealedAtTime,
    soundMuted,
    toggleSound
  } = gameState;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 font-sans relative overflow-x-hidden">
      {/* Header Bar */}
      <GameHeader
        status={status}
        soundMuted={soundMuted}
        toggleSound={toggleSound}
        currentRoute="dual"
        onNavigate={onNavigate}
      />

      {/* Split Dual Layout Container */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 my-2">
        
        {/* LEFT 5 COLS: Player View Simulator */}
        <div className="xl:col-span-5 flex flex-col bg-slate-900/40 border border-cyan-500/30 rounded-3xl p-4 md:p-6 backdrop-blur-xl relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
              🎮 PLAYER VIEW SIMULATOR
            </span>
            <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-950">
              LIVE DISPLAY
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[420px]">
            <div className="w-full h-[320px] relative">
              <PixelCanvas
                imageSrc={currentQuestion?.image}
                status={status}
                elapsedTime={elapsedTime}
                duration={duration}
              />
            </div>

            {status === 'REVEALED' || status === 'TIMEOUT' ? (
              <RevealScreen
                status={status}
                question={currentQuestion}
                revealedAtTime={revealedAtTime}
              />
            ) : (
              <TimerDisplay
                elapsedTime={elapsedTime}
                duration={duration}
                status={status}
              />
            )}
          </div>
        </div>

        {/* RIGHT 7 COLS: Admin Control Station */}
        <div className="xl:col-span-7 flex flex-col">
          <AdminControls gameState={gameState} />
        </div>

      </main>
    </div>
  );
}
