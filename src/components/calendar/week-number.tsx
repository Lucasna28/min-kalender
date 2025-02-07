"use client";

import { motion } from "framer-motion";
import { getWeekNumber } from "@/lib/date-utils";

interface WeekNumberProps {
  date: Date;
  onClick?: () => void;
}

export function WeekNumber({ date, onClick }: WeekNumberProps) {
  const weekNumber = getWeekNumber(date);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed left-4 bottom-20 md:bottom-4 bg-muted/90 backdrop-blur-sm 
                 text-muted-foreground px-3 py-2 rounded-full shadow-lg 
                 hover:bg-accent touch-manipulation z-50 print:hidden"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium">UGE</span>
        <span className="text-base font-bold">{weekNumber}</span>
      </div>
    </motion.button>
  );
}
