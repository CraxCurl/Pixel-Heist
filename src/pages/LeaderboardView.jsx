import React from 'react';
import { Trophy, Medal, Flame } from 'lucide-react';

const SAMPLE_LEADERBOARD = [
  { rank: '01', name: 'Team Alpha', score: 480, time: '8.4s' },
  { rank: '02', name: 'Vinayak', score: 420, time: '11.2s' },
  { rank: '03', name: 'Team Beta', score: 360, time: '14.1s' },
  { rank: '04', name: 'Team Gamma', score: 290, time: '16.8s' },
  { rank: '05', name: 'Expo Challenger', score: 210, time: '18.3s' }
];

export function LeaderboardView() {
  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Leaderboard</h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Expo live participant standings and fastest pixel solve times.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-white">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono">Expo Round 03</span>
        </div>
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="w-full rounded border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#000000] border-b border-[#1F1F1F] text-[11px] font-mono text-[#71717A] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4 font-normal">Rank</th>
              <th className="py-2.5 px-4 font-normal">Participant / Team</th>
              <th className="py-2.5 px-4 font-normal">Fastest Solve</th>
              <th className="py-2.5 px-4 font-normal text-right">Score Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {SAMPLE_LEADERBOARD.map((item, idx) => (
              <tr
                key={idx}
                className={`hover:bg-[#111111] transition-colors ${
                  idx === 0 ? 'bg-[#111111]/60' : ''
                }`}
              >
                <td className="py-3 px-4 font-mono font-bold text-[#A1A1AA]">
                  {idx === 0 ? (
                    <span className="inline-flex items-center gap-1 text-white">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" /> {item.rank}
                    </span>
                  ) : (
                    item.rank
                  )}
                </td>
                <td className="py-3 px-4 font-medium text-white">
                  {item.name}
                </td>
                <td className="py-3 px-4 font-mono text-cyan-400">
                  {item.time}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-white">
                  {item.score} pts
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
