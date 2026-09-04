import React, { useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

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
    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 font-mono text-xs font-bold transition-colors ${
      isLowTime 
        ? 'bg-red-50 border-red-500 text-red-700 animate-pulse' 
        : 'bg-[#00100B] border-[#00100B] text-[#FCFFF7]'
    }`}>
      {isLowTime ? (
        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-[#FFE900]" />
      )}
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
}
