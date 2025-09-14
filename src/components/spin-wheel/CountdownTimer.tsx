// src/components/spin-wheel/CountdownTimer.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface CountdownTimerProps {
  targetDate: string; // ISO string date
  onComplete: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, onComplete }) => {
    const { t } = useTranslation(); 
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = { hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        onComplete();
      }
    }, 1000);

    return () => clearTimeout(timer);
  });

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
      <div className="countdown-timer-container">
      <div className="timer-box">
        <div className="timer-value">{pad(timeLeft.hours)}</div>
        <div className="timer-label">{t('spinWheel.hours')}</div>
      </div>
      <div className="timer-box">
        <div className="timer-value">{pad(timeLeft.minutes)}</div>
        <div className="timer-label">{t('spinWheel.minutes')}</div>
      </div>
      <div className="timer-box">
        <div className="timer-value">{pad(timeLeft.seconds)}</div>
        <div className="timer-label">{t('spinWheel.seconds')}</div>
      </div>
    </div>
  );
};

export default CountdownTimer;