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

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-6 md:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl relative">
      
      {/* CONNECTION STATUS BADGE */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-300">MongoDB Database Sync</span>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
          <span className={`font-bold ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isConnected ? 'LIVE CONNECTED' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      {/* CONFIDENTIAL ANSWER CARD FOR ADMIN */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-950/90 to-slate-900 border border-purple-500/40 shadow-xl text-center relative">
        <div className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase my-1 drop-shadow-md">
          {currentQuestion?.answer || (hasImages ? 'SELECT AN IMAGE' : 'NO IMAGES IN DATABASE')}
        </div>

        {currentQuestion?.hint && (
          <p className="text-slate-400 text-xs md:text-sm mt-1 italic">
            "{currentQuestion.hint}"
          </p>
        )}

        {/* SHOW HINT POPUP BUTTON */}
        {hasImages && currentQuestion?.hint && (
          <button
            onClick={toggleHint}
            className={`mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
              showHint
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>{showHint ? 'HIDE HINT POPUP' : 'SHOW HINT POPUP ON SCREEN'}</span>
          </button>
        )}
      </div>

      {/* MAIN BIG ACTION BUTTONS */}
      <div className="flex flex-col gap-4">
        
        {/* 1. BIG START NEW ROUND BUTTON */}
        <button
          onClick={startNewRound}
          disabled={!hasImages}
          className={`w-full py-6 px-8 rounded-2xl font-black text-2xl md:text-3xl tracking-widest uppercase flex items-center justify-center gap-3 transition-all transform shadow-2xl ${
            hasImages
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.5)] active:scale-[0.99] cursor-pointer'
              : 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
        >
          <Play className="w-8 h-8 fill-current" />
          <span>{status === 'RUNNING' ? 'RESTART NEW ROUND' : 'START NEW ROUND'}</span>
        </button>

        {/* 2. BIG REVEAL ANSWER BUTTON */}
        <button
          onClick={revealAnswer}
          disabled={!hasImages || status === 'REVEALED' || status === 'TIMEOUT'}
          className={`w-full py-6 px-8 rounded-2xl font-black text-2xl md:text-3xl tracking-widest uppercase flex items-center justify-center gap-3 transition-all transform shadow-2xl ${
            hasImages && status !== 'REVEALED' && status !== 'TIMEOUT'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-[0_0_40px_rgba(147,51,234,0.5)] active:scale-[0.99] cursor-pointer'
              : 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
        >
          <Trophy className="w-8 h-8 text-amber-300" />
          <span>REVEAL ANSWER ({currentQuestion?.answer || '---'})</span>
        </button>

      </div>

      {/* QUESTION SELECTOR GRID */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <span>MongoDB Images ({questions.length})</span>
            {hasImages && (
              <span className="flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                <Shuffle className="w-3 h-3" /> Played: {usedCount}/{totalCount}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-cyan-400 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Image</span>
          </button>
        </div>

        {!hasImages ? (
          <div className="py-8 px-4 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center gap-2">
            <ImagePlus className="w-10 h-10 text-cyan-400/60" />
            <span className="text-slate-300 font-bold text-sm">No Images in Database</span>
            <p className="text-slate-500 text-xs max-w-sm">
              Click <strong className="text-cyan-400">+ Add Image</strong> above to upload your custom image questions!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className={`relative group rounded-xl p-2 border transition-all ${
                  currentIndex === idx
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-80'
                }`}
              >
                <button
                  onClick={() => selectQuestion(idx)}
                  className="w-full flex flex-col items-center justify-center text-left cursor-pointer"
                >
                  <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img src={q.image} alt={q.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 truncate w-full text-center mt-1.5">
                    {q.answer}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteQuestion(idx);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all shadow-md cursor-pointer"
                  title="Delete Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL POPUP FOR ADDING IMAGE & HINT */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col gap-4 relative">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>ADD NEW IMAGE & HINT</span>
              </h3>
              <button
                onClick={() => setShowUploader(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomUpload} className="flex flex-col gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Answer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SPIDER-MAN"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Hint / Clue for Participants
                </label>
                <input
                  type="text"
                  placeholder="e.g. Friendly neighborhood superhero with web slinging"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Image Source *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL or Paste Image"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />

                  <label className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Browse</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setShowUploader(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-cyan-400 disabled:opacity-50 shadow-md"
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
