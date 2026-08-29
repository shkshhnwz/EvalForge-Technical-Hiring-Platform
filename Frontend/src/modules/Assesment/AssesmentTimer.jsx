import React, { useEffect } from 'react';

export default function AssessmentTimer({ timeLeft, setTimeLeft, onTimeout }) {
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 300; // less than 5 minutes

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm ${
      isLowTime 
        ? 'bg-rose-950/30 border-rose-800 text-rose-400 animate-pulse' 
        : 'bg-slate-900 border-slate-800 text-slate-300'
    }`}>
      <span className="font-semibold">Time Remaining:</span>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
}
