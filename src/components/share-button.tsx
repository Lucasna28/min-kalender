"use client";

import { Share } from "lucide-react";
import { motion } from "framer-motion";
import { vibrate } from "@/lib/haptics";
import type { CalendarEvent } from "@/hooks/use-events";

interface ShareButtonProps {
  event: CalendarEvent;
}

export function ShareButton({ event }: ShareButtonProps) {
  const handleShare = async () => {
    vibrate(50);

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `${event.title} - ${format(
            new Date(event.start_date),
            "d. MMMM yyyy",
            { locale: da }
          )}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  // Kun vis knappen hvis Web Share API er tilgængelig
  if (!navigator.share) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className="p-2 hover:bg-accent rounded-full touch-manipulation"
    >
      <Share className="h-5 w-5" />
    </motion.button>
  );
}
