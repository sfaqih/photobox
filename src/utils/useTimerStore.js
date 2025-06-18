// stores/useTimerStore.js
import { create } from 'zustand';

export const useTimerStore = create((set, get) => ({
  duration: 300, // 5 minutes in seconds
  startTime: null,
  endTime: null,
  isRunning: false,

 startTimer: (seconds = 300, onComplete = null) => { // Accept custom seconds
    const now = Date.now();
    const endTime = now + seconds * 1000;
    set({
      startTime: now,
      endTime,
      isRunning: true,
      duration: seconds,
      onComplete,
    });
  },

  resetTimer: () => {
    set({ startTime: null, endTime: null, isRunning: false, duration: 0, onComplete: null });
  },

  getRemainingSeconds: () => {
    const { endTime } = get();
    if (!endTime) return 0;
    const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    return diff;
  }
}));
