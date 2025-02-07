"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Plus,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  LucideIcon,
  Grid,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { CreateCalendarDialog } from "@/components/calendar/create-calendar-dialog";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { CalendarViewType } from "@/components/calendar/calendar-view";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { EditCalendarDialog } from "@/components/calendar/edit-calendar-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarSection,
  SidebarOverlay,
} from "@/components/ui/sidebar";

import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { da } from "date-fns/locale";
import { useClickOutside } from "@/hooks/use-click-outside";

interface Calendar {
  id: string;
  name: string;
  color: string;
  type?: string;
  user_id: string;
  created_at: string;
}

interface SidebarProps {
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  visibleCalendarIds: string[];
  onVisibleCalendarIdsChange: (ids: string[]) => void;
  selectedCalendarId: string | null;
  onSelectedCalendarIdChange: (id: string | null) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  showHolidays?: boolean;
  onShowHolidaysChange?: (show: boolean) => void;
  handlePrint: () => void;
}

const VIEW_OPTIONS: Record<
  CalendarViewType,
  { icon: LucideIcon; label: string }
> = {
  day: { icon: Sun, label: "Dag" },
  week: { icon: CalendarRange, label: "Uge" },
  month: { icon: Grid, label: "Måned" },
  year: { icon: CalendarDays, label: "År" },
};

