import { useEffect, useState } from 'react';
import { useTimerStore } from '../utils/useTimerStore';

export default function CountdownTimer() {
  const { isRunning, getRemainingSeconds, resetTimer, onComplete } = useTimerStore();
  const [timeLeft, setTimeLeft] = useState(getRemainingSeconds());

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const remaining = getRemainingSeconds();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        resetTimer();
        console.log("Session expired");

        if (typeof onComplete === 'function') {
          onComplete();
        }
        // Optionally trigger redirect or modal
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="bg-white border-2 border-stone-900 shadow-sm rounded-sm px-10 py-2 text-black">
      ⏳ {minutes}:{seconds}
    </div>
  );
}
