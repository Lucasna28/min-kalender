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

export function Paaske({ event, className, style, onClick }: SpecialDayProps) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      style={style}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Forårsbaggrund med gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF4B8] to-[#FFE5B4]" />

      {/* Påskeblomster animation */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 223, 0, 0.2) 2px, transparent 2px)",
          backgroundSize: "24px 24px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "24px 24px"],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Påskeæg der ruller */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
        animate={{
          rotate: [-20, 20, -20],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        🥚✨
      </motion.div>

      {/* Hoppende påskehare */}
      <motion.div
        className="absolute left-2 top-1/2 -translate-y-1/2 text-xl"
        animate={{
          y: [0, -8, 0],
          scale: [1, 1.1, 1],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        🐰
      </motion.div>

      {/* Titel */}
      <div className="relative px-2 py-1 text-black font-medium flex justify-center items-center min-h-[2rem]">
        <span className="bg-white/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {event.title}
        </span>
      </div>
    </motion.div>
  );
}
