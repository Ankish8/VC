"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MagnifierImageProps {
  src: string;
  alt?: string;
  className?: string;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
  children?: React.ReactNode;
}

export function MagnifierImage({
  src,
  alt = "",
  className = "",
  magnifierHeight = 200,
  magnifierWidth = 200,
  zoomLevel = 2.5,
  children,
}: MagnifierImageProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const imgRef = useRef<HTMLDivElement>(null);

  const mouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setSize([width, height]);
    setShowMagnifier(true);
  };

  const mouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();

    // Calculate cursor position on the image
    const x = e.pageX - left - window.pageXOffset;
    const y = e.pageY - top - window.pageYOffset;
    setXY([x, y]);
  };

  const mouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={mouseEnter}
      onMouseMove={mouseMove}
      onMouseLeave={mouseLeave}
    >
      {/* Original Content (Safari component or image) */}
      <div className="w-full h-full">
        {children || <img src={src} alt={alt} className="w-full h-full object-contain" />}
      </div>

      {/* Magnifier Lens */}
      <AnimatePresence>
        {showMagnifier && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: "absolute",
              pointerEvents: "none",
              height: `${magnifierHeight}px`,
              width: `${magnifierWidth}px`,
              top: `${y - magnifierHeight / 2}px`,
              left: `${x - magnifierWidth / 2}px`,
              opacity: 1,
              border: "4px solid rgba(255, 255, 255, 0.9)",
              backgroundColor: "white",
              backgroundImage: `url('${src}')`,
              backgroundRepeat: "no-repeat",
              borderRadius: "50%",
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
              zIndex: 50,
              // Calculate background position
              backgroundSize: `${imgWidth * zoomLevel}px ${
                imgHeight * zoomLevel
              }px`,
              backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
              backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
            }}
          >
            {/* Lens reflection effect */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)",
              }}
            />
            {/* Magnifier frame shadow */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.1)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cursor hint when hovering */}
      <AnimatePresence>
        {showMagnifier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full pointer-events-none z-40"
          >
            Move cursor to magnify
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
