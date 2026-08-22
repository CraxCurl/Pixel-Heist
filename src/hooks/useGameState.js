import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  playStartSound,
  playWarningSound,
  playRevealSound,
  playTimeoutSound,
  getMuted,
  setMuted
} from '../utils/soundEngine';

const REVEAL_DURATION_MS = 20000; // 20 seconds limit per round

const SERVER_URL = import.meta.env.VITE_SERVER_URL || (
  window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin
);

let socket = null;

function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });
  }
  return socket;
}

export function useGameState() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [usedIds, setUsedIds] = useState([]);
  const [status, setStatus] = useState('IDLE'); // IDLE, RUNNING, REVEALED, TIMEOUT
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [revealedAtTime, setRevealedAtTime] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [soundMuted, setSoundMuted] = useState(getMuted());
  const [isConnected, setIsConnected] = useState(false);

  const animFrameRef = useRef(null);
  const lastWarningRef = useRef({ tenSec: false, fiveSec: false });

  const toggleSound = useCallback(() => {
    setSoundMuted((prev) => {
      const next = !prev;
      setMuted(next);
      return next;
    });
  }, []);

  const currentQuestion = questions[currentIndex] || null;

  const pickNextRandomIndex = useCallback((allQuestions, currentUsed) => {
    if (!allQuestions || allQuestions.length === 0) return { index: 0, nextUsed: [] };

    let unused = allQuestions.filter((q) => !currentUsed.includes(q.id));
    let activeUsedList = currentUsed;

    if (unused.length === 0) {
      unused = [...allQuestions];
      activeUsedList = [];
    }

    const randomPick = unused[Math.floor(Math.random() * unused.length)];
    const foundIndex = allQuestions.findIndex((q) => q.id === randomPick.id);

    return {
      index: foundIndex >= 0 ? foundIndex : 0,
      nextUsed: [...activeUsedList, randomPick.id]
    };
  }, []);

  useEffect(() => {
    const s = getSocket();

    s.on('connect', () => {
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('questions:updated', (updatedQuestions) => {
      setQuestions(updatedQuestions || []);
    });

    s.on('game:state_changed', (state) => {
      if (state) {
        if (state.currentIndex !== undefined) setCurrentIndex(state.currentIndex);
        if (state.status !== undefined) setStatus(state.status);
        if (state.elapsedTime !== undefined) setElapsedTime(state.elapsedTime);
        if (state.revealedAtTime !== undefined) setRevealedAtTime(state.revealedAtTime);
        if (state.showHint !== undefined) setShowHint(state.showHint);
        if (state.usedIds) setUsedIds(state.usedIds);
        if (state.startTime) setStartTime(state.startTime);
      }
    });

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('questions:updated');
      s.off('game:state_changed');
    };
  }, []);

  // START NEW ROUND
  const handleStartNewRound = useCallback(() => {
    if (questions.length === 0) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const s = getSocket();
    let nextIdx = currentIndex;
    let nextUsed = usedIds;

    if (status === 'REVEALED' || status === 'TIMEOUT' || status === 'IDLE') {
      const result = pickNextRandomIndex(questions, usedIds);
      nextIdx = result.index;
      nextUsed = result.nextUsed;
      setCurrentIndex(nextIdx);
      setUsedIds(nextUsed);
    }

    const nowEpoch = Date.now();
    setStatus('RUNNING');
    setStartTime(nowEpoch);
    setElapsedTime(0);
    setRevealedAtTime(null);
    setShowHint(false);
    lastWarningRef.current = { tenSec: false, fiveSec: false };

    playStartSound();

    s.emit('admin:start_round', {
      index: nextIdx,
      usedIds: nextUsed,
      startTime: nowEpoch
    });
  }, [status, questions, usedIds, currentIndex, pickNextRandomIndex]);

  // REVEAL ANSWER
  const handleRevealAnswer = useCallback(() => {
    if (status === 'REVEALED' || status === 'TIMEOUT' || questions.length === 0) return;

    const s = getSocket();
    const nowEpoch = Date.now();
    const finalElapsed = startTime ? Math.min(nowEpoch - startTime, REVEAL_DURATION_MS) : elapsedTime;
    const seconds = (finalElapsed / 1000).toFixed(2);

    setStatus('REVEALED');
    setElapsedTime(finalElapsed);
    setRevealedAtTime(seconds);

    playRevealSound();

    s.emit('admin:reveal_answer', {
      finalElapsed,
      seconds
    });
  }, [status, startTime, elapsedTime, questions.length]);

  // TOGGLE / SHOW HINT
  const toggleHint = useCallback(() => {
    const s = getSocket();
    const nextState = !showHint;
    setShowHint(nextState);
    s.emit('admin:toggle_hint', { showHint: nextState });
  }, [showHint]);

  // SELECT QUESTION
  const selectQuestion = useCallback((index) => {
    if (index < 0 || index >= questions.length) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const s = getSocket();
    const selected = questions[index];
    const newUsed = usedIds.includes(selected.id) ? usedIds : [...usedIds, selected.id];

    setCurrentIndex(index);
    setUsedIds(newUsed);
    setStatus('IDLE');
    setElapsedTime(0);
    setStartTime(null);
    setRevealedAtTime(null);
    setShowHint(false);
    lastWarningRef.current = { tenSec: false, fiveSec: false };

    s.emit('admin:select_question', {
      index,
      usedIds: newUsed
    });
  }, [questions, usedIds]);

  // ADD CUSTOM QUESTION TO MONGODB
  const addCustomQuestion = useCallback(async (newQuestion) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error adding question to MongoDB:', err);
    }
  }, []);

  // DELETE QUESTION FROM MONGODB
  const deleteQuestion = useCallback(async (index) => {
    const target = questions[index];
    if (!target) return;

    try {
      await fetch(`${SERVER_URL}/api/questions/${target.id}`, {
        method: 'DELETE'
      });
      setUsedIds((prev) => prev.filter((id) => id !== target.id));
      setCurrentIndex((prev) => Math.max(0, Math.min(prev, questions.length - 2)));
    } catch (err) {
      console.error('Error deleting question from MongoDB:', err);
    }
  }, [questions]);

  // 60 FPS Animation tick loop for 20 seconds
  useEffect(() => {
    if (status !== 'RUNNING' || !startTime) return;

    const tick = () => {
      const nowEpoch = Date.now();
      const currentElapsed = Math.max(0, nowEpoch - startTime);

      if (currentElapsed >= REVEAL_DURATION_MS) {
        setElapsedTime(REVEAL_DURATION_MS);
        setStatus('TIMEOUT');
        setRevealedAtTime('20.00');
        playTimeoutSound();

        const s = getSocket();
        s.emit('admin:reveal_answer', {
          finalElapsed: REVEAL_DURATION_MS,
          seconds: '20.00'
        });
        return;
      }

      setElapsedTime(currentElapsed);

      const remainingSec = (REVEAL_DURATION_MS - currentElapsed) / 1000;
      if (remainingSec <= 8 && remainingSec > 4 && !lastWarningRef.current.tenSec) {
        lastWarningRef.current.tenSec = true;
        playWarningSound(false);
      } else if (remainingSec <= 4 && !lastWarningRef.current.fiveSec) {
        lastWarningRef.current.fiveSec = true;
        playWarningSound(true);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [status, startTime]);

  return {
    questions,
    currentIndex,
    currentQuestion,
    status,
    elapsedTime,
    duration: REVEAL_DURATION_MS,
    revealedAtTime,
    showHint,
    usedCount: usedIds.length,
    totalCount: questions.length,
    soundMuted,
    isConnected,
    toggleSound,
    toggleHint,
    startNewRound: handleStartNewRound,
    revealAnswer: handleRevealAnswer,
    selectQuestion,
    addCustomQuestion,
    deleteQuestion
  };
}
