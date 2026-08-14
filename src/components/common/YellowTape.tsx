import React from "react";

interface YellowTapeProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
  tapeClassName?: string;
}

export const YellowTape: React.FC<YellowTapeProps> = ({
  children,
  text,
  className = "",
  tapeClassName = "",
}) => {
  const content = children ?? text;
  return (
    <span className={`relative inline-block px-2 py-0.5 z-0 ${className}`}>
      {/* Editorial Yellow Highlight Tape shape behind text */}
      <span
        className={`absolute inset-0 -z-10 -rotate-1 rounded-sm bg-amber-300 opacity-90 shadow-sm transition-transform duration-300 hover:rotate-0 hover:scale-[1.02] ${tapeClassName}`}
        style={{
          clipPath: "polygon(2% 0%, 98% 2%, 100% 98%, 0% 95%)",
        }}
      />
      <span className="relative z-10 font-black text-slate-950 dark:text-slate-950">
        {content}
      </span>
    </span>
  );
};
