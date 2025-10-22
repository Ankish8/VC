"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, RefreshCw, Clock } from "lucide-react";

interface TimerSettings {
  enabled: boolean;
  durationDays: number;
  lastResetAt: string;
  endDate: string;
  isExpired: boolean;
}

export default function AdminTimerSettings() {
  const [settings, setSettings] = useState<TimerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [durationDays, setDurationDays] = useState(7);
  const [enabled, setEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, []);

  // Update countdown display
  useEffect(() => {
    if (!settings?.endDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(settings.endDate);
      const difference = end.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft("Expired (will auto-reset on next page load)");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.timer);
        setDurationDays(data.timer.durationDays);
        setEnabled(data.timer.enabled);
      } else {
        toast.error("Failed to fetch settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch settings");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timer: {
            enabled,
            durationDays,
            resetNow: false,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.timer);
        toast.success("Settings saved successfully");
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResetTimer() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timer: {
            enabled,
            durationDays,
            resetNow: true,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.timer);
        toast.success("Timer reset successfully");
      } else {
        toast.error(data.error || "Failed to reset timer");
      }
    } catch (error) {
      console.error("Error resetting timer:", error);
      toast.error("Failed to reset timer");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Countdown Timer Settings
          </CardTitle>
          <CardDescription>
            Manage the countdown timer shown in the urgency banner and lifetime pricing card.
            Timer automatically loops when it expires.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="p-4 bg-slate-50 rounded-lg border">
            <h3 className="font-semibold mb-2">Current Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className={`font-semibold ${settings?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                  {settings?.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Time Remaining:</span>
                <span className="font-semibold text-blue-600">{timeLeft}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Duration:</span>
                <span className="font-semibold">{settings?.durationDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Last Reset:</span>
                <span className="font-semibold">
                  {settings?.lastResetAt
                    ? new Date(settings.lastResetAt).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ends At:</span>
                <span className="font-semibold">
                  {settings?.endDate
                    ? new Date(settings.endDate).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="timer-enabled">Enable Timer</Label>
                <p className="text-sm text-slate-500">
                  Show countdown timer on landing page
                </p>
              </div>
              <Switch
                id="timer-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                placeholder="7"
              />
              <p className="text-sm text-slate-500">
                How many days the countdown should run before auto-resetting
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
            <Button
              onClick={handleResetTimer}
              disabled={isSaving}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Timer Now
            </Button>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Auto-Loop:</strong> When the timer reaches 0, it automatically resets to the configured duration.
              This happens on the next page load after expiry.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
