import React, { useState } from 'react';
import {
  Play,
  Trophy,
  Plus,
  Trash2,
  Upload,
  Shuffle,
  Database,
  Wifi,
  Lightbulb,
  X,
  ImagePlus,
  Radio,
  Clock,
  CheckCircle2
} from 'lucide-react';

export function AdminControls({ gameState }) {
  const {
    questions,
    currentIndex,
    currentQuestion,
    status,
    elapsedTime,
    duration,
    revealedAtTime,
    usedCount,
    totalCount,
    showHint,
    isConnected,
    startNewRound,
    revealAnswer,
    toggleHint,
    selectQuestion,
    addCustomQuestion,
    deleteQuestion
  } = gameState;

  const [showUploader, setShowUploader] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleCustomUpload = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim() || !newImageUrl.trim()) return;

    setIsUploading(true);
    await addCustomQuestion({
      title: newAnswer,
      answer: newAnswer.toUpperCase(),
      category: 'General',
      hint: newHint || '',
      image: newImageUrl
    });

    setIsUploading(false);
    setNewAnswer('');
    setNewHint('');
    setNewImageUrl('');
    setShowUploader(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const hasImages = questions.length > 0;
  const isRunning = status === 'RUNNING';
  const isRevealed = status === 'REVEALED' || status === 'TIMEOUT';
  const remainingSec = Math.max(0, (duration - elapsedTime) / 1000).toFixed(2);
  const elapsedSec = (elapsedTime / 1000).toFixed(2);
  const progressPct = Math.min(100, Math.max(0, (elapsedTime / duration) * 100));

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in text-xs">
      
      {/* SECTION HEADER & METADATA BAR (Deployment Details Style) */}
      <div className="flex flex-col gap-4 pb-4 border-b border-[#1F1F1F]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Game Control</h1>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Live orchestration dashboard for Pixel Heist Expo execution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNewRound}
              disabled={!hasImages}
              className={`px-3.5 py-1.5 rounded font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                hasImages
                  ? 'bg-white hover:bg-neutral-200 text-black cursor-pointer shadow-sm'
                  : 'bg-[#111111] text-[#71717A] border border-[#1F1F1F] cursor-not-allowed'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Restart Round' : 'Start New Round'}</span>
            </button>
          </div>
        </div>

        {/* Deployment Details Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F] text-xs">
          <div>
            <span className="text-[#71717A] text-[11px] block font-mono">STATUS</span>
            <div className="flex items-center gap-1.5 mt-0.5 font-medium">
              <span className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-emerald-500 animate-pulse' : isRevealed ? 'bg-cyan-400' : 'bg-amber-400'
              }`} />
              <span className="text-white">
                {isRunning ? 'Round Active' : isRevealed ? 'Revealed' : 'Ready'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[#71717A] text-[11px] block font-mono">ELAPSED TIME</span>
            <span className="font-mono text-white mt-0.5 block font-semibold">
              {elapsedSec} / 20.00s
            </span>
          </div>

          <div>
            <span className="text-[#71717A] text-[11px] block font-mono">QUESTION DECK</span>
            <span className="font-mono text-white mt-0.5 block">
              {usedCount} of {totalCount} played
            </span>
          </div>

          <div>
            <span className="text-[#71717A] text-[11px] block font-mono">DATABASE SYNC</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[#A1A1AA]">MongoDB Atlas</span>
            </div>
          </div>
        </div>
      </div>

      {/* LARGE CENTRAL GAME CONTROL PANEL (Vercel Section Style) */}
      <div className="rounded border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between bg-[#000000]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-white">Current Question</span>
            <span className="px-2 py-0.5 rounded bg-[#111111] border border-[#2A2A2A] text-[10px] font-mono text-[#A1A1AA]">
              ROUND {String(currentIndex + 1).padStart(2, '0')}
            </span>
          </div>

          {currentQuestion?.hint && (
            <button
              onClick={toggleHint}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer border ${
                showHint
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-[#111111] border-[#2A2A2A] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>
          )}
        </div>

        {/* Confidential Target Answer Section */}
        <div className="p-6 border-b border-[#1F1F1F] bg-[#0A0A0A]">
          <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider block mb-1">
            Confidential Answer Name
          </span>
          <div className="text-3xl sm:text-5xl font-mono font-bold text-white tracking-wider uppercase">
            {currentQuestion?.answer || (hasImages ? 'SELECT AN IMAGE' : 'NO IMAGES IN DATABASE')}
          </div>

          {currentQuestion?.hint && (
            <p className="text-xs text-[#A1A1AA] mt-2 italic">
              Hint: "{currentQuestion.hint}"
            </p>
          )}
        </div>

        {/* Live Progress Bar & Numerical Status */}
        <div className="p-4 border-b border-[#1F1F1F] bg-[#000000] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#A1A1AA]">
            <span>Reveal Progress</span>
            <span className="text-white font-semibold">{remainingSec}s Remaining</span>
          </div>

          {/* Thin 1px Linear Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-[#111111] border border-[#1F1F1F] overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Primary & Secondary Action Control Buttons */}
        <div className="p-4 bg-[#0A0A0A] flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            {/* Primary Action Button: REVEAL ANSWER */}
            <button
              onClick={revealAnswer}
              disabled={!hasImages || isRevealed}
              className={`px-5 py-2 rounded font-semibold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 ${
                hasImages && !isRevealed
                  ? 'bg-white hover:bg-neutral-200 text-black cursor-pointer shadow-md'
                  : 'bg-[#111111] text-[#71717A] border border-[#1F1F1F] cursor-not-allowed'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Reveal Answer</span>
            </button>

            {/* Secondary Action Button: START NEW ROUND */}
            <button
              onClick={startNewRound}
              disabled={!hasImages}
              className={`px-4 py-2 rounded font-medium text-xs transition-colors flex items-center gap-1.5 border ${
                hasImages
                  ? 'bg-[#111111] border-[#2A2A2A] text-white hover:bg-[#1A1A1A] cursor-pointer'
                  : 'bg-[#111111] border-[#1F1F1F] text-[#71717A] cursor-not-allowed'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span>Next Image</span>
            </button>
          </div>

          <button
            onClick={() => setShowUploader(true)}
            className="px-3.5 py-2 rounded bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-white font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>

        </div>

      </div>

      {/* QUESTION BANK SELECTOR GRID */}
      <div className="rounded border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
        <div className="p-3 border-b border-[#1F1F1F] bg-[#000000] flex items-center justify-between">
          <span className="text-xs font-mono text-[#A1A1AA]">
            MongoDB Question Bank ({questions.length})
          </span>
          <span className="text-[11px] font-mono text-[#71717A]">
            Played: {usedCount} / {totalCount}
          </span>
        </div>

        {!hasImages ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <ImagePlus className="w-8 h-8 text-[#71717A]" />
            <span className="text-xs font-medium text-white">No Images in Database</span>
            <p className="text-[11px] text-[#A1A1AA]">
              Click <strong className="text-white">+ Add Question</strong> above to upload custom target images!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 max-h-60 overflow-y-auto">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className={`relative group rounded p-2 border transition-colors ${
                  currentIndex === idx
                    ? 'bg-[#1A1A1A] border-white'
                    : 'bg-[#000000] border-[#1F1F1F] hover:border-[#2A2A2A]'
                }`}
              >
                <button
                  onClick={() => selectQuestion(idx)}
                  className="w-full flex flex-col items-center text-left cursor-pointer"
                >
                  <div className="w-full h-16 rounded bg-[#0A0A0A] overflow-hidden border border-[#1F1F1F]">
                    <img src={q.image} alt={q.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-white truncate w-full text-center mt-1.5">
                    {q.answer}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteQuestion(idx);
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity cursor-pointer shadow"
                  title="Delete Question"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-5 rounded bg-[#0A0A0A] border border-[#1F1F1F] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F1F1F]">
              <h3 className="text-sm font-semibold text-white">Add New Question</h3>
              <button onClick={() => setShowUploader(false)} className="p-1 rounded text-[#71717A] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomUpload} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1">Target Answer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. SPIDER-MAN"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#000000] border border-[#1F1F1F] text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#2A2A2A]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1">Hint for Participants</label>
                <input
                  type="text"
                  placeholder="e.g. Friendly neighborhood web slinger"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#000000] border border-[#1F1F1F] text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#2A2A2A]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1">Image File or URL *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste Image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-[#000000] border border-[#1F1F1F] text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#2A2A2A]"
                  />
                  <label className="px-3 py-2 rounded bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-white cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1F1F1F] mt-2">
                <button
                  type="button"
                  onClick={() => setShowUploader(false)}
                  className="px-3 py-1.5 rounded text-xs text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs"
                >
                  {isUploading ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