export default function CalendarSidebar({
  view,
  onViewChange,
  selectedDate,
  onDateChange,
  visibleCalendarIds,
  onVisibleCalendarIdsChange,
  selectedCalendarId,
  onSelectedCalendarIdChange,
  isOpen,
  onOpenChange,
  showHolidays = true,
  onShowHolidaysChange = () => {},
  handlePrint,
}: SidebarProps) {
  const [isCreateCalendarOpen, setIsCreateCalendarOpen] = useState(false);
  const [selectedCalendarForEdit, setSelectedCalendarForEdit] =
    useState<Calendar | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const { supabase } = useSupabase();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [printView, setPrintView] = useState<"day" | "week" | "month">("month");
  const sidebarRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    sidebarRef,
    () => {
      if (isOpen) {
        onOpenChange(false);
      }
    },
    isOpen
  );

  useEffect(() => {
    const getUserEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUserEmail();
  }, [supabase.auth]);

  const fetchCalendars = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("Ingen bruger fundet");
        return;
      }

      // Hent kalendere fra accessible_calendars view
      const { data: allCalendars, error } = await supabase
        .from("accessible_calendars")
        .select("*");

      if (error) {
        console.error("Fejl ved hentning af kalendere:", error);
        return;
      }

      setCalendars(allCalendars || []);

      if (
        visibleCalendarIds.length === 0 &&
        allCalendars &&
        allCalendars.length > 0
      ) {
        onVisibleCalendarIdsChange(allCalendars.map((calendar) => calendar.id));
      }
    } catch (error) {
      console.error("Fejl i fetchCalendars:", error);
    }
  }, [supabase, visibleCalendarIds, onVisibleCalendarIdsChange]);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  const toggleCalendarVisibility = (
    calendarId: string,
    isCurrentlyVisible: boolean
  ) => {
    if (isCurrentlyVisible) {
      onVisibleCalendarIdsChange(
        visibleCalendarIds.filter((id) => id !== calendarId)
      );
    } else {
      onVisibleCalendarIdsChange([...visibleCalendarIds, calendarId]);
    }
  };

  const handleCalendarClick = (calendarId: string) => {
    onSelectedCalendarIdChange(
      selectedCalendarId === calendarId ? null : calendarId
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const goToToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  const goToPreviousDate = useCallback(() => {
    const newDate = new Date(selectedDate);
    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "year":
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    onDateChange(newDate);
  }, [selectedDate, view, onDateChange]);

  const goToNextDate = useCallback(() => {
    const newDate = new Date(selectedDate);
    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "year":
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    onDateChange(newDate);
  }, [selectedDate, view, onDateChange]);

  useEffect(() => {
    // Opdater tiden til nærmeste minut
    const now = new Date();
    setCurrentTime(now);

    // Beregn millisekunder til næste minut
    const msToNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // Vent til næste minut før vi starter interval
    const initialTimeout = setTimeout(() => {
      setCurrentTime(new Date());

      // Start interval der opdaterer hvert minut
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // 60000 ms = 1 minut

      // Cleanup interval når komponenten unmountes
      return () => clearInterval(timer);
    }, msToNextMinute);

    // Cleanup initial timeout hvis komponenten unmountes før første minut
    return () => clearTimeout(initialTimeout);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "t") {
        goToToday();
      } else if (e.key === "ArrowLeft" && !e.repeat) {
        goToPreviousDate();
      } else if (e.key === "ArrowRight" && !e.repeat) {
        goToNextDate();
      } else if (e.key === "n" && !e.repeat) {
        setIsCreateCalendarOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToToday, goToPreviousDate, goToNextDate]);

  const handlePrintClick = () => {
    onViewChange(printView);
    handlePrint();
  };

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    // Skift til dagvisning når en specifik dato vælges
    onViewChange("day");
  };

  return (
    <div ref={sidebarRef} className="h-full">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <SidebarOverlay
              data-state={isOpen ? "open" : "closed"}
              onClick={() => onOpenChange(false)}
              className="bg-background/80 backdrop-blur-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "border-r bg-background/95 backdrop-blur-xl w-[280px] flex flex-col",
          "transition-all duration-200 ease-out",
          "shadow-lg shadow-background/5",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarHeader className="border-b px-3 py-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm ring-1 ring-primary/5 group-hover:ring-primary/10 transition-all">
                <CalendarIcon className="h-4 w-4 text-primary group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <h2 className="text-sm font-medium tracking-tight group-hover:text-primary transition-colors">
                  Min Kalender
                </h2>
                <p className="text-[11px] text-muted-foreground/70 font-medium tabular-nums">
                  {currentTime.toLocaleTimeString("da-DK", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <div className="flex items-center gap-0.5 px-1.5 py-1 border-b flex-shrink-0 group">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors relative overflow-hidden"
            onClick={() => setIsCreateCalendarOpen(true)}
          >
            <span className="relative z-10 flex items-center">
              <Plus className="h-3 w-3 mr-1" />
              Opret ny kalender
            </span>
            <span className="absolute inset-0 bg-primary/5 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
          </Button>
          <div className="flex items-center gap-0.5 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={goToToday}
            >
              I dag
            </Button>
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={goToPreviousDate}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={goToNextDate}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <SidebarContent className="p-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {/* Mini kalender */}
          <div className="px-2 py-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousDate}
                    className="h-7 w-7"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={goToToday}
                    className="h-7 text-xs px-2"
                  >
                    I dag
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextDate}
                    className="h-7 w-7"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && handleDateSelect(date)}
                  className="w-full"
                  locale={da}
                  showOutsideDays={true}
                  classNames={{
                    months: "space-y-0",
                    month: "space-y-2",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell:
                      "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: cn(
                      "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50",
                      "[&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-outside)]:text-muted-foreground [&:has([aria-selected].day-outside)]:opacity-50"
                    ),
                    day: cn(
                      "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                      "hover:bg-accent hover:text-accent-foreground rounded-full transition-colors"
                    ),
                    day_selected: cn(
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      "rounded-full"
                    ),
                    day_today: cn(
                      "bg-accent text-accent-foreground",
                      "rounded-full"
                    ),
                    day_outside: cn(
                      "text-muted-foreground/50",
                      "hover:bg-accent/50 hover:text-accent-foreground/50"
                    ),
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                  components={{
                    IconLeft: ({ ...props }) => (
                      <ChevronLeft className="h-4 w-4" {...props} />
                    ),
                    IconRight: ({ ...props }) => (
                      <ChevronRight className="h-4 w-4" {...props} />
                    ),
                  }}
                />
              </div>

              {/* Visningsindstillinger */}
              <div className="px-2 py-1.5 border-b">
                <h3 className="text-[11px] font-medium mb-1.5 px-1.5 text-muted-foreground/70 uppercase tracking-wider">
                  Visning
                </h3>
                <div className="space-y-0.5">
                  {Object.entries(VIEW_OPTIONS).map(
                    ([key, { icon: Icon, label }]) => (
                      <Button
                        key={key}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start h-7 px-1.5 text-xs transition-colors",
                          "hover:bg-primary/10 hover:text-primary",
                          view === key &&
                            "bg-primary/10 text-primary font-medium"
                        )}
                        onClick={() => onViewChange(key as CalendarViewType)}
                      >
                        <Icon className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                        {label}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Kalenderliste */}
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between mb-1.5 px-1.5">
                  <h3 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                    Mine Kalendere
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setIsCreateCalendarOpen(true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    {calendars
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((calendar) => {
                        const isVisible = visibleCalendarIds.includes(
                          calendar.id
                        );
                        const isSelected = selectedCalendarId === calendar.id;

                        return (
                          <div
                            key={calendar.id}
                            className={cn(
                              "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary",
                              isSelected && "bg-primary/10 text-primary"
                            )}
                            onClick={() => handleCalendarClick(calendar.id)}
                          >
                            <Checkbox
                              checked={isVisible}
                              onCheckedChange={() =>
                                toggleCalendarVisibility(calendar.id, isVisible)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="data-[state=checked]:bg-[var(--calendar-color)] data-[state=checked]:border-[var(--calendar-color)]"
                              style={
                                {
                                  "--calendar-color": calendar.color,
                                } as React.CSSProperties
                              }
                            />
                            <span className="flex-1 truncate">
                              {calendar.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCalendarForEdit(calendar);
                              }}
                            >
                              <Settings className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              <SidebarSection title="Helligdage">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium">
                    <Checkbox
                      checked={showHolidays}
                      onCheckedChange={(checked) => {
                        if (typeof onShowHolidaysChange === "function") {
                          onShowHolidaysChange(!!checked);
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>Helligdage</span>
                    </div>
                  </div>
                </div>
              </SidebarSection>
            </div>
          </div>

          <SidebarSection title="Print sektion">
            <div className="space-y-2">
              <Select
                value={printView}
                onValueChange={(value: "day" | "week" | "month") =>
                  setPrintView(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vælg visning" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dag</SelectItem>
                  <SelectItem value="week">Uge</SelectItem>
                  <SelectItem value="month">Måned</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePrintClick}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Print{" "}
                {printView === "day"
                  ? "dag"
                  : printView === "week"
                  ? "uge"
                  : "måned"}
              </Button>
            </div>
          </SidebarSection>
        </SidebarContent>

        <Separator className="my-4" />

        <SidebarFooter className="border-t flex-shrink-0">
          <div className="p-2 space-y-2">
            <div className="px-2 py-1.5 rounded-md bg-muted/50 ring-1 ring-muted hover:ring-primary/20 transition-colors group">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="relative flex h-2 w-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-110 transition-transform"></div>
                  <div className="absolute h-2 w-2 rounded-full bg-green-500 animate-ping group-hover:animate-ping-fast"></div>
                </div>
                <p className="text-[11px] text-muted-foreground/70 font-medium group-hover:text-muted-foreground/90 transition-colors">
                  Online
                </p>
              </div>
              <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                {userEmail}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 px-2 hover:bg-destructive/10 hover:text-destructive transition-colors group"
              onClick={handleLogout}
            >
              <LogOut className="h-3 w-3 mr-1.5 group-hover:scale-110 transition-transform" />
              <span>Log ud</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <CreateCalendarDialog
        isOpen={isCreateCalendarOpen}
        onOpenChange={setIsCreateCalendarOpen}
        onCalendarCreated={fetchCalendars}
      />

      {selectedCalendarForEdit && (
        <EditCalendarDialog
          calendar={selectedCalendarForEdit}
          isOpen={!!selectedCalendarForEdit}
          onOpenChange={(open) => !open && setSelectedCalendarForEdit(null)}
          onCalendarUpdated={fetchCalendars}
        />
      )}
    </div>
  );
}
