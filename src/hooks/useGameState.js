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
  if (!socket && window.location.hostname === 'localhost') {
    try {
      socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        timeout: 3000
      });
    } catch (e) {}
  }
  return socket;
}

export function useGameState() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [usedIds, setUsedIds] = useState([]);
  const [status, setStatus] = useState('IDLE');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [revealedAtTime, setRevealedAtTime] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [soundMuted, setSoundMuted] = useState(getMuted());
  const [isConnected, setIsConnected] = useState(false);

  const animFrameRef = useRef(null);
  const pollTimerRef = useRef(null);
  const lastWarningRef = useRef({ tenSec: false, fiveSec: false });
  const lastLocalUpdateRef = useRef(0);

  const toggleSound = useCallback(() => {
    setSoundMuted((prev) => {
      const next = !prev;
      setMuted(next);
      return next;
    });
  }, []);

  const currentQuestion = questions[currentIndex] || null;

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data || []);
        setIsConnected(true);
        return data;
      }
    } catch (e) {}
  }, []);

  const fetchState = useCallback(async () => {
    // If a user just triggered an action in the last 2.5 seconds, ignore polling overwrites!
    if (Date.now() - lastLocalUpdateRef.current < 2500) {
      return;
    }

    try {
      const res = await fetch('/api/game-state');
      if (res.ok) {
        const state = await res.json();
        if (state) {
          if (state.currentIndex !== undefined) setCurrentIndex(state.currentIndex);
          if (state.status !== undefined) setStatus(state.status);
          if (state.showHint !== undefined) setShowHint(state.showHint);
          if (state.usedIds) setUsedIds(state.usedIds);

          if (state.status === 'RUNNING' && state.startTime) {
            setStartTime((prev) => (prev ? prev : state.startTime));
          } else {
            if (state.startTime !== undefined) setStartTime(state.startTime);
            if (state.elapsedTime !== undefined) setElapsedTime(state.elapsedTime);
            if (state.revealedAtTime !== undefined) setRevealedAtTime(state.revealedAtTime);
          }
          setIsConnected(true);
        }
      }
    } catch (e) {}
  }, []);

  const postStateUpdate = useCallback(async (updates) => {
    lastLocalUpdateRef.current = Date.now();
    try {
      await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {}
  }, []);

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

  // Polling loop for Vercel Serverless Sync
  useEffect(() => {
    fetchQuestions();
    fetchState();

    pollTimerRef.current = setInterval(() => {
      fetchState();
    }, 500);

    const qPollTimer = setInterval(() => {
      fetchQuestions();
    }, 3000);

    const s = getSocket();
    if (s) {
      s.on('connect', () => setIsConnected(true));
      s.on('disconnect', () => setIsConnected(false));
      s.on('questions:updated', (updated) => setQuestions(updated || []));
      s.on('game:state_changed', (state) => {
        if (Date.now() - lastLocalUpdateRef.current < 2500) return;
        if (state) {
          if (state.currentIndex !== undefined) setCurrentIndex(state.currentIndex);
          if (state.status !== undefined) setStatus(state.status);
          if (state.showHint !== undefined) setShowHint(state.showHint);
          if (state.usedIds) setUsedIds(state.usedIds);

          if (state.status === 'RUNNING' && state.startTime) {
            setStartTime((prev) => (prev ? prev : state.startTime));
          } else {
            if (state.startTime !== undefined) setStartTime(state.startTime);
            if (state.elapsedTime !== undefined) setElapsedTime(state.elapsedTime);
            if (state.revealedAtTime !== undefined) setRevealedAtTime(state.revealedAtTime);
          }
        }
      });
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (qPollTimer) clearInterval(qPollTimer);
      if (s) {
        s.off('connect');
        s.off('disconnect');
        s.off('questions:updated');
        s.off('game:state_changed');
      }
    };
  }, [fetchQuestions, fetchState]);

  // START NEW ROUND
  const handleStartNewRound = useCallback(() => {
    if (questions.length === 0) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    lastLocalUpdateRef.current = Date.now();

    let nextIdx = currentIndex;
    let nextUsed = usedIds;

    // Pick new random image whenever starting round from REVEALED, TIMEOUT, or IDLE!
    if (status === 'REVEALED' || status === 'TIMEOUT' || status === 'IDLE') {
      const result = pickNextRandomIndex(questions, usedIds);
      nextIdx = result.index;
      nextUsed = result.nextUsed;
    }

    const nowEpoch = Date.now();
    
    // Instant local state update
    setCurrentIndex(nextIdx);
    setUsedIds(nextUsed);
    setStatus('RUNNING');
    setStartTime(nowEpoch);
    setElapsedTime(0);
    setRevealedAtTime(null);
    setShowHint(false);
    lastWarningRef.current = { tenSec: false, fiveSec: false };

    playStartSound();

    const payload = {
      currentIndex: nextIdx,
      status: 'RUNNING',
      startTime: nowEpoch,
      elapsedTime: 0,
      revealedAtTime: null,
      showHint: false,
      usedIds: nextUsed
    };

    postStateUpdate(payload);

    const s = getSocket();
    if (s && s.connected) {
      s.emit('admin:start_round', { index: nextIdx, usedIds: nextUsed, startTime: nowEpoch });
    }
  }, [status, questions, usedIds, currentIndex, pickNextRandomIndex, postStateUpdate]);

  // REVEAL ANSWER
  const handleRevealAnswer = useCallback(() => {
    if (status === 'REVEALED' || status === 'TIMEOUT' || questions.length === 0) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    lastLocalUpdateRef.current = Date.now();

    const nowEpoch = Date.now();
    const finalElapsed = (status === 'RUNNING' && startTime) ? Math.min(nowEpoch - startTime, REVEAL_DURATION_MS) : elapsedTime;
    const seconds = (finalElapsed / 1000).toFixed(2);

    setStatus('REVEALED');
    setElapsedTime(finalElapsed);
    setRevealedAtTime(seconds);

    playRevealSound();

    const payload = {
      status: 'REVEALED',
      elapsedTime: finalElapsed,
      revealedAtTime: seconds
    };

    postStateUpdate(payload);

    const s = getSocket();
    if (s && s.connected) {
      s.emit('admin:reveal_answer', { finalElapsed, seconds });
    }
  }, [status, startTime, elapsedTime, questions.length, postStateUpdate]);

  // TOGGLE / SHOW HINT
  const toggleHint = useCallback(() => {
    lastLocalUpdateRef.current = Date.now();
    const nextState = !showHint;
    setShowHint(nextState);

    postStateUpdate({ showHint: nextState });

    const s = getSocket();
    if (s && s.connected) {
      s.emit('admin:toggle_hint', { showHint: nextState });
    }
  }, [showHint, postStateUpdate]);

  // SELECT QUESTION
  const selectQuestion = useCallback((index) => {
    if (index < 0 || index >= questions.length) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    lastLocalUpdateRef.current = Date.now();
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

    const payload = {
      currentIndex: index,
      status: 'IDLE',
      startTime: null,
      elapsedTime: 0,
      revealedAtTime: null,
      showHint: false,
      usedIds: newUsed
    };

    postStateUpdate(payload);

    const s = getSocket();
    if (s && s.connected) {
      s.emit('admin:select_question', { index, usedIds: newUsed });
    }
  }, [questions, usedIds, postStateUpdate]);

  // ADD CUSTOM QUESTION
  const addCustomQuestion = useCallback(async (newQuestion) => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      const data = await res.json();
      await fetchQuestions();
      return data;
    } catch (err) {
      console.error('Error adding question:', err);
    }
  }, [fetchQuestions]);

  // DELETE QUESTION
  const deleteQuestion = useCallback(async (index) => {
    const target = questions[index];
    if (!target) return;

    try {
      await fetch(`/api/questions?id=${target.id}`, {
        method: 'DELETE'
      });
      setUsedIds((prev) => prev.filter((id) => id !== target.id));
      setCurrentIndex((prev) => Math.max(0, Math.min(prev, questions.length - 2)));
      await fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  }, [questions, fetchQuestions]);

  // 60 FPS Animation tick loop
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

        postStateUpdate({
          status: 'TIMEOUT',
          elapsedTime: REVEAL_DURATION_MS,
          revealedAtTime: '20.00'
        });

        const s = getSocket();
        if (s && s.connected) {
          s.emit('admin:reveal_answer', {
            finalElapsed: REVEAL_DURATION_MS,
            seconds: '20.00'
          });
        }
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
  }, [status, startTime, postStateUpdate]);

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
