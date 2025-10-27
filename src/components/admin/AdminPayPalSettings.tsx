"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, X, CreditCard, Eye, EyeOff, TestTube2, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PayPalConfig {
  paypalMode: string;
  paypalSandboxClientId: string;
  paypalSandboxSecret: string;
  paypalLiveClientId: string;
  paypalLiveSecret: string;
}

export default function AdminPayPalSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form state
  const [mode, setMode] = useState<"sandbox" | "live">("sandbox");
  const [sandboxClientId, setSandboxClientId] = useState("");
  const [sandboxSecret, setSandboxSecret] = useState("");
  const [liveClientId, setLiveClientId] = useState("");
  const [liveSecret, setLiveSecret] = useState("");

  // Show/hide secrets
  const [showSandboxSecret, setShowSandboxSecret] = useState(false);
  const [showLiveSecret, setShowLiveSecret] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/paypal-config");
      if (!res.ok) throw new Error("Failed to fetch PayPal settings");

      const data = await res.json();
      setMode(data.paypalMode || "sandbox");
      setSandboxClientId(data.paypalSandboxClientId || "");
      setSandboxSecret(data.paypalSandboxSecret || "");
      setLiveClientId(data.paypalLiveClientId || "");
      setLiveSecret(data.paypalLiveSecret || "");
    } catch (err) {
      console.error("Error fetching PayPal settings:", err);
      setError("Failed to load PayPal settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    setTestResult(null);

    try {
      const paypalData = {
        paypalMode: mode,
        paypalSandboxClientId: sandboxClientId.trim(),
        paypalSandboxSecret: sandboxSecret.trim(),
        paypalLiveClientId: liveClientId.trim(),
        paypalLiveSecret: liveSecret.trim(),
      };

      const res = await fetch("/api/admin/paypal-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paypalData),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to update PayPal configuration");
        throw new Error(errorMsg);
      }

      setSuccess("PayPal configuration saved successfully!");
      fetchSettings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setError("");

    try {
      const res = await fetch("/api/admin/paypal-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error || "Connection test failed" });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const maskSecret = (secret: string) => {
    if (!secret || secret.length < 8) return secret;
    return "•".repeat(secret.length - 4) + secret.slice(-4);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          PayPal Configuration
        </CardTitle>
        <CardDescription>
          Configure PayPal API credentials for payment processing. Keep your credentials secure and test
          in sandbox mode before going live.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Environment Indicator */}
        <Alert className={mode === "sandbox" ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20" : "bg-orange-50 border-orange-200 dark:bg-orange-950/20"}>
          <AlertDescription className={mode === "sandbox" ? "text-blue-900 dark:text-blue-400" : "text-orange-900 dark:text-orange-400"}>
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-base">
                  {mode === "sandbox" ? "🧪 Sandbox Mode Active" : "🔴 Live Mode Active"}
                </strong>
                <p className="text-sm mt-1">
                  {mode === "sandbox"
                    ? "Your landing page is using PayPal Sandbox (test payments only)"
                    : "Your landing page is using PayPal Live (real payments will be processed)"
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${mode === "sandbox" ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground"}`}>
                  Sandbox
                </span>
                <Switch
                  id="paypal-mode"
                  checked={mode === "live"}
                  onCheckedChange={(checked) => setMode(checked ? "live" : "sandbox")}
                />
                <span className={`text-sm font-medium ${mode === "live" ? "text-orange-700 dark:text-orange-400" : "text-muted-foreground"}`}>
                  Live
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Credentials Section */}
        {mode === "sandbox" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sandbox Credentials</h3>
              <a
                href="https://developer.paypal.com/dashboard/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Get from PayPal Developer Dashboard →
              </a>
            </div>

            <div>
              <Label htmlFor="sandbox-client-id">Sandbox Client ID</Label>
              <Input
                id="sandbox-client-id"
                type="text"
                value={sandboxClientId}
                onChange={(e) => setSandboxClientId(e.target.value)}
                placeholder="Enter sandbox client ID"
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="sandbox-secret">Sandbox Secret Key</Label>
              <div className="relative mt-1">
                <Input
                  id="sandbox-secret"
                  type={showSandboxSecret ? "text" : "password"}
                  value={sandboxSecret}
                  onChange={(e) => setSandboxSecret(e.target.value)}
                  placeholder="Enter sandbox secret key"
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSandboxSecret(!showSandboxSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSandboxSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Live Production Credentials</h3>
              <a
                href="https://www.paypal.com/businessmanage/credentials/apiAccess"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Get from PayPal Business Dashboard →
              </a>
            </div>

            <Alert variant="destructive" className="border-orange-500">
              <AlertDescription className="text-orange-900 dark:text-orange-400">
                <strong>⚠️ Warning:</strong> These credentials will process real payments. Test thoroughly in sandbox mode first!
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="live-client-id">Live Client ID</Label>
              <Input
                id="live-client-id"
                type="text"
                value={liveClientId}
                onChange={(e) => setLiveClientId(e.target.value)}
                placeholder="Enter live client ID"
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="live-secret">Live Secret Key</Label>
              <div className="relative mt-1">
                <Input
                  id="live-secret"
                  type={showLiveSecret ? "text" : "password"}
                  value={liveSecret}
                  onChange={(e) => setLiveSecret(e.target.value)}
                  placeholder="Enter live secret key"
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowLiveSecret(!showLiveSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showLiveSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Connection Result */}
        {testResult && (
          <Alert className={testResult.success ? "bg-green-50 border-green-200 dark:bg-green-950/20" : ""} variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <AlertDescription className={testResult.success ? "text-green-800 dark:text-green-400" : ""}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleTestConnection} disabled={saving || testing} variant="outline" className="flex-1">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube2 className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={saving || testing} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </div>

        <Alert className="bg-muted/50">
          <AlertDescription className="text-sm">
            <strong>💡 How it works:</strong> The toggle above controls which PayPal environment your{" "}
            <strong>entire website</strong> uses for payments. When set to{" "}
            <strong className="text-blue-600 dark:text-blue-400">Sandbox</strong>, all payments on your landing page will be{" "}
            test payments. When set to <strong className="text-orange-600 dark:text-orange-400">Live</strong>, real payments will be processed.
            Changes take effect immediately after saving.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
