/**
 * Cross-tab & Cross-window State Synchronization for Pixel Heist
 * Uses BroadcastChannel API with localStorage fallback.
 */

const CHANNEL_NAME = 'pixel_heist_channel_v1';
const STORAGE_KEY = 'pixel_heist_state_v1';

let channel = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel failed to initialize:', e);
  }
}

/**
 * Broadcast an action or state to all open windows/tabs
 */
export function broadcastState(type, payload) {
  const message = { type, payload, timestamp: Date.now() };

  // 1. Send via BroadcastChannel
  if (channel) {
    try {
      channel.postMessage(message);
    } catch (err) {
      console.warn('BroadcastChannel postMessage error:', err);
    }
  }

  // 2. Backup to localStorage for cross-window sync
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
  } catch (e) {
    // ignore quota errors
  }
}

/**
 * Subscribe to state broadcasts from other tabs/windows
 */
export function subscribeToState(callback) {
  if (typeof window === 'undefined') return () => {};

  // Listener for BroadcastChannel
  const handleMessage = (event) => {
    if (event.data && event.data.type) {
      callback(event.data);
    }
  };

  if (channel) {
    channel.addEventListener('message', handleMessage);
  }

  // Listener for localStorage (fires in OTHER tabs when localStorage changes)
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        callback(parsed);
      } catch (e) {
        // ignore parse error
      }
    }
  };

  window.addEventListener('storage', handleStorage);

  // Return unsubscribe cleanup function
  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
  };
}
