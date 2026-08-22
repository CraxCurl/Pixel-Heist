import React, { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { PlayerView } from './pages/PlayerView';
import { AdminView } from './pages/AdminView';

export default function App() {
  const gameState = useGameState();

  const getRouteFromUrl = () => {
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    if (hash.includes('questions') || pathname.startsWith('/questions')) return 'questions';
    if (hash.includes('admin') || pathname.startsWith('/admin')) return 'admin';
    return 'player';
  };

  const [currentRoute, setCurrentRoute] = useState(getRouteFromUrl);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getRouteFromUrl());
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigateTo = (route) => {
    setCurrentRoute(route);
    if (route === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (route === 'questions') {
      window.history.pushState({}, '', '/questions');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  if (currentRoute === 'admin' || currentRoute === 'questions') {
    return (
      <AdminView
        gameState={gameState}
        currentRoute={currentRoute}
        onNavigate={navigateTo}
      />
    );
  }

  return <PlayerView gameState={gameState} onNavigate={navigateTo} />;
}
