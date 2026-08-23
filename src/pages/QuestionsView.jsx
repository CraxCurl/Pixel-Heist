import React, { useState } from 'react';
import { Search, Plus, Trash2, Pencil, ImagePlus, Upload, X, Clock, Edit3 } from 'lucide-react';

const DURATION_OPTIONS = [
  { label: '10 sec', value: 10000 },
  { label: '20 sec', value: 20000 },
  { label: '30 sec', value: 30000 },
  { label: '40 sec', value: 40000 },
  { label: '50 sec', value: 50000 },
  { label: '60 sec', value: 60000 }
];

export function QuestionsView({ gameState }) {
  const { questions, addCustomQuestion, updateQuestion, deleteQuestion, duration, setRoundDuration } = gameState;
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Modal State
  const [showUploader, setShowUploader] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editAnswer, setEditAnswer] = useState('');
  const [editHint, setEditHint] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const filteredQuestions = questions.filter(
    (q) =>
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.hint && q.hint.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    setEditAnswer(q.answer || '');
    setEditHint(q.hint || '');
    setEditImageUrl(q.image || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingQuestion || !editAnswer.trim()) return;

    setIsSavingEdit(true);
    await updateQuestion(editingQuestion.id, {
      title: editAnswer,
      answer: editAnswer.toUpperCase(),
      hint: editHint || '',
      image: editImageUrl || editingQuestion.image
    });

    setIsSavingEdit(false);
    setEditingQuestion(null);
  };

  const handleFileUpload = (e, setUrlFn) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUrlFn(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Question Bank & Settings</h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Configure round unpixelation time limit and manage target images saved in MongoDB Atlas.
          </p>
        </div>

        <button
          onClick={() => setShowUploader(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Question</span>
        </button>
      </div>

      {/* UNPIXELATION DURATION SETTINGS CARD */}
      <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-white">Round Unpixelation Speed / Time Limit</span>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold">
            Current: {duration / 1000}s
          </span>
        </div>

        <p className="text-xs text-[#A1A1AA]">
          Select how long each image downsamples and unpixelates before timing out:
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {DURATION_OPTIONS.map((opt) => {
            const isActive = duration === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setRoundDuration(opt.value)}
                className={`py-2 px-3 rounded text-xs font-mono font-bold transition-all cursor-pointer border text-center ${
                  isActive
                    ? 'bg-white text-black border-white shadow'
                    : 'bg-[#111111] hover:bg-[#1A1A1A] border-[#2A2A2A] text-[#A1A1AA] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TOOLBAR SEARCH */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or hints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#2A2A2A] transition-colors"
          />
        </div>
        <span className="text-xs font-mono text-[#71717A]">
          {filteredQuestions.length} of {questions.length} items
        </span>
      </div>

      {/* QUESTIONS TABLE */}
      <div className="w-full rounded border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
        {questions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <ImagePlus className="w-10 h-10 text-[#71717A]" />
            <h3 className="text-sm font-semibold text-white">No Questions Uploaded</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm">
              Click <strong className="text-white">+ Add Question</strong> to upload custom target images directly to MongoDB Atlas.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#000000] border-b border-[#1F1F1F] text-[11px] font-mono text-[#71717A] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-normal">Image</th>
                <th className="py-2.5 px-4 font-normal">Target Answer</th>
                <th className="py-2.5 px-4 font-normal">Participant Hint</th>
                <th className="py-2.5 px-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {filteredQuestions.map((q, idx) => (
                <tr key={q.id || idx} className="hover:bg-[#111111] transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="w-12 h-9 rounded bg-[#000000] border border-[#1F1F1F] overflow-hidden">
                      <img src={q.image} alt={q.answer} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-white tracking-wider">
                    {q.answer}
                  </td>
                  <td className="py-2.5 px-4 text-[#A1A1AA] italic">
                    {q.hint || '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      {/* EDIT BUTTON */}
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="p-1.5 rounded hover:bg-[#1F1F1F] text-[#71717A] hover:text-white transition-colors cursor-pointer"
                        title="Edit Target Answer & Hint"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={() => deleteQuestion(idx)}
                        className="p-1.5 rounded hover:bg-[#1F1F1F] text-[#71717A] hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-5 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F1F1F]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Edit Target Answer & Hint</span>
              </h3>
              <button onClick={() => setEditingQuestion(null)} className="p-1 rounded text-[#71717A] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1">Target Answer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. SPIDER-MAN"
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#000000] border border-[#1F1F1F] text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#2A2A2A]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1">Hint for Participants</label>
                <input
                  type="text"
                  placeholder="e.g. Friendly neighborhood web slinger"
                  value={editHint}
                  onChange={(e) => setEditHint(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#000000] border border-[#1F1F1F] text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#2A2A2A]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#71717A] block mb-1">Image File or URL (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-[#000000] border border-[#1F1F1F] text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#2A2A2A]"
                  />
                  <label className="px-3 py-2 rounded bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-white cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setEditImageUrl)} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1F1F1F] mt-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-3 py-1.5 rounded text-xs text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-1.5 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-5 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] shadow-2xl flex flex-col gap-4">
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
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewImageUrl)} className="hidden" />
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
