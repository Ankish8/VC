"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Upload, Cog, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ConversionStage =
  | "uploading"
  | "processing"
  | "downloading"
  | "completed"
  | "error";

interface ConversionProgressProps {
  stage: ConversionStage;
  progress: number;
  message?: string;
  className?: string;
}

interface StageConfig {
  label: string;
  icon: typeof Upload;
  color: string;
}

const stageConfigs: Record<ConversionStage, StageConfig> = {
  uploading: {
    label: "Uploading",
    icon: Upload,
    color: "text-blue-500",
  },
  processing: {
    label: "Processing",
    icon: Cog,
    color: "text-purple-500",
  },
  downloading: {
    label: "Downloading SVG",
    icon: Download,
    color: "text-green-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  error: {
    label: "Error",
    icon: Upload,
    color: "text-destructive",
  },
};

export function ConversionProgress({
  stage,
  progress,
  message,
  className,
}: ConversionProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(progress);
  const config = stageConfigs[stage];
  const Icon = config.icon;

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getStageIndex = (stageName: ConversionStage): number => {
    const stages: ConversionStage[] = [
      "uploading",
      "processing",
      "downloading",
      "completed",
    ];
    return stages.indexOf(stageName);
  };

  const currentStageIndex = getStageIndex(stage);

  return (
    <div className={cn("w-full min-h-[500px] flex items-center justify-center", className)}>
      <div className="w-full max-w-2xl space-y-8 p-8">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
              <Icon
                className={cn(
                  "h-12 w-12 text-primary",
                  stage !== "completed" && stage !== "error" && "animate-spin"
                )}
              />
            </div>
          </div>
        </div>

        {/* Title & Progress */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold">Converting to SVG</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm px-1">
              <span className="font-medium text-muted-foreground">
                {config.label}
              </span>
              <span className="font-semibold text-lg">{displayProgress}%</span>
            </div>
            <Progress value={displayProgress} className="h-3" />
          </div>
          {message && (
            <p className="text-base text-muted-foreground mt-4">
              {message}
            </p>
          )}
        </div>

        {/* Stage Indicators */}
        <div className="flex items-center justify-center gap-4 pt-4">
          {(["uploading", "processing", "downloading", "completed"] as const).map(
            (stageName, index) => {
              const stageConfig = stageConfigs[stageName];
              const StageIcon = stageConfig.icon;
              const isActive = index === currentStageIndex;
              const isCompleted = index < currentStageIndex;

              return (
                <div key={stageName} className="flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300",
                      isActive &&
                        "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/25",
                      isCompleted &&
                        "bg-primary/10 text-primary",
                      !isActive &&
                        !isCompleted &&
                        "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-7 w-7" />
                    ) : (
                      <StageIcon
                        className={cn(
                          "h-7 w-7",
                          isActive && "animate-pulse"
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      (isActive || isCompleted) ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {stageConfig.label}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
