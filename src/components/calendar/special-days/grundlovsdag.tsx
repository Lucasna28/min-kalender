"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/hooks/use-events";

interface SpecialDayProps {
  event: CalendarEvent;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export function Grundlovsdag({
  event,
  className,
  style,
  onClick,
}: SpecialDayProps) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      style={style}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Rød-hvid baggrund med gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E] to-[#FF424D]" />

      {/* Dannebrog mønster animation */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(90deg, 
              transparent 25%, 
              rgba(255,255,255,0.8) 25%, 
              rgba(255,255,255,0.8) 30%, 
              transparent 30%
            ),
            linear-gradient(0deg, 
              transparent 40%, 
              rgba(255,255,255,0.8) 40%, 
              rgba(255,255,255,0.8) 45%, 
              transparent 45%
            )
          `,
          backgroundSize: "100% 100%",
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      {/* Grundlov med glød */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        📜✨
      </motion.div>

      {/* Dannebrog der vajer */}
      <motion.div
        className="absolute left-2 top-1/2 -translate-y-1/2 text-xl"
        animate={{
          y: [0, -3, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        🇩🇰
      </motion.div>

      {/* Titel */}
      <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
        <span className="bg-white/60 px-1.5 py-0.5 rounded backdrop-blur-sm text-[#C8102E]">
          {event.title}
        </span>
      </div>
    </motion.div>
  );
}
