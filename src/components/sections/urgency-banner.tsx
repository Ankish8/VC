"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1];

export default function UrgencyBanner() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the timer end date from API
  useEffect(() => {
    async function fetchTimer() {
      try {
        const response = await fetch('/api/timer');
        const data = await response.json();

        if (data.success && data.enabled) {
          setEndDate(new Date(data.endDate));
          setIsEnabled(data.enabled);
        } else {
          setIsEnabled(false);
        }
      } catch (error) {
        console.error('Error fetching timer:', error);
        // Use default 7-day timer as fallback
        const fallbackDate = new Date();
        fallbackDate.setDate(fallbackDate.getDate() + 7);
        setEndDate(fallbackDate);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimer();
  }, []);

  // Calculate and update time left every second
  useEffect(() => {
    if (!endDate || !isEnabled) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();
      const secondsLeft = Math.max(0, Math.floor(difference / 1000));
      setTimeLeft(secondsLeft);
    };

    // Initial calculation
    calculateTimeLeft();

    // Update every second
    const intervalId = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(intervalId);
  }, [endDate, isEnabled]);

  const days = String(Math.floor(timeLeft / (24 * 3600))).padStart(2, "0");
  const hours = String(Math.floor((timeLeft % (24 * 3600)) / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  // Don't show the banner if disabled or still loading
  if (!isEnabled || isLoading) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease }}
      style={{ height: '64px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-white">⚡ Limited Launch Offer Ends In:</span>
            
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{days}</div>
                <div className="text-xs text-slate-400 tracking-wider">DAYS</div>
              </div>
              <span className="text-slate-400">:</span>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{hours}</div>
                <div className="text-xs text-slate-400 tracking-wider">HRS</div>
              </div>
              <span className="text-slate-400">:</span>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{minutes}</div>
                <div className="text-xs text-slate-400 tracking-wider">MIN</div>
              </div>
              <span className="text-slate-400">:</span>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{seconds}</div>
                <div className="text-xs text-slate-400 tracking-wider">SEC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}