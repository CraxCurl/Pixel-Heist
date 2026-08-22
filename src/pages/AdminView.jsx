import React, { useState, useEffect } from 'react';
import { AdminControls } from '../components/AdminControls';
import { QuestionsView } from './QuestionsView';
import { Topbar } from '../components/Topbar';
import { Shield, KeyRound, ArrowRight } from 'lucide-react';

const CORRECT_PIN = import.meta.env.VITE_ADMIN_PIN || '112233';

export function AdminView({ gameState, currentRoute, onNavigate }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('pixel_heist_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === CORRECT_PIN) {
      sessionStorage.setItem('pixel_heist_admin_auth', 'true');
      setIsAuthenticated(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  const handleLockOut = () => {
    sessionStorage.removeItem('pixel_heist_admin_auth');
    setIsAuthenticated(false);
    setPinInput('');
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-[#000000] text-white flex items-center justify-center p-4 select-none font-sans">
        
        <div className="w-full max-w-sm p-6 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] shadow-2xl flex flex-col items-center text-center relative z-10 animate-fade-in">
          
          <div className="w-10 h-10 rounded bg-[#111111] border border-[#2A2A2A] flex items-center justify-center mb-3 text-white">
            <Shield className="w-5 h-5 text-[#A1A1AA]" />
          </div>

          <h2 className="text-base font-bold text-white tracking-tight uppercase mb-1">
            Pixel Heist Admin
          </h2>
          <p className="text-xs text-[#A1A1AA] mb-5">
            Enter security PIN to unlock control panel
          </p>

          <form onSubmit={handlePinSubmit} className="w-full flex flex-col gap-3">
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                placeholder="Enter Security PIN"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full px-4 py-2.5 rounded bg-[#000000] border border-[#1F1F1F] text-center font-mono font-bold text-xl tracking-[0.4em] text-white placeholder:text-[#71717A] placeholder:tracking-normal placeholder:font-sans placeholder:text-xs focus:outline-none focus:border-[#2A2A2A] transition-colors"
                autoFocus
                required
              />
              <KeyRound className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {errorMessage && (
              <span className="text-xs font-semibold text-red-400">
                {errorMessage}
              </span>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wide uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Authenticate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col select-none font-sans">
      <Topbar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        onLock={handleLockOut}
        isConnected={gameState.isConnected}
      />

      <main className="flex-1 min-h-[calc(100vh-48px)] flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-4xl mx-auto overflow-y-auto">
        {currentRoute === 'questions' ? (
          <QuestionsView gameState={gameState} />
        ) : (
          <div className="w-full my-auto py-6 flex items-center justify-center">
            <AdminControls gameState={gameState} />
          </div>
        )}
      </main>
    </div>
  );
}
