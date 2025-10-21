"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ShowcaseComparisonSlider } from "@/components/showcase/ShowcaseComparisonSlider";
import { ShowcaseThumbnailCarousel } from "@/components/showcase/ShowcaseThumbnailCarousel";
import { Icons } from "@/components/icons";
import HeroVideoDialog from "@/components/magicui/hero-video";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { handleSmoothScroll } from "@/lib/smooth-scroll";

const ease = [0.16, 1, 0.3, 1];

interface ShowcaseImage {
  id: string;
  rasterImageUrl: string;
  svgUrl: string;
  filename: string;
  displayOrder: number;
}

function HeroPriceDropBanner() {
  return (
    <motion.div
      className="mb-6 flex items-center justify-center gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease }}
    >
      <span className="rounded-md bg-red-600 px-3 py-1 text-sm font-bold text-white">
        PRICE DROP
      </span>
      <span className="text-lg text-gray-600">
        From <s className="text-gray-500">$295</s> - <span className="font-bold text-gray-900">$39 Only</span>
      </span>
    </motion.div>
  );
}

function HeroTitles() {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <motion.h1 
        className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-center"
        initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          ease,
        }}
      >
        Convert <span className="aurora-text">Raster Images</span><br />
        Into <span className="aurora-text">Vector Images</span>
      </motion.h1>
      <motion.p 
        className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.6,
          duration: 0.8,
          ease,
        }}
      >
        Transform JPG and JPEG images into crisp SVG and EPS vectors instantly with our{" "}
        <span className="line-shadow-text italic font-semibold" data-text="AI">AI</span>{" "}
        <span className="line-shadow-text italic font-semibold" data-text="powered">powered</span>{" "}
        professional conversion technology.
      </motion.p>
    </div>
  );
}

function HeroCTA() {
  return (
    <>
      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease }}
      >
        <Link
          href="#pricing"
          onClick={handleSmoothScroll}
          className="rainbow-button"
        >
          BUY NOW
        </Link>
        <Link
          href="/login"
          className="shiny-button"
        >
          Login
        </Link>
      </motion.div>
      <motion.p
        className="text-sm text-gray-600 flex items-center justify-center gap-2 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        <span>One-time payment • Lifetime access</span>
      </motion.p>
    </>
  );
}

function HeroImage() {
  const [showcaseImages, setShowcaseImages] = useState<ShowcaseImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch showcase images from API
    fetch("/api/showcase")
      .then((res) => res.json())
      .then((data) => {
        if (data.showcaseImages && data.showcaseImages.length > 0) {
          setShowcaseImages(data.showcaseImages);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch showcase images:", error);
        setIsLoading(false);
      });
  }, []);

  // If no showcase images, show nothing (or you could show a placeholder)
  if (isLoading) {
    return (
      <motion.div
        className="relative mx-auto flex w-full items-center justify-center px-4 md:px-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1, ease }}
      >
        <div className="w-full max-w-5xl h-[600px] flex items-center justify-center bg-muted/20 rounded-2xl">
          <p className="text-muted-foreground">Loading showcase...</p>
        </div>
      </motion.div>
    );
  }

  if (showcaseImages.length === 0) {
    return null;
  }

  const selectedImage = showcaseImages[selectedIndex];

  return (
    <motion.div
      className="relative mx-auto flex w-full flex-col gap-6 items-center justify-center px-4 md:px-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 1, ease }}
    >
      {/* Main Comparison Slider */}
      <div className="w-full max-w-4xl bg-gray-100 rounded-lg overflow-hidden shadow-sm" style={{ height: "550px" }}>
        <ShowcaseComparisonSlider
          rasterImageUrl={selectedImage.rasterImageUrl}
          svgUrl={selectedImage.svgUrl}
          filename={selectedImage.filename}
          className="w-full h-full"
        />
      </div>

      {/* Thumbnail Carousel */}
      {showcaseImages.length > 1 && (
        <div className="w-full max-w-4xl mt-8">
          <ShowcaseThumbnailCarousel
            images={showcaseImages}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        </div>
      )}
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="py-12 md:py-20 bg-white" style={{ marginTop: '64px' }}>
      <div className="relative flex w-full flex-col items-center justify-start px-4 pt-8 sm:px-6 sm:pt-12 md:pt-16 lg:px-8 max-w-7xl mx-auto">
        <HeroPriceDropBanner />
        <HeroTitles />
        <HeroCTA />
        <HeroImage />
      </div>
    </section>
  );
}
