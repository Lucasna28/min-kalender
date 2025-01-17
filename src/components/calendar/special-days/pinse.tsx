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

export function Pinse({ event, className, style, onClick }: SpecialDayProps) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      style={style}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Gylden baggrund med solstråler */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00]" />

      {/* Lysende stråler animation */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(
              circle at 50% 50%,
              rgba(255, 255, 255, 0.3) 0%,
              transparent 60%
            )
          `,
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Helligåndsild */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [-10, 10, -10],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        🔥✨
      </motion.div>

      {/* Flyvende due */}
      <motion.div
        className="absolute left-2 top-1/2 -translate-y-1/2 text-xl"
        animate={{
          y: [0, -8, 0],
          x: [0, 4, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        🕊️
      </motion.div>

      {/* Titel */}
      <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
        <span className="bg-[#B8860B]/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {event.title}
        </span>
      </div>
    </motion.div>
  );
}
