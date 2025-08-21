import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MiningStatusProps {
  lastClaimTimestamp: string;
  storageHours: number;
}

const MiningStatus: React.FC<MiningStatusProps> = ({ lastClaimTimestamp, storageHours }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!lastClaimTimestamp || storageHours <= 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const lastClaim = new Date(lastClaimTimestamp);
      const secondsPassed = Math.floor((now.getTime() - lastClaim.getTime()) / 1000);
      const storageLimitSeconds = storageHours * 3600;
      
      const currentProgress = Math.min(100, (secondsPassed / storageLimitSeconds) * 100);
      setProgress(currentProgress);
      
      const secondsLeft = Math.max(0, storageLimitSeconds - secondsPassed);
      setTimeLeft(secondsLeft);

    }, 1000);

    return () => clearInterval(interval);
  }, [lastClaimTimestamp, storageHours]);

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "00:00:00";
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const isFull = progress >= 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-yellow-400">Storage Status</h2>
        <span className={`text-sm font-semibold ${isFull ? 'text-red-500' : 'text-green-400'}`}>
          {isFull ? 'Full!' : 'Mining...'}
        </span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <motion.div
          className={`h-4 rounded-full ${isFull ? 'bg-red-600' : 'bg-gradient-to-r from-green-400 to-blue-500'}`}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </div>
      
      <div className="text-center mt-2 text-gray-400 text-sm">
        {isFull ? (
          <p className="font-bold text-red-400">Storage is full! Claim your earnings to continue mining.</p>
        ) : (
          <p>Storage full in: <span className="font-bold text-white">{formatTime(timeLeft)}</span></p>
        )}
      </div>
    </motion.div>
  );
};

export default MiningStatus;