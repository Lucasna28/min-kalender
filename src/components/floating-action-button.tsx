"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { vibrate } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const handleClick = () => {
    vibrate(50);
    onClick();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={cn(
        "fixed right-4 bottom-4 p-4",
        "bg-primary text-primary-foreground rounded-full shadow-lg",
        "md:hidden touch-manipulation",
        "mb-[env(safe-area-inset-bottom)]"
      )}
    >
      <Plus className="h-6 w-6" />
    </motion.button>
  );
}
