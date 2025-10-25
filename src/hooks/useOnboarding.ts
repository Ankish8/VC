"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useOnboarding() {
  const { data: session } = useSession();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has seen the tour from the database
  useEffect(() => {
    const checkTourStatus = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/tour-status');
        const data = await response.json();

        if (response.ok && !data.hasSeenTour) {
          setIsOnboardingCompleted(false);
          // Start tour after a short delay to let the page render
          setTimeout(() => {
            setIsTourOpen(true);
          }, 1000);
        } else {
          setIsOnboardingCompleted(true);
        }
      } catch (error) {
        console.error('Failed to check tour status:', error);
        setIsOnboardingCompleted(true); // Default to not showing tour on error
      } finally {
        setIsLoading(false);
      }
    };

    checkTourStatus();
  }, [session]);

  const completeOnboarding = async () => {
    setIsOnboardingCompleted(true);
    setIsTourOpen(false);

    // Update user's tour status in database
    try {
      await fetch('/api/user/tour-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasSeenTour: true }),
      });
    } catch (error) {
      console.error('Failed to update tour status:', error);
    }
  };

  const skipOnboarding = async () => {
    setIsOnboardingCompleted(true);
    setIsTourOpen(false);

    // Update user's tour status in database
    try {
      await fetch('/api/user/tour-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasSeenTour: true }),
      });
    } catch (error) {
      console.error('Failed to update tour status:', error);
    }
  };

  const restartTour = () => {
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const resetOnboarding = async () => {
    setIsOnboardingCompleted(false);

    // Reset user's tour status in database
    try {
      await fetch('/api/user/tour-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasSeenTour: false }),
      });
    } catch (error) {
      console.error('Failed to reset tour status:', error);
    }
  };

  return {
    isOnboardingCompleted,
    isTourOpen,
    isLoading,
    completeOnboarding,
    skipOnboarding,
    restartTour,
    closeTour,
    resetOnboarding,
  };
}
