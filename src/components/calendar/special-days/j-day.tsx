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

export function JDay({ event, className, style, onClick }: SpecialDayProps) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      style={style}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Blå Tuborg baggrund */}
      <div className="absolute inset-0 bg-[#4169E1]" />

      {/* Snefnug animation */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "12px 12px"],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Øl */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
        animate={{
          rotate: [-10, 10, -10],
          y: [0, -2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        🍺
      </motion.div>

      {/* Julemand */}
      <motion.div
        className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        🎅
      </motion.div>

      {/* Titel */}
      <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
        <span className="bg-white/60 px-1.5 py-0.5 rounded text-[#4169E1]">
          {event.title}
        </span>
      </div>
    </motion.div>
  );
}
