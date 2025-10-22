"use client";

import Section from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { siteConfig } from "@/lib/config";
import useWindowSize from "@/lib/hooks/use-window-size";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { CountdownTimer } from "@/components/ui/countdown-timer";

export default function PricingSection() {
  const [isMonthly, setIsMonthly] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isDesktop } = useWindowSize();
  const [offerEndDate, setOfferEndDate] = useState<Date | null>(null);

  // Fetch timer end date from centralized API
  useEffect(() => {
    async function fetchTimer() {
      try {
        const response = await fetch('/api/timer');
        const data = await response.json();

        if (data.success && data.enabled) {
          setOfferEndDate(new Date(data.endDate));
        } else {
          // Fallback: use 7 days from now if timer is disabled
          const fallbackDate = new Date();
          fallbackDate.setDate(fallbackDate.getDate() + 7);
          setOfferEndDate(fallbackDate);
        }
      } catch (error) {
        console.error('Error fetching timer:', error);
        // Fallback: use 7 days from now
        const fallbackDate = new Date();
        fallbackDate.setDate(fallbackDate.getDate() + 7);
        setOfferEndDate(fallbackDate);
      }
    }

    fetchTimer();
  }, []);

  const handleToggle = () => {
    setIsMonthly(!isMonthly);
  };

  const handlePayPalCheckout = async () => {
    setIsProcessing(true);
    try {
      // Call API to create PayPal order for lifetime deal
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: "39.00",
        }),
      });

      const data = await response.json();

      if (data.success && data.approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = data.approvalUrl;
      } else {
        throw new Error(data.error || "Failed to create PayPal order");
      }
    } catch (error: any) {
      console.error("PayPal checkout error:", error);
      alert("Failed to initiate PayPal checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleSubscriptionCheckout = async (planName: string) => {
    setIsProcessing(true);
    try {
      // Determine plan type based on plan name and billing period
      let planType = '';

      if (planName === 'STARTER') {
        planType = isMonthly ? 'starter_monthly' : 'starter_yearly';
      } else if (planName === 'PROFESSIONAL') {
        planType = isMonthly ? 'pro_monthly' : 'pro_yearly';
      } else {
        throw new Error('Invalid plan');
      }

      // Call API to create PayPal subscription
      const response = await fetch("/api/payment/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType,
        }),
      });

      const data = await response.json();

      if (data.success && data.approvalUrl) {
        // Redirect to PayPal for subscription approval
        window.location.href = data.approvalUrl;
      } else {
        throw new Error(data.error || "Failed to create subscription");
      }
    } catch (error: any) {
      console.error("Subscription checkout error:", error);
      alert(error.message || "Failed to initiate subscription. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <Section id="pricing" title="Pricing" subtitle="Choose the plan that's right for you">
      <div className="flex justify-center mb-10">
        <span className="mr-2 font-semibold">Monthly</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <Label>
            <Switch checked={!isMonthly} onCheckedChange={handleToggle} />
          </Label>
        </label>
        <span className="ml-2 font-semibold">Yearly</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {siteConfig.pricing.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
            }}
            className={cn(
              `rounded-2xl border-[1px] p-6 bg-white text-center flex flex-col justify-between relative h-full`,
              plan.isPopular ? "border-primary border-[2px]" : "border-gray-200"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-primary py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
                <FaStar className="text-white" />
                <span className="text-white ml-1 font-sans font-semibold">
                  Popular
                </span>
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-gray-600">
                {plan.name}
              </p>
              <p className="mt-6 flex items-center justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-gray-900">
                  {isMonthly ? plan.price : plan.yearlyPrice}
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                    / {plan.period}
                  </span>
                )}
              </p>

              <p className="text-xs leading-5 text-gray-600">
                {plan.period === "lifetime" ? "one-time payment" : isMonthly ? "billed monthly" : "billed annually"}
              </p>

              {plan.name === "LIFETIME" && offerEndDate && (
                <div className="mt-2 flex justify-center">
                  <CountdownTimer
                    endDate={offerEndDate}
                    className="bg-red-50 px-2 py-1 rounded-md"
                  />
                </div>
              )}

              <ul className="mt-5 gap-2 flex flex-col">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-4" />

              {plan.name === "LIFETIME" ? (
                <button
                  onClick={handlePayPalCheckout}
                  disabled={isProcessing}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                    }),
                    "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                    "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-white",
                    "bg-primary text-white",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleSubscriptionCheckout(plan.name)}
                  disabled={isProcessing}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                    }),
                    "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                    "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-white",
                    "bg-white text-black",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              )}
              <p className="mt-6 text-xs leading-5 text-gray-600">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
