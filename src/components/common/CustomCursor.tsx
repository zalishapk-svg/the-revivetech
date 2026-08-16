import React, { useEffect, useState } from "react";

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isSuppressed, setIsSuppressed] = useState(false);

  useEffect(() => {
    // Suppress custom cursor on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsSuppressed(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over input, textarea, select or button
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        setIsSuppressed(true);
      } else {
        setIsSuppressed(false);
      }

      if (
        target &&
        (target.closest("button") ||
          target.closest("a") ||
          target.closest("[data-cursor='hover']"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (isSuppressed) return null;

  return (
    <>
      {/* Precision center dot */}
      <div
        className="pointer-events-none fixed z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      {/* Subtle close follower ring */}
      <div
        className={`pointer-events-none fixed z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200 ease-out ${
          isHovered
            ? "h-10 w-10 border-emerald-400/80 bg-emerald-500/10 scale-110 shadow-[0_0_12px_rgba(192,254,45,0.4)]"
            : "h-6 w-6 border-emerald-500/40 bg-transparent"
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
};
