import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";

interface OffCanvasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "right";
  children: React.ReactNode;
}

export const OffCanvasDrawer: React.FC<OffCanvasDrawerProps> = ({
  isOpen,
  onClose,
  title = "Filter & Categories",
  side = "left",
  children,
}) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-label="Close panel overlay"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Slide-In Drawer */}
          <motion.div
            initial={{ x: side === "left" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "left" ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className={`fixed top-0 ${
              side === "left" ? "left-0 border-r" : "right-0 border-l"
            } bottom-0 z-50 w-full sm:w-[360px] max-w-full bg-[#05140b] border-emerald-900/60 shadow-2xl flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden`}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-emerald-900/60 bg-[#030e07] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider font-mono">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <span>{title}</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close filters"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-950/80 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 min-h-0">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
