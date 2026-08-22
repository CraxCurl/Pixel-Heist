import React from 'react';
import { ExternalLink, Lock, Tv, Settings } from 'lucide-react';

export function Topbar({ currentRoute, onNavigate, onLock }) {
  return (
    <header className="w-full bg-[#000000] border-b border-[#1F1F1F] text-xs select-none sticky top-0 z-40 pt-2 sm:pt-0">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-12 flex items-center justify-between gap-2 overflow-x-auto">
        
        {/* Left: Clean "Admin Panel" Title (Never wraps) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('admin')}
            className="font-mono font-bold text-xs sm:text-sm tracking-wider uppercase text-white hover:text-[#A1A1AA] transition-colors cursor-pointer whitespace-nowrap"
          >
            Admin Panel
          </button>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Question Bank Settings Button */}
          <button
            onClick={() => onNavigate(currentRoute === 'questions' ? 'admin' : 'questions')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded transition-colors cursor-pointer border whitespace-nowrap ${
              currentRoute === 'questions'
                ? 'bg-white text-black font-semibold border-white'
                : 'bg-[#111111] hover:bg-[#1A1A1A] border-[#2A2A2A] text-white'
            }`}
            title="Manage Question Bank & Add Images"
          >
            <Settings className={`w-3.5 h-3.5 ${currentRoute === 'questions' ? 'text-black' : 'text-[#A1A1AA]'}`} />
            <span className="hidden xs:inline sm:inline">Question Bank</span>
            <span className="xs:hidden sm:hidden">Bank</span>
          </button>

          {/* Visit Player Screen Button */}
          <button
            onClick={() => onNavigate('player')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-white font-medium transition-colors cursor-pointer whitespace-nowrap"
            title="Open Player Display Screen"
          >
            <Tv className="w-3.5 h-3.5 text-[#A1A1AA]" />
            <span className="hidden xs:inline sm:inline">Player Display</span>
            <span className="xs:hidden sm:hidden">Display</span>
            <ExternalLink className="w-3 h-3 text-[#71717A] hidden sm:inline" />
          </button>

          {/* Admin Lock Button */}
          {onLock && (
            <button
              onClick={onLock}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              title="Lock Admin Panel"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
