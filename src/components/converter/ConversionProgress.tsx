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
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon
            className={cn(
              "h-5 w-5",
              config.color,
              stage !== "completed" && stage !== "error" && "animate-spin"
            )}
          />
          Converting to SVG
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              {config.label}
            </span>
            <span className="font-semibold">{displayProgress}%</span>
          </div>
          <Progress value={displayProgress} className="h-2" />
        </div>

        {/* Status Message */}
        {message && (
          <p className="text-sm text-muted-foreground text-center">
            {message}
          </p>
        )}

        {/* Stage Indicators */}
        <div className="flex items-center justify-between gap-2">
          {(["uploading", "processing", "downloading", "completed"] as const).map(
            (stageName, index) => {
              const stageConfig = stageConfigs[stageName];
              const StageIcon = stageConfig.icon;
              const isActive = index === currentStageIndex;
              const isCompleted = index < currentStageIndex;

              return (
                <div key={stageName} className="flex-1">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                        isActive &&
                          "border-primary bg-primary text-primary-foreground",
                        isCompleted &&
                          "border-primary bg-primary text-primary-foreground",
                        !isActive &&
                          !isCompleted &&
                          "border-muted bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StageIcon
                          className={cn(
                            "h-5 w-5",
                            isActive && "animate-pulse"
                          )}
                        />
                      )}
                    </div>
                    <Badge
                      variant={
                        isActive || isCompleted ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {stageConfig.label}
                    </Badge>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Processing Animation */}
        {stage === "processing" && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Converting your image to vector format...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
