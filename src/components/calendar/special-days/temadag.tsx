"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/hooks/use-events";

interface SpecialDayProps {
  event: CalendarEvent;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  theme: "chocolate" | "beer" | "dance";
}

const themeConfig = {
  chocolate: {
    bg: "#8B4513",
    icon1: "🍫",
    icon2: "🎂",
    textBg: "#D2691E",
  },
  beer: {
    bg: "#FFD700",
    icon1: "🍺",
    icon2: "🍻",
    textBg: "#DAA520",
  },
  dance: {
    bg: "#FF69B4",
    icon1: "💃",
    icon2: "🕺",
    textBg: "#FF1493",
  },
} as const;

export function Temadag({
  event,
  className,
  style,
  onClick,
  theme,
}: SpecialDayProps) {
  const config = themeConfig[theme];

  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      style={style}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Baggrund */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: config.bg }}
      />

      {/* Første ikon */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [-10, 10, -10],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        {config.icon1}
      </motion.div>

      {/* Andet ikon */}
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
        {config.icon2}
      </motion.div>

      {/* Titel */}
      <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
        <span
          className="px-1.5 py-0.5 rounded backdrop-blur-sm"
          style={{ backgroundColor: `${config.textBg}99` }}
        >
          {event.title}
        </span>
      </div>
    </motion.div>
  );
}
