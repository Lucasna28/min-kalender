"use client";

import { Menu, ArrowUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { getWeekNumber } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenSidebar: () => void;
  currentDate?: Date;
}

export function Header({
  onOpenSidebar,
  currentDate = new Date(),
}: HeaderProps) {
  const weekNumber = getWeekNumber(currentDate);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/95 backdrop-blur",
        "supports-[backdrop-filter]:bg-background/60",
        "pt-[env(safe-area-inset-top)]"
      )}
    >
      <div className="flex h-12 sm:h-16 items-center gap-2 sm:gap-4 px-2 sm:px-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 sm:p-3 hover:bg-accent rounded-full -ml-1 sm:-ml-2 touch-manipulation"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="sr-only">Åbn menu</span>
        </motion.button>

        <div className="flex flex-1 items-center justify-between">
          <nav className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-base sm:text-xl font-semibold">Min Kalender</h1>
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Uge {weekNumber}</span>
            </div>
          </nav>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <div className="flex sm:hidden items-center px-1.5 py-0.5 bg-muted rounded">
              <span className="text-xs font-medium">Uge {weekNumber}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-1.5 sm:p-2 hover:bg-accent rounded-full touch-manipulation md:hidden"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
