import React from 'react';
import { Lock, Tv, Settings } from 'lucide-react';

export function Topbar({ currentRoute, onNavigate, onLock }) {
  return (
    <header className="w-full bg-[#000000] border-b border-[#1F1F1F] text-xs select-none sticky top-0 z-40 pt-2 sm:pt-0">
      <div className="max-w-4xl mx-auto px-4 h-14 sm:h-12 flex items-center justify-between">
        
        {/* Left: Clean "Admin Panel" Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin')}
            className="font-mono font-bold text-sm tracking-wider uppercase text-white hover:text-[#A1A1AA] transition-colors cursor-pointer whitespace-nowrap"
          >
            Admin Panel
          </button>
        </div>

        {/* Right: Same-Sized Icon-Only Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* 1. Question Bank Settings Button */}
          <button
            onClick={() => onNavigate(currentRoute === 'questions' ? 'admin' : 'questions')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer border ${
              currentRoute === 'questions'
                ? 'bg-white text-black border-white shadow-sm'
                : 'bg-[#111111] hover:bg-[#1A1A1A] border-[#2A2A2A] text-white'
            }`}
            title="Question Bank Settings"
          >
            <Settings className={`w-4 h-4 ${currentRoute === 'questions' ? 'text-black' : 'text-[#A1A1AA]'}`} />
          </button>

          {/* 2. Visit Player Screen Button */}
          <button
            onClick={() => onNavigate('player')}
            className="w-9 h-9 rounded-lg bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Open Player Display Screen"
          >
            <Tv className="w-4 h-4 text-[#A1A1AA]" />
          </button>

          {/* 3. Admin Lock Button */}
          {onLock && (
            <button
              onClick={onLock}
              className="w-9 h-9 rounded-lg bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Lock Admin Panel"
            >
              <Lock className="w-4 h-4 text-amber-400" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
