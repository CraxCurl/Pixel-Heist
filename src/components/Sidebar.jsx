import React from 'react';
import {
  Layers,
  FileText,
  Search,
  ChevronDown,
  LayoutDashboard,
  Shield,
  Radio,
  Tv
} from 'lucide-react';

export function Sidebar({ currentRoute, onNavigate, isConnected }) {
  return (
    <aside className="w-56 shrink-0 bg-[#000000] border-r border-[#1F1F1F] flex flex-col select-none min-h-[calc(100vh-48px)]">
      
      {/* WORKSPACE HEADER */}
      <div className="p-3 border-b border-[#1F1F1F]">
        <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#111111] text-xs text-white transition-colors cursor-pointer">
          <div className="flex items-center gap-2 truncate">
            <span className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-mono text-[9px] text-cyan-400">
              P
            </span>
            <span className="truncate font-medium">craxcurl's expo</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.2 rounded bg-[#1F1F1F] text-[10px] text-[#A1A1AA] font-mono">
              Hobby
            </span>
            <ChevronDown className="w-3 h-3 text-[#71717A]" />
          </div>
        </button>
      </div>

      {/* QUICK SEARCH BAR */}
      <div className="p-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Find"
            readOnly
            className="w-full pl-8 pr-7 py-1 rounded bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-[#A1A1AA] placeholder:text-[#71717A] focus:outline-none pointer-events-none"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1 rounded bg-[#1F1F1F] text-[#71717A]">
            F
          </kbd>
        </div>
      </div>

      {/* MAIN NAVIGATION LIST */}
      <nav className="px-2 py-1 flex flex-col gap-0.5 flex-1 text-xs">
        
        <button
          onClick={() => onNavigate('admin')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded transition-colors text-left cursor-pointer ${
            currentRoute === 'admin'
              ? 'bg-[#1A1A1A] text-white font-medium'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-[#A1A1AA]" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => onNavigate('admin')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors text-left cursor-pointer ${
            currentRoute === 'admin'
              ? 'bg-[#1A1A1A] text-white font-medium'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#A1A1AA]" />
            <span>Game Control</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

        <button
          onClick={() => onNavigate('questions')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded transition-colors text-left cursor-pointer ${
            currentRoute === 'questions'
              ? 'bg-[#1A1A1A] text-white font-medium'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#A1A1AA]" />
          <span>Question Bank</span>
        </button>

        <div className="my-2 border-t border-[#1F1F1F]/60" />

        <button
          onClick={() => onNavigate('player')}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A] transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Tv className="w-4 h-4 text-[#71717A]" />
            <span>Player Display</span>
          </div>
          <Radio className="w-3 h-3 text-cyan-400" />
        </button>

      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-[#1F1F1F] text-[11px] text-[#71717A] flex items-center justify-between">
        <span>Pixel Heist v2.0</span>
        <Shield className="w-3.5 h-3.5 text-[#71717A]" />
      </div>

    </aside>
  );
}
