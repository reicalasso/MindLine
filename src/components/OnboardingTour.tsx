import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import Button from './ui/Button';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  emoji: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'MindLine\'e Hoşgeldiniz!',
    description: 'Kedili aşk dünyamızda birlikte güzel anılar biriktireceğiz. Size nasıl çalıştığını gösterelim!',
    emoji: '😺',
    position: 'center'
  },
  {
    id: 'mood-tracker',
    title: 'Ruh Halini Takip Et',
    description: 'Her gün nasıl hissettiğinizi kaydedin. Bu, ilişkinizin duygusal yolculuğunu takip etmenizi sağlar.',
    emoji: '💕',
    target: '[data-tour="mood-tracker"]',
    position: 'bottom'
  },
  {
    id: 'navigation',
    title: 'Hızlı Navigasyon',
    description: 'Menüden tüm özelliklerimize kolayca erişebilirsiniz. Mektuplar, sohbet, filmler ve daha fazlası!',
    emoji: '🧭',
    target: 'nav',
    position: 'bottom'
  },
  {
    id: 'search',
    title: 'Arama Özelliği',
    description: 'Ctrl+K tuşuna basarak tüm içeriğinizde arama yapabilirsiniz. Mektuplardan fotoğraflara kadar her şeyi bulun!',
    emoji: '🔍',
    target: '[data-tour="search-button"]',
    position: 'bottom'
  },
  {
    id: 'shortcuts',
    title: 'Klavye Kısayolları',
    description: 'Shift+? tuşlarına basarak tüm klavye kısayollarını görebilirsiniz. Power user olun!',
    emoji: '⌨️',
    position: 'center'
  },
  {
    id: 'complete',
    title: 'Hepsi Bu!',
    description: 'Artık MindLine\'i kullanmaya hazırsınız. Güzel anılar biriktirin ve aşkınızı paylaşın!',
    emoji: '🎉',
    position: 'center'
  }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ 
  steps = ONBOARDING_STEPS, 
  isOpen, 
  onComplete, 
  onSkip 
}) => {
  const { currentTheme } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Highlight target element
  useEffect(() => {
    if (currentStep.target) {
      const element = document.querySelector(currentStep.target);
      setHighlightedElement(element);
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep]);

  // Add highlight styles to body when tour is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('onboarding-active');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('onboarding-active');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('onboarding-active');
    };
  }, [isOpen]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!highlightedElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = highlightedElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (currentStep.position) {
      case 'top':
        return {
          top: rect.top - tooltipHeight - 20,
          left: rect.left + (rect.width - tooltipWidth) / 2,
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + (rect.width - tooltipWidth) / 2,
        };
      case 'left':
        return {
          top: rect.top + (rect.height - tooltipHeight) / 2,
          left: rect.left - tooltipWidth - 20,
        };
      case 'right':
        return {
          top: rect.top + (rect.height - tooltipHeight) / 2,
          left: rect.right + 20,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop with highlight cutout */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm">
        {highlightedElement && (
          <div
            className="absolute border-4 border-white rounded-lg shadow-2xl animate-pulse"
            style={{
              top: highlightedElement.getBoundingClientRect().top - 8,
              left: highlightedElement.getBoundingClientRect().left - 8,
              width: highlightedElement.getBoundingClientRect().width + 16,
              height: highlightedElement.getBoundingClientRect().height + 16,
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className={`
          absolute w-80 p-6 rounded-2xl border-2 shadow-2xl backdrop-blur-lg z-10
          ${currentTheme.id === 'cyberpunk'
            ? 'bg-gray-900/95 border-cyber-primary/30 shadow-neon-blue'
            : 'bg-white/95 border-pink-200 shadow-xl'
          }
          animate-in fade-in-50 slide-in-from-bottom-4 duration-300
        `}
        style={getTooltipPosition()}
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className={`
            absolute top-4 right-4 p-1 rounded-full transition-all
            ${currentTheme.id === 'cyberpunk'
              ? 'text-cyber-secondary hover:text-cyber-primary hover:bg-cyber-primary/10'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2 animate-bounce">{currentStep.emoji}</div>
            <h3 className={`text-xl font-bold ${currentTheme.styles.textClass}`}>
              {currentStep.title}
            </h3>
          </div>

          <p className={`text-sm ${currentTheme.styles.textClass} opacity-80 text-center leading-relaxed`}>
            {currentStep.description}
          </p>

          {/* Progress indicators */}
          <div className="flex justify-center space-x-2 py-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentStepIndex
                    ? currentTheme.id === 'cyberpunk'
                      ? 'bg-cyber-primary shadow-neon-blue scale-125'
                      : 'bg-pink-400 scale-125'
                    : currentTheme.id === 'cyberpunk'
                      ? 'bg-cyber-secondary/30'
                      : 'bg-gray-300'
                  }
                `}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${isFirstStep
                  ? 'opacity-50 cursor-not-allowed'
                  : currentTheme.id === 'cyberpunk'
                    ? 'text-cyber-secondary hover:text-cyber-primary hover:bg-cyber-primary/10'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Geri</span>
            </button>

            <div className={`text-xs ${currentTheme.styles.textClass} opacity-60`}>
              {currentStepIndex + 1} / {steps.length}
            </div>

            <Button
              onClick={handleNext}
              variant="primary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <span>{isLastStep ? 'Tamamla' : 'İleri'}</span>
              {isLastStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Skip option */}
          <div className="text-center pt-2">
            <button
              onClick={onSkip}
              className={`
                text-xs opacity-60 hover:opacity-80 transition-opacity underline
                ${currentTheme.styles.textClass}
              `}
            >
              Turu atla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;