import React from 'react';
import {
  Play,
  Trophy,
  Database,
  Wifi,
  Lightbulb
} from 'lucide-react';

export function AdminControls({ gameState }) {
  const {
    questions,
    currentQuestion,
    status,
    showHint,
    isConnected,
    startNewRound,
    revealAnswer,
    toggleHint
  } = gameState;

  const hasImages = questions.length > 0;
  // Show START NEXT ROUND button ONLY after admin has officially pressed REVEAL ANSWER
  const isRevealed = status === 'REVEALED';

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 p-4 sm:p-6 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl shadow-2xl relative select-none font-sans text-xs animate-fade-in">
      
      {/* 1. MONGODB ATLAS SYNC STATUS BADGE (Green Wifi Icon Only) */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#000000] border border-[#1F1F1F]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-white/80" />
          <span className="font-semibold text-[#A1A1AA] text-xs">MongoDB Atlas Sync</span>
        </div>

        <div className="flex items-center">
          <Wifi
            className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}
            title={isConnected ? 'Live Connected to MongoDB Atlas' : 'Connecting...'}
          />
        </div>
      </div>

      {/* 2. CONFIDENTIAL TARGET ANSWER NAME CARD */}
      <div className="p-6 rounded-lg bg-[#000000] border border-[#1F1F1F] text-center relative flex flex-col items-center justify-center min-h-[140px]">
        <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest block mb-1">
          CURRENT TARGET IMAGE NAME
        </span>
        
        <div className="text-2xl sm:text-4xl font-mono font-bold text-white tracking-wider uppercase py-1 max-w-full break-words">
          {currentQuestion?.answer || (hasImages ? 'SELECT AN IMAGE' : 'NO IMAGES IN DATABASE')}
        </div>

        {currentQuestion?.hint && (
          <p className="text-xs text-[#A1A1AA] italic mt-1 font-serif">
            Hint: "{currentQuestion.hint}"
          </p>
        )}

        {/* SHOW/HIDE HINT POPUP BUTTON */}
        {hasImages && currentQuestion?.hint && (
          <button
            onClick={toggleHint}
            className={`mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded font-mono text-xs transition-colors cursor-pointer border ${
              showHint
                ? 'bg-white text-black font-semibold border-white shadow-sm'
                : 'bg-[#111111] border-[#2A2A2A] text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <Lightbulb className={`w-3.5 h-3.5 ${showHint ? 'text-black' : 'text-[#A1A1AA]'}`} />
            <span>{showHint ? 'HIDE HINT POPUP' : 'SHOW HINT POPUP'}</span>
          </button>
        )}
      </div>

      {/* 3. SINGLE DYNAMIC ACTION BUTTON */}
      <div className="flex flex-col gap-3">
        {isRevealed ? (
          /* Show START NEXT ROUND ONLY after admin has pressed REVEAL ANSWER */
          <button
            onClick={startNewRound}
            disabled={!hasImages}
            className={`w-full min-h-[60px] py-4 px-6 rounded-lg font-mono font-bold text-lg sm:text-xl tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all shadow-xl ${
              hasImages
                ? 'bg-white hover:bg-neutral-200 text-black active:scale-[0.99] cursor-pointer'
                : 'bg-[#111111] text-[#71717A] border border-[#1F1F1F] cursor-not-allowed'
            }`}
          >
            <Play className="w-6 h-6 fill-current text-black" />
            <span>START NEXT ROUND</span>
          </button>
        ) : (
          /* Show REVEAL ANSWER at 0s timeout and during round until admin clicks it */
          <button
            onClick={revealAnswer}
            disabled={!hasImages}
            className="w-full min-h-[60px] py-4 px-6 rounded-lg font-mono font-bold text-lg sm:text-xl tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all bg-white hover:bg-neutral-200 text-black active:scale-[0.99] cursor-pointer shadow-xl"
          >
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>REVEAL ANSWER ({currentQuestion?.answer || '---'})</span>
          </button>
        )}
      </div>

    </div>
  );
}
