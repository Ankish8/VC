"use client";

import { useState, useEffect } from "react";

const ONBOARDING_STORAGE_KEY = "raster-to-svg-onboarding-completed";

export function useOnboarding() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Check if onboarding has been completed on mount
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!completed) {
      setIsOnboardingCompleted(false);
      // Start tour after a short delay to let the page render
      setTimeout(() => {
        setIsTourOpen(true);
      }, 1000);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOnboardingCompleted(true);
    setIsTourOpen(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOnboardingCompleted(true);
    setIsTourOpen(false);
  };

  const restartTour = () => {
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsOnboardingCompleted(false);
  };

  return {
    isOnboardingCompleted,
    isTourOpen,
    completeOnboarding,
    skipOnboarding,
    restartTour,
    closeTour,
    resetOnboarding,
  };
}
