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

export function MorsDag({ event, className, style, onClick }: SpecialDayProps) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      style={style}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Blød rosa baggrund */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFB6C1] to-[#FF69B4]" />

      {/* Blomsterblade animation */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 192, 203, 0.4) 2px, transparent 2px)",
          backgroundSize: "16px 16px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "16px 16px"],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Hjerte og gave */}
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
        ❤️🎁
      </motion.div>

      {/* Blomsterbuket */}
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
        💐
      </motion.div>

      {/* Titel */}
      <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
        <span className="bg-[#FF1493]/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {event.title}
        </span>
      </div>
    </motion.div>
  );
}
