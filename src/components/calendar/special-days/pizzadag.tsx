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

export function Pizzadag({
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
      {/* Pizza-farvet baggrund */}
      <div className="absolute inset-0 bg-[#FFA500]" />

      {/* Flyvende pizza slice */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
        animate={{
          x: [-20, 20, -20],
          y: [-5, 5, -5],
          rotate: [0, 360],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      >
        🍕
      </motion.div>

      {/* Krydderi drys */}
      <motion.div
        className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        🌿
      </motion.div>

      {/* Titel */}
      <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
        <span className="bg-[#FF4500]/60 px-1.5 py-0.5 rounded truncate block text-xs sm:text-sm">
          {event.title}
        </span>
      </div>
    </motion.div>
  );
}
