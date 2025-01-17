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

export function FarsDag({ event, className, style, onClick }: SpecialDayProps) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      style={style}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Mørkeblå baggrund */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#000080] to-[#4169E1]" />

      {/* Stjerner/glimmer animation */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "20px 20px"],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Værktøj animation */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
        animate={{
          rotate: [-20, 20, -20],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        🔧🛠️
      </motion.div>

      {/* Slips og gave */}
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
        👔🎁
      </motion.div>

      {/* Titel */}
      <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
        <span className="bg-[#000080]/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {event.title}
        </span>
      </div>
    </motion.div>
  );
}
