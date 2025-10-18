"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
  highlightPadding?: number;
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingTour({
  steps,
  onComplete,
  onSkip,
  isOpen,
  onClose,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Update target element position
  useEffect(() => {
    if (!isOpen || !step) return;

    const updatePosition = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isOpen, step]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    onSkip?.();
    onClose();
  };

  if (!isOpen || !targetRect) return null;

  const padding = step.highlightPadding || 8;

  // Calculate tooltip position based on placement
  const getTooltipPosition = () => {
    const placement = step.placement || "bottom";
    const tooltipWidth = 320;
    const tooltipHeight = 200; // Approximate
    const gap = 16;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = targetRect.top - tooltipHeight - gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = targetRect.bottom + gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - gap;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + gap;
        break;
    }

    // Keep tooltip in viewport
    top = Math.max(gap, Math.min(top, window.innerHeight - tooltipHeight - gap));
    left = Math.max(gap, Math.min(left, window.innerWidth - tooltipWidth - gap));

    return { top, left };
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with spotlight */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none">
        {/* SVG for spotlight effect */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="black" fillOpacity="0.6" mask="url(#spotlight-mask)" />
        </svg>
      </div>

      {/* Highlight border */}
      <div
        className="absolute border-2 border-primary rounded-lg animate-pulse pointer-events-none"
        style={{
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-card border shadow-lg rounded-lg w-80 p-5"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-base">{step.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === currentStep
                  ? "w-6 bg-primary"
                  : index < currentStep
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
            >
              Skip tour
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {isLastStep ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
