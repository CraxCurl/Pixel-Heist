import React from 'react';
import { ExternalLink, Lock, Tv } from 'lucide-react';

export function Topbar({ currentRoute, onNavigate, onLock }) {
  return (
    <header className="w-full bg-[#000000] border-b border-[#1F1F1F] text-xs select-none sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
        
        {/* Left: Clean "Admin Panel" Title */}
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm tracking-wider uppercase text-white">
            Admin Panel
          </span>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Visit Player Screen Button */}
          <button
            onClick={() => onNavigate('player')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-white font-medium transition-colors cursor-pointer"
            title="Open Player Display Screen"
          >
            <Tv className="w-3.5 h-3.5 text-[#A1A1AA]" />
            <span>Player Display</span>
            <ExternalLink className="w-3 h-3 text-[#71717A]" />
          </button>

          {/* Admin Lock Button */}
          {onLock && (
            <button
              onClick={onLock}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              title="Lock Admin Panel"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Lock</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
