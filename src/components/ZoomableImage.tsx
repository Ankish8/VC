"use client";

import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ZoomableImage({
  src,
  alt = "",
  className = "",
  children,
}: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger - either custom children or default image */}
      <div
        onClick={() => setIsOpen(true)}
        className={`cursor-zoom-in group relative ${className}`}
      >
        {children}
        {/* Hover overlay with zoom indicator */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 dark:bg-black/90 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Maximize2 className="w-6 h-6 text-gray-900 dark:text-white" />
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-[10000] bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Zoom controls and info */}
            <div className="absolute top-4 left-4 z-[10000] bg-white/10 backdrop-blur-md rounded-lg p-3 text-white text-sm">
              <p className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Scroll to zoom • Drag to pan
              </p>
            </div>

            {/* Zoomable image */}
            <div
              className="w-full h-full flex items-center justify-center p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
                wheel={{ step: 0.1 }}
                doubleClick={{ mode: "reset" }}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    {/* Zoom control buttons */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[10000] flex gap-2 bg-white/10 backdrop-blur-md rounded-full p-2">
                      <button
                        onClick={() => zoomOut()}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => resetTransform()}
                        className="bg-white/20 hover:bg-white/30 rounded-full px-4 py-3 transition-colors text-white text-sm font-medium"
                        aria-label="Reset zoom"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => zoomIn()}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    <TransformComponent
                      wrapperClass="!w-full !h-full"
                      contentClass="!w-full !h-full flex items-center justify-center"
                    >
                      <motion.img
                        src={src}
                        alt={alt}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-full max-h-full object-contain select-none"
                        draggable={false}
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
