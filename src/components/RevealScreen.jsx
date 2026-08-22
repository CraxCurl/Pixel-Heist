import React from 'react';
import { ConfettiEffect } from './ConfettiEffect';
import { Trophy, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export function RevealScreen({ status, question, revealedAtTime }) {
  if (status !== 'REVEALED' && status !== 'TIMEOUT') {
    return null;
  }

  const isWin = status === 'REVEALED';

  return (
    <div className="w-full flex flex-col items-center justify-center animate-fade-in-up mt-6">
      <ConfettiEffect active={isWin} />

      {/* Main Reveal Card */}
      <div className={`relative max-w-2xl w-full p-6 md:p-8 rounded-3xl border backdrop-blur-xl shadow-2xl text-center transition-all duration-500 ${
        isWin
          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]'
          : 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)]'
      }`}>
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 mb-4 shadow-inner">
          {isWin ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-extrabold tracking-widest text-sm uppercase">ANSWER REVEALED!</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span className="text-rose-400 font-extrabold tracking-widest text-sm uppercase">TIME EXPIRED</span>
            </>
          )}
        </div>

        {/* Big Bold Answer Display */}
        <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-wider uppercase drop-shadow-md my-2">
          {question?.answer || 'UNKNOWN'}
        </h2>

        {/* Hint / Details */}
        {question?.hint && (
          <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto font-medium mt-2 leading-relaxed opacity-90">
            "{question.hint}"
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/10 text-xs md:text-sm font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Category: <strong className="text-white">{question?.category}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Time Taken: <strong className="text-cyan-300">{revealedAtTime || '30.00'}s</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
