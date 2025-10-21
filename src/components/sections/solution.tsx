"use client";

import FlickeringGrid from "@/components/magicui/flickering-grid";
import Ripple from "@/components/magicui/ripple";
import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Cpu, Zap, Sparkles, Target, Layers, Settings } from "lucide-react";

const featureIcons = {
  cpu: Cpu,
  zap: Zap,
  sparkles: Sparkles,
  target: Target,
  layers: Layers,
  settings: Settings,
};

const features = [
  {
    title: "Simply the Best Autotracer in the World",
    description:
      "Don't settle for mediocre results. VectorCraft outperforms every competitor with revolutionary AI technology that delivers perfect vectors every single time. Used by professionals who demand excellence.",
    icon: "sparkles",
    className: "hover:bg-purple-500/10 transition-all duration-500 ease-out",
    content: null,
  },
  {
    title: "Professional Results in One Click",
    description:
      "No technical skills required. No complex settings. Just upload your image and get stunning, professional-grade vectors instantly. Even complete beginners create expert-level results on their first try.",
    icon: "zap",
    className: "hover:bg-blue-500/10 transition-all duration-500 ease-out",
    content: null,
  },
  {
    title: "2x Faster Than Illustrator",
    description:
      "Skip Adobe Illustrator's tedious Image Trace cleanup and manual pen tool refinements. VectorCraft delivers production-ready vectors instantly - no time-consuming anchor point adjustments or path cleanup required.",
    icon: "target",
    className:
      "md:row-span-2 hover:bg-orange-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <FlickeringGrid
          className="z-0 absolute inset-0 [mask:radial-gradient(circle_at_center,#fff_400px,transparent_0)]"
          squareSize={4}
          gridGap={6}
          color="#000"
          maxOpacity={0.1}
          flickerChance={0.1}
          height={800}
          width={800}
        />
        <div className="relative z-10 mt-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-2 h-2 w-2 rounded-full bg-orange-500 flex-shrink-0"></div>
            <p className="text-gray-800 leading-relaxed">No manual anchor point adjustments needed</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-2 h-2 w-2 rounded-full bg-orange-500 flex-shrink-0"></div>
            <p className="text-gray-800 leading-relaxed">Better results than Illustrator's Image Trace</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-2 h-2 w-2 rounded-full bg-orange-500 flex-shrink-0"></div>
            <p className="text-gray-800 leading-relaxed">Skip the pen tool - AI does the heavy lifting</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-2 h-2 w-2 rounded-full bg-orange-500 flex-shrink-0"></div>
            <p className="text-gray-800 leading-relaxed">Perfect paths without endless tweaking</p>
          </div>
        </div>
      </>
    ),
  },
  {
    title: "Print-Ready Vector Quality",
    description:
      "Perfect for business cards, billboards, t-shirts, and everything in between. Our vectors scale infinitely without quality loss, ensuring your designs look crisp at any size. Professional print shops love our output.",
    icon: "settings",
    className:
      "md:col-span-2 hover:bg-green-500/10 transition-all duration-500 ease-out",
    content: (
      <Ripple className="absolute -bottom-full" />
    ),
  },
];

export default function Component() {
  return (
    <Section
      title="Advanced Features"
      subtitle="Professional Vector Conversion Technology"
      description="Experience the world's most advanced vectorization engine. Our AI-powered platform delivers professional-grade results with breakthrough technology that sets new industry standards."
      className="bg-neutral-100"
    >
      <div className="mx-auto mt-16 grid max-w-sm grid-cols-1 gap-6 text-gray-500 md:max-w-3xl md:grid-cols-2 xl:max-w-6xl xl:auto-rows-fr xl:grid-cols-3">
        {features.map((feature, index) => {
          const IconComponent = featureIcons[feature.icon as keyof typeof featureIcons];
          return (
            <motion.div
              key={index}
              className={cn(
                "group relative items-start overflow-hidden bg-neutral-50 p-6 rounded-2xl",
                feature.className
              )}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                damping: 30,
                delay: index * 0.1,
              }}
              viewport={{ once: true }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-primary">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-800 leading-relaxed">{feature.description}</p>
              </div>
              {feature.content}
              <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-neutral-50 pointer-events-none"></div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
