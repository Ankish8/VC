"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, X, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PricingSettings {
  starterMonthlyPrice: number;
  starterYearlyPrice: number;
  proMonthlyPrice: number;
  proYearlyPrice: number;
  lifetimePrice: number;
  starterCredits: number;
  proCredits: number;
}

export default function AdminPricingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [starterMonthlyPrice, setStarterMonthlyPrice] = useState("10.00");
  const [starterYearlyPrice, setStarterYearlyPrice] = useState("96.00");
  const [proMonthlyPrice, setProMonthlyPrice] = useState("19.00");
  const [proYearlyPrice, setProYearlyPrice] = useState("180.00");
  const [lifetimePrice, setLifetimePrice] = useState("39.00");
  const [starterCredits, setStarterCredits] = useState("100");
  const [proCredits, setProCredits] = useState("500");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pricing");
      if (!res.ok) throw new Error("Failed to fetch pricing settings");

      const data = await res.json();
      setStarterMonthlyPrice(data.starterMonthlyPrice.toFixed(2));
      setStarterYearlyPrice(data.starterYearlyPrice.toFixed(2));
      setProMonthlyPrice(data.proMonthlyPrice.toFixed(2));
      setProYearlyPrice(data.proYearlyPrice.toFixed(2));
      setLifetimePrice(data.lifetimePrice.toFixed(2));
      setStarterCredits(data.starterCredits.toString());
      setProCredits(data.proCredits.toString());
    } catch (err) {
      console.error("Error fetching pricing settings:", err);
      setError("Failed to load pricing settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const pricingData = {
        starterMonthlyPrice: parseFloat(starterMonthlyPrice),
        starterYearlyPrice: parseFloat(starterYearlyPrice),
        proMonthlyPrice: parseFloat(proMonthlyPrice),
        proYearlyPrice: parseFloat(proYearlyPrice),
        lifetimePrice: parseFloat(lifetimePrice),
        starterCredits: parseInt(starterCredits),
        proCredits: parseInt(proCredits),
      };

      // Validate
      if (Object.values(pricingData).some((val) => isNaN(val) || val < 0)) {
        setError("All values must be valid positive numbers");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update pricing");
      }

      const updatedData = await res.json();
      setSuccess("Pricing settings updated successfully! New PayPal subscription plans created.");

      // Refresh data
      fetchSettings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
          <DollarSign className="h-5 w-5" />
          Pricing & Credits Management
        </CardTitle>
        <CardDescription>
          Configure pricing for all subscription plans and credit allocations. Changes will create new
          PayPal subscription plans and only affect new subscribers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="starter" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="starter">Starter Plan</TabsTrigger>
            <TabsTrigger value="pro">Professional Plan</TabsTrigger>
            <TabsTrigger value="lifetime">Lifetime Deal</TabsTrigger>
          </TabsList>

          {/* Starter Plan */}
          <TabsContent value="starter" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starterMonthly">Monthly Price (USD)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="starterMonthly"
                    type="number"
                    step="0.01"
                    min="0"
                    value={starterMonthlyPrice}
                    onChange={(e) => setStarterMonthlyPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="starterYearly">Yearly Price (USD)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="starterYearly"
                    type="number"
                    step="0.01"
                    min="0"
                    value={starterYearlyPrice}
                    onChange={(e) => setStarterYearlyPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${(parseFloat(starterYearlyPrice) / 12).toFixed(2)}/month if paid yearly
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="starterCredits">Credits per Month</Label>
              <Input
                id="starterCredits"
                type="number"
                min="1"
                value={starterCredits}
                onChange={(e) => setStarterCredits(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of conversions users can perform each month
              </p>
            </div>
          </TabsContent>

          {/* Professional Plan */}
          <TabsContent value="pro" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="proMonthly">Monthly Price (USD)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="proMonthly"
                    type="number"
                    step="0.01"
                    min="0"
                    value={proMonthlyPrice}
                    onChange={(e) => setProMonthlyPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="proYearly">Yearly Price (USD)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="proYearly"
                    type="number"
                    step="0.01"
                    min="0"
                    value={proYearlyPrice}
                    onChange={(e) => setProYearlyPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${(parseFloat(proYearlyPrice) / 12).toFixed(2)}/month if paid yearly
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="proCredits">Credits per Month</Label>
              <Input
                id="proCredits"
                type="number"
                min="1"
                value={proCredits}
                onChange={(e) => setProCredits(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of conversions users can perform each month
              </p>
            </div>
          </TabsContent>

          {/* Lifetime Deal */}
          <TabsContent value="lifetime" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="lifetimePrice">One-Time Price (USD)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="lifetimePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={lifetimePrice}
                  onChange={(e) => setLifetimePrice(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
            <Alert>
              <AlertDescription>
                Lifetime plan users get unlimited conversions with no monthly limits.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={fetchSettings} disabled={saving}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Pricing Changes
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            <strong>Important:</strong> Changing prices will create new PayPal subscription plans.
            Existing subscribers will keep their current pricing. Only new sign-ups will see the
            updated prices.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
