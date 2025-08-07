import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'mindline_onboarding_completed';

export const useOnboarding = () => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const isCompleted = completed === 'true';
    setHasCompletedOnboarding(isCompleted);
    
    // Show onboarding for new users after a short delay
    if (!isCompleted) {
      const timer = setTimeout(() => {
        setIsOnboardingOpen(true);
      }, 1500); // Delay to allow page to load
      
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setHasCompletedOnboarding(true);
    setIsOnboardingOpen(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setHasCompletedOnboarding(true);
    setIsOnboardingOpen(false);
  };

  const startOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setHasCompletedOnboarding(false);
    setIsOnboardingOpen(true);
  };

  return {
    isOnboardingOpen,
    hasCompletedOnboarding,
    completeOnboarding,
    skipOnboarding,
    startOnboarding,
    resetOnboarding
  };
};