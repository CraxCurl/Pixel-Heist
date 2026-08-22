import React from 'react';
import {
  ExternalLink,
  ChevronDown,
  Lock,
  Tv,
  Layers,
  FileText
} from 'lucide-react';

export function Topbar({ currentRoute, onNavigate, onLock, isConnected }) {
  return (
    <header className="w-full bg-[#000000] border-b border-[#1F1F1F] text-xs select-none sticky top-0 z-40">
      
      {/* TOP HEADER ROW */}
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
        
        {/* Left: Project Selector & Breadcrumb */}
        <div className="flex items-center gap-3">
          
          {/* Project selector dropdown */}
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#111111] text-white font-medium transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center font-mono font-bold text-[10px] text-white">
              P
            </div>
            <span>pixel-heist</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
          </button>

          <span className="text-[#2A2A2A] font-light">/</span>

          {/* Breadcrumb current page */}
          <div className="flex items-center gap-2 text-[#A1A1AA] font-mono text-[11px]">
            <span>
              {currentRoute === 'admin' && 'Control Panel'}
              {currentRoute === 'questions' && 'Question Bank'}
              {currentRoute === 'player' && 'Player Screen'}
            </span>
          </div>

        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-2.5">
          
          {/* Real-time Connection Status Badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0A0A0A] border border-[#1F1F1F] text-[11px] text-[#A1A1AA]">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="font-mono">{isConnected ? 'Live Sync' : 'Connecting...'}</span>
          </div>

          {/* Visit Player Screen Button */}
          <button
            onClick={() => onNavigate('player')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-white font-medium transition-colors cursor-pointer"
            title="Open Player View Screen"
          >
            <Tv className="w-3.5 h-3.5 text-[#A1A1AA]" />
            <span>Player Display</span>
            <ExternalLink className="w-3 h-3 text-[#71717A]" />
          </button>

          {/* Admin Lock Button */}
          {currentRoute !== 'player' && onLock && (
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

      {/* SECONDARY TAB BAR (Sub-navigation) */}
      {currentRoute !== 'player' && (
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 text-[#71717A] font-medium border-t border-[#1F1F1F]/50">
          <button
            onClick={() => onNavigate('admin')}
            className={`py-2.5 text-xs flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              currentRoute === 'admin'
                ? 'border-white text-white font-semibold'
                : 'border-transparent hover:text-[#A1A1AA]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Game Control</span>
          </button>

          <button
            onClick={() => onNavigate('questions')}
            className={`py-2.5 text-xs flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              currentRoute === 'questions'
                ? 'border-white text-white font-semibold'
                : 'border-transparent hover:text-[#A1A1AA]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Question Bank</span>
          </button>
        </div>
      )}

    </header>
  );
}
