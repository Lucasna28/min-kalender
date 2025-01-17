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

export function Piratdag({
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
      {/* Havblå baggrund */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#000080] to-[#191970]" />

      {/* Pirat */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
        animate={{
          rotate: [-10, 10, -10],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        🏴‍☠️
      </motion.div>

      {/* Papegøje */}
      <motion.div
        className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
        animate={{
          y: [0, -5, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        🦜
      </motion.div>

      {/* Titel */}
      <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
        <span className="bg-[#8B4513]/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
          Arrr! {event.title}
        </span>
      </div>
    </motion.div>
  );
}
