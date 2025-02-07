"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { vibrate } from "@/lib/haptics";

interface TodayButtonProps {
  onClick: () => void;
  show: boolean;
}

export function TodayButton({ onClick, show }: TodayButtonProps) {
  const handleClick = () => {
    vibrate(50);
    onClick();
  };

  if (!show) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed right-4 bottom-20 md:bottom-4 bg-primary text-primary-foreground 
                 px-4 py-2 rounded-full shadow-lg hover:bg-primary/90 
                 touch-manipulation z-50 print:hidden"
    >
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span className="text-sm font-medium">I dag</span>
      </div>
    </motion.button>
  );
}
