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

export function MortensAften({
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
      {/* Mørk efterårsaften baggrund */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513] to-[#2F4F4F]" />

      {/* Blade der falder */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(139, 69, 19, 0.4) 2px, transparent 2px)",
          backgroundSize: "24px 24px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "24px 24px"],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Gås */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
        animate={{
          rotate: [-10, 10, -10],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        🦢
      </motion.div>

      {/* Lanterne med lys */}
      <motion.div
        className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        🏮✨
      </motion.div>

      {/* Titel */}
      <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
        <span className="bg-[#D2691E]/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {event.title}
        </span>
      </div>
    </motion.div>
  );
}
