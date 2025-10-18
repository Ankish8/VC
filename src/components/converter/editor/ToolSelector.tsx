"use client";

import { Button } from "@/components/ui/button";
import { EditorTool } from "./types";
import { MousePointer, Pipette, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolSelectorProps {
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  disabled?: boolean;
}

const tools: Array<{
  id: EditorTool;
  label: string;
  icon: typeof MousePointer;
  description: string;
  shortcut: string;
  cursor?: string;
}> = [
  {
    id: "select",
    label: "Select",
    icon: MousePointer,
    description: "Select and pan canvas",
    shortcut: "V",
    cursor: "default",
  },
  {
    id: "colorReplace",
    label: "Color Picker",
    icon: Pipette,
    description: "Click to pick & change colors",
    shortcut: "C",
    cursor: "crosshair",
  },
  {
    id: "eraser",
    label: "Background Eraser",
    icon: Scissors,
    description: "Click color to remove",
    shortcut: "E",
    cursor: "not-allowed",
  },
];

export function ToolSelector({
  activeTool,
  onToolChange,
  disabled = false,
}: ToolSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground px-2">
        Tools
      </div>
      <div className="grid gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-auto py-3 px-3",
                    isActive && "shadow-sm"
                  )}
                  onClick={() => onToolChange(tool.id)}
                  disabled={disabled}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                  <div className="flex-1 text-left">
                    <div className={cn("font-medium text-sm", isActive && "text-primary-foreground")}>
                      {tool.label}
                    </div>
                    <div className={cn(
                      "text-xs text-muted-foreground",
                      isActive && "text-primary-foreground/80"
                    )}>
                      {tool.description}
                    </div>
                  </div>
                  <kbd className={cn(
                    "hidden sm:inline-block px-2 py-1 text-xs font-mono bg-muted rounded",
                    isActive && "bg-primary-foreground/20 text-primary-foreground"
                  )}>
                    {tool.shortcut}
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Keyboard shortcut: {tool.shortcut}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
