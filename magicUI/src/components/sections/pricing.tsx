"use client";

import Section from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { siteConfig } from "@/lib/config";
import useWindowSize from "@/lib/hooks/use-window-size";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { CountdownTimer } from "@/components/ui/countdown-timer";

export default function PricingSection() {
  const [isMonthly, setIsMonthly] = useState(true);
  const { isDesktop } = useWindowSize();

  // Set countdown to 7 days from now
  const offerEndDate = new Date();
  offerEndDate.setDate(offerEndDate.getDate() + 7);

  const handleToggle = () => {
    setIsMonthly(!isMonthly);
  };

  return (
    <Section title="Pricing" subtitle="Choose the plan that's right for you">
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

              {plan.name === "LIFETIME" && (
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

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-white",
                  plan.isPopular
                    ? "bg-primary text-white"
                    : "bg-white text-black"
                )}
              >
                {plan.buttonText}
              </Link>
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
