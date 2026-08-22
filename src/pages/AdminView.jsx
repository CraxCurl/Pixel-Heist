import React from 'react';
import { AdminControls } from '../components/AdminControls';

export function AdminView({ gameState }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8 font-sans relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Admin Dashboard without top GameHeader */}
      <main className="flex-1 max-w-4xl w-full mx-auto my-auto z-10">
        <AdminControls gameState={gameState} />
      </main>
    </div>
  );
}
