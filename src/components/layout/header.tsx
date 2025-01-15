"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Calendar, Moon, Sun, Bell, Plus, Menu, User } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

interface HeaderProps {
  onSidebarOpenChange?: (open: boolean) => void;
  onCreateEventOpenChange?: (open: boolean) => void;
  selectedDate?: Date;
}

export function Header({
  onSidebarOpenChange,
  onCreateEventOpenChange,
  selectedDate = new Date(),
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { supabase } = useSupabase();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/98 backdrop-blur-lg shadow-md border-b border-border/40"
          : "bg-background/95 backdrop-blur-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex h-[70px] items-center justify-between px-4 sm:px-6">
          {/* Venstre side */}
          <div className="flex items-center gap-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl hover:bg-accent/90 transition-colors active:bg-accent"
              onClick={() => onSidebarOpenChange?.(true)}
              aria-label="Åbn menu"
            >
              <Menu className="h-6 w-6" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200"
            >
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold leading-none bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                  Kalender
                </h2>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  Planlæg din dag
                </p>
              </div>
            </motion.div>

            <h2 className="text-xl font-semibold sm:hidden bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {format(selectedDate, "MMMM yyyy", { locale: da })}
            </h2>
          </div>

          {/* Højre side */}
          <div className="flex items-center gap-4">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 hidden sm:flex rounded-xl hover:bg-accent/90 transition-all duration-200 active:bg-accent"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label={
                    theme === "dark"
                      ? "Skift til lyst tema"
                      : "Skift til mørkt tema"
                  }
                >
                  <AnimatePresence mode="wait">
                    {theme === "dark" ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="h-[22px] w-[22px]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="h-[22px] w-[22px]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>

                <div className="h-11 w-11 flex items-center justify-center">
                  <NotificationDropdown />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-md shadow-primary/20 active:shadow-sm"
                  onClick={() => onCreateEventOpenChange?.(true)}
                  aria-label="Opret ny begivenhed"
                >
                  <Plus className="h-[22px] w-[22px]" />
                </motion.button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-xl hover:bg-accent/90 transition-all duration-200 active:bg-accent"
                      aria-label="Bruger menu"
                    >
                      <User className="h-[22px] w-[22px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 rounded-xl p-2"
                  >
                    <DropdownMenuLabel className="font-normal px-3 py-2.5">
                      <div className="flex flex-col space-y-2">
                        <p className="text-base font-semibold leading-none">
                          Min konto
                        </p>
                        <p className="text-sm leading-none text-muted-foreground/90">
                          {userEmail}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="opacity-50 my-2" />
                    <DropdownMenuItem
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className="sm:hidden gap-3 px-3 py-2.5 text-base focus:bg-accent/80"
                    >
                      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span>Skift tema</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 gap-3 px-3 py-2.5 text-base focus:bg-red-100 dark:focus:bg-red-950/50"
                    >
                      Log ud
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
