"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ targetDate, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div className={`flex items-center justify-center space-x-4 md:space-x-8 ${className}`}>
      <div className="text-center">
        <div className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg p-4 md:p-6 min-w-[80px] md:min-w-[100px]">
          <div className="text-3xl md:text-4xl font-bold text-black">
            {formatNumber(timeLeft.days)}
          </div>
          <div className="text-xs md:text-sm text-black uppercase tracking-wider mt-1">
            Days
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 md:p-6 min-w-[80px] md:min-w-[100px]">
          <div className="text-3xl md:text-4xl font-bold text-black">
            {formatNumber(timeLeft.hours)}
          </div>
          <div className="text-xs md:text-sm text-black/80 uppercase tracking-wider mt-1">
            Hours
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 md:p-6 min-w-[80px] md:min-w-[100px]">
          <div className="text-3xl md:text-4xl font-bold text-black">
            {formatNumber(timeLeft.minutes)}
          </div>
          <div className="text-xs md:text-sm text-black/80 uppercase tracking-wider mt-1">
            Minutes
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 md:p-6 min-w-[80px] md:min-w-[100px]">
          <div className="text-3xl md:text-4xl font-bold text-black">
            {formatNumber(timeLeft.seconds)}
          </div>
          <div className="text-xs md:text-sm text-black/80 uppercase tracking-wider mt-1">
            Seconds
          </div>
        </div>
      </div>
    </div>
  );
}