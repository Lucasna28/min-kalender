"use client";

import { Menu } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="lg:hidden p-2 hover:bg-accent rounded-md"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Åbn menu</span>
        </motion.button>

        <div className="flex flex-1 items-center justify-between">
          <nav className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Min Kalender</h1>
          </nav>
        </div>
      </div>
    </header>
  );
}
