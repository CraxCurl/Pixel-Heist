import React, { useState, useEffect } from 'react';
import { AdminControls } from '../components/AdminControls';
import { ShieldLock, KeyRound, ArrowRight, Lock } from 'lucide-react';

const CORRECT_PIN = import.meta.env.VITE_ADMIN_PIN || '112233';

export function AdminView({ gameState }) {
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
      <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-hidden select-none font-sans">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center relative z-10 animate-fade-in">
          
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
            <ShieldLock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-1">
            ADMIN PANEL ACCESS
          </h2>
          <p className="text-slate-400 text-xs mb-6">
            Enter security PIN to access Pixel Heist controls
          </p>

          <form onSubmit={handlePinSubmit} className="w-full flex flex-col gap-4">
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
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono font-black text-2xl tracking-[0.5em] text-cyan-300 placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:outline-none focus:border-cyan-500 transition-all"
                autoFocus
                required
              />
              <KeyRound className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {errorMessage && (
              <span className="text-xs font-bold text-red-400 animate-pulse">
                {errorMessage}
              </span>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer"
            >
              <span>Unlock Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 select-none font-sans relative">
      <div className="w-full max-w-3xl flex justify-end mb-2">
        <button
          onClick={handleLockOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Lock Admin Panel"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Lock Panel</span>
        </button>
      </div>

      <AdminControls gameState={gameState} />
    </div>
  );
}
