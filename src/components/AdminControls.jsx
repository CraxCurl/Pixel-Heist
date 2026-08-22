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
  ImagePlus
} from 'lucide-react';

export function AdminControls({ gameState }) {
  const {
    questions,
    currentIndex,
    currentQuestion,
    status,
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

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-6 bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl shadow-2xl relative select-none font-sans text-xs">
      
      {/* MONGODB SYNC STATUS BADGE WITH GREEN WIFI ICON */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-[#A1A1AA]">MongoDB Atlas Sync</span>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
          <span className={`font-bold font-mono text-xs ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isConnected ? 'LIVE CONNECTED' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      {/* CONFIDENTIAL TARGET ANSWER NAME CARD */}
      <div className="p-6 rounded-xl bg-[#000000] border border-[#1F1F1F] text-center relative">
        <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest block mb-1">
          CURRENT TARGET IMAGE NAME
        </span>
        
        <div className="text-3xl sm:text-5xl font-mono font-bold text-white tracking-wider uppercase py-2">
          {currentQuestion?.answer || (hasImages ? 'SELECT AN IMAGE' : 'NO IMAGES IN DATABASE')}
        </div>

        {currentQuestion?.hint && (
          <p className="text-xs text-[#A1A1AA] italic mt-1">
            Hint: "{currentQuestion.hint}"
          </p>
        )}

        {/* SHOW HINT POPUP BUTTON */}
        {hasImages && currentQuestion?.hint && (
          <button
            onClick={toggleHint}
            className={`mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
              showHint
                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                : 'bg-[#111111] border-[#2A2A2A] text-amber-300 hover:bg-[#1A1A1A]'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>{showHint ? 'HIDE HINT POPUP' : 'SHOW HINT POPUP ON SCREEN'}</span>
          </button>
        )}
      </div>

      {/* BIG MAIN ACTION BUTTONS */}
      <div className="flex flex-col gap-3.5">
        
        {/* 1. BIG START NEW ROUND / NEXT IMAGE BUTTON */}
        <button
          onClick={startNewRound}
          disabled={!hasImages}
          className={`w-full py-5 px-6 rounded-xl font-mono font-bold text-xl sm:text-2xl tracking-wider uppercase flex items-center justify-center gap-3 transition-all transform shadow-lg ${
            hasImages
              ? 'bg-white hover:bg-neutral-200 text-black active:scale-[0.99] cursor-pointer'
              : 'bg-[#111111] text-[#71717A] border border-[#1F1F1F] cursor-not-allowed'
          }`}
        >
          <Play className="w-6 h-6 fill-current" />
          <span>{isRunning ? 'RESTART ROUND' : 'START NEW ROUND'}</span>
        </button>

        {/* 2. BIG REVEAL ANSWER BUTTON */}
        <button
          onClick={revealAnswer}
          disabled={!hasImages || isRevealed}
          className={`w-full py-5 px-6 rounded-xl font-mono font-bold text-xl sm:text-2xl tracking-wider uppercase flex items-center justify-center gap-3 transition-all transform shadow-lg ${
            hasImages && !isRevealed
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-[0_0_30px_rgba(147,51,234,0.4)] active:scale-[0.99] cursor-pointer'
              : 'bg-[#111111] text-[#71717A] border border-[#1F1F1F] cursor-not-allowed'
          }`}
        >
          <Trophy className="w-6 h-6 text-amber-300" />
          <span>REVEAL ANSWER ({currentQuestion?.answer || '---'})</span>
        </button>

      </div>

      {/* QUESTION BANK SELECTOR GRID */}
      <div className="p-4 rounded-xl bg-[#000000] border border-[#1F1F1F] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
            <span>MongoDB Images ({questions.length})</span>
            {hasImages && (
              <span className="flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                <Shuffle className="w-3 h-3" /> Played: {usedCount}/{totalCount}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Image</span>
          </button>
        </div>

        {!hasImages ? (
          <div className="py-6 px-4 rounded border border-dashed border-[#1F1F1F] flex flex-col items-center justify-center text-center gap-2">
            <ImagePlus className="w-8 h-8 text-[#71717A]" />
            <span className="text-white font-medium text-xs">No Images in Database</span>
            <p className="text-[#71717A] text-[11px]">
              Click <strong className="text-white">+ Add Image</strong> to upload your custom image questions!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className={`relative group rounded p-1.5 border transition-all ${
                  currentIndex === idx
                    ? 'bg-[#1A1A1A] border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-[#0A0A0A] border-[#1F1F1F] hover:border-[#2A2A2A]'
                }`}
              >
                <button
                  onClick={() => selectQuestion(idx)}
                  className="w-full flex flex-col items-center text-left cursor-pointer"
                >
                  <div className="w-full h-14 rounded bg-[#000000] overflow-hidden border border-[#1F1F1F]">
                    <img src={q.image} alt={q.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-white truncate w-full text-center mt-1">
                    {q.answer}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteQuestion(idx);
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity cursor-pointer shadow"
                  title="Delete Image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL POPUP FOR ADDING IMAGE & HINT */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] shadow-2xl flex flex-col gap-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#1F1F1F]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-white" />
                <span>ADD NEW IMAGE & HINT</span>
              </h3>
              <button
                onClick={() => setShowUploader(false)}
                className="p-1 rounded text-[#71717A] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomUpload} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1">
                  Target Answer Name *
                </label>
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
                <label className="text-[11px] font-mono text-[#71717A] block mb-1">
                  Hint for Participants
                </label>
                <input
                  type="text"
                  placeholder="e.g. Friendly neighborhood web slinger"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#000000] border border-[#1F1F1F] text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#2A2A2A]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1">
                  Image Source *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL or Paste Image"
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
                  className="px-4 py-1.5 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs uppercase"
                >
                  {isUploading ? 'Saving...' : 'Save & Upload'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
