"use client";

import { useState, useEffect, useRef } from "react";
import CalendarView from "@/components/calendar/calendar-view";
import CalendarSidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Plus,
  Calendar,
  Bell,
  Sun,
  Moon,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { useTheme } from "next-themes";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProfileSettingsDialog } from "@/components/profile/profile-settings-dialog";
import { NotificationsDialog } from "@/components/notifications/notifications-dialog";
import { NotificationsListDialog } from "@/components/notifications/notifications-list-dialog";
import { TutorialDialog } from "@/components/tutorial/tutorial-dialog";
import { useReactToPrint } from "react-to-print";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEvents } from "@/hooks/use-events";
import type { CalendarViewType } from "@/components/calendar/calendar-view";
import { RealtimeChannel } from "@supabase/supabase-js";
import { VIEW_OPTIONS } from "@/lib/constants";

export default function CalendarPage() {
  const { supabase, session } = useSupabase();
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<string[]>([]);
  const { events, updateEvent, deleteEvent } = useEvents(visibleCalendarIds);
  const [view, setView] = useState<CalendarViewType>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [showHolidays, setShowHolidays] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsSettingsOpen, setIsNotificationsSettingsOpen] =
    useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialProgress, setTutorialProgress] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handlePrint = useReactToPrint({
    documentTitle: `Kalender - ${format(selectedDate, "MMMM yyyy", {
      locale: da,
    })}`,
    contentRef: calendarRef,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0.5cm;
      }
      @media print {
        html, body {
          width: 297mm;
          height: 210mm;
          margin: 0;
          padding: 0;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .calendar-content {
          width: 100%;
          height: 100%;
          page-break-inside: avoid;
        }
        .calendar-grid {
          height: 180mm !important;
          margin: 0 !important;
          padding: 0.5cm !important;
        }
        .navigation, .no-print {
          display: none !important;
        }
        td {
          height: 100px !important;
          border: 1px solid #e5e7eb !important;
        }
        th {
          padding: 8px !important;
          border: 1px solid #e5e7eb !important;
          background-color: #f9fafb !important;
        }
      }
    `,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkNewUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("has_completed_tutorial")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile || profile.has_completed_tutorial === null) {
          setShowTutorial(true);
          setTutorialProgress(0);
        } else {
          setTutorialProgress(profile.has_completed_tutorial ? 100 : 25);
        }

        setUserEmail(user.email ?? null);
      } catch (error) {
        console.error("Fejl ved tjek af ny bruger:", error);
        toast.error("Der opstod en fejl ved indlæsning af brugerdata");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkNewUser();
  }, [supabase, router]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) return;

        const { count, error: countError } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false);

        if (countError) throw countError;

        setUnreadCount(count || 0);
      } catch (error) {
        console.error("Fejl ved hentning af ulæste notifikationer:", error);
        toast.error("Der opstod en fejl ved indlæsning af notifikationer");
      }
    };

    fetchUnreadCount();

    let channel: RealtimeChannel;
    try {
      channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
          } else if (status === "CLOSED") {
          } else if (status === "CHANNEL_ERROR") {
            console.error("Fejl i notifikations channel");
            toast.error("Der opstod en fejl med notifikationer");
          }
        });
    } catch (error) {
      console.error(
        "Fejl ved oprettelse af notifikations subscription:",
        error
      );
      toast.error("Der opstod en fejl med notifikationer");
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  useEffect(() => {
    const fetchCalendars = async () => {
      if (!session?.user?.id) {
        return;
      }

      try {
        // Hent både brugerens egne kalendere og delte kalendere
        const [ownCalendarsResponse, sharedCalendarsResponse] =
          await Promise.all([
            // Egne kalendere
            supabase
              .from("calendars")
              .select("*")
              .eq("user_id", session.user.id),

            // Delte kalendere
            supabase
              .from("calendar_shares")
              .select(
                `
              calendar_id,
              calendars (*)
            `
              )
              .eq("user_id", session.user.id)
              .eq("status", "accepted"),
          ]);

        if (ownCalendarsResponse.error) throw ownCalendarsResponse.error;
        if (sharedCalendarsResponse.error) throw sharedCalendarsResponse.error;

        const ownCalendars = ownCalendarsResponse.data || [];
        const sharedCalendars =
          sharedCalendarsResponse.data?.map((share) => share.calendars) || [];

        const allCalendars = [...ownCalendars, ...sharedCalendars];

        if (!allCalendars.length) {
          // Opret standardkalender hvis ingen findes
          const { data: newCalendar, error: createError } = await supabase
            .from("calendars")
            .insert({
              name: "Min kalender",
              description: "Min personlige kalender",
              color: "#4285f4",
              type: "personal",
              is_visible: true,
              user_id: session.user.id,
            })
            .select()
            .single();

          if (createError) throw createError;

          setVisibleCalendarIds([newCalendar.id]);
        } else {
          // Sæt synlige kalendere
          const visibleIds = allCalendars
            .filter((cal) => cal.is_visible)
            .map((cal) => cal.id);

          setVisibleCalendarIds(visibleIds);
        }
      } catch (error) {
        console.error("Fejl ved hentning/oprettelse af kalendere:", error);
      }
    };

    fetchCalendars();
  }, [supabase, session?.user?.id]);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupNotifications = async () => {
      try {
        if (channel) {
          await channel.unsubscribe();
        }

        channel = supabase
          .channel("notifications")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
            },
            () => {
              // Håndter notifikations opdateringer her
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Fejl i notifikations kanal:", error);
      }
    };

    setupNotifications();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [supabase]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
    } catch (error) {
      console.error("Fejl ved log ud:", error);
      toast.error("Der opstod en fejl ved log ud");
    } finally {
      setIsLoading(false);
    }
  };

  // En ny funktion der kan toggle sidebar og garanterer korrekt håndtering
  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  // En funktion der kun lukker sidebaren
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-shrink-0 h-14 fixed top-0 left-0 right-0 z-50 bg-background/50 supports-[backdrop-filter]:bg-background/30 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="flex items-center justify-between h-full px-4 mx-auto w-full max-w-[2000px]">
          <div className="flex items-center gap-4 sm:ml-80">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:hidden hover:bg-accent/50 transition-all duration-300 hover:scale-105 active:scale-95 hover:rotate-180 relative group before:absolute before:inset-0 before:rounded-full before:bg-primary/5 before:scale-0 before:hover:scale-100 before:transition-transform before:duration-300"
              onClick={toggleSidebar}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              <Menu className="h-5 w-5 transition-all duration-300 group-hover:scale-110 relative z-10" />
              <span className="sr-only">Åbn/luk menu</span>
            </Button>
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-accent/20 hover:bg-accent/30 transition-all duration-300 hover:scale-105 hover:-rotate-1 group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:to-transparent before:translate-x-[-100%] before:group-hover:translate-x-[100%] before:transition-transform before:duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <Calendar className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent relative group-hover:tracking-wider transition-all duration-300">
                Kalender
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent/50 transition-all duration-300 hover:scale-105 active:scale-95 relative group before:absolute before:inset-0 before:rounded-full before:bg-primary/5 before:scale-0 before:hover:scale-100 before:transition-transform before:duration-300"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
              >
                <ChevronLeft className="h-4 w-4 relative z-10 group-hover:-translate-x-0.5 transition-transform" />
                <span className="sr-only">Forrige måned</span>
              </Button>
              <h2 className="lg:text-lg text-sm font-semibold bg-gradient-to-r from-primary uppercase to-primary/70 bg-clip-text text-transparent animate-in slide-in-from-left duration-300 min-w-[120px] text-center relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary/20">
                {format(selectedDate, "MMMM yyyy", { locale: da })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent/50 transition-all duration-300 hover:scale-105 active:scale-95 relative group before:absolute before:inset-0 before:rounded-full before:bg-primary/5 before:scale-0 before:hover:scale-100 before:transition-transform before:duration-300"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
              >
                <ChevronRight className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                <span className="sr-only">Næste måned</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  className="print:hidden group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Calendar className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                  <span className="relative z-10">I dag</span>
                </Button>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex h-10 w-10 hover:bg-accent/50 transition-all duration-300 hover:scale-105 active:scale-95 relative group overflow-hidden before:absolute before:inset-0 before:rounded-full before:bg-primary/5 before:scale-0 before:hover:scale-100 before:transition-transform before:duration-300"
                    onClick={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                    {theme === "light" ? (
                      <Moon className="h-5 w-5 group-hover:-rotate-90 transition-transform duration-300 relative z-10 " />
                    ) : (
                      <Sun className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300 relative z-10 " />
                    )}
                    <span className="sr-only">Skift tema</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-background/80 backdrop-blur-lg border border-border/40 shadow-lg"
                >
                  <p>Skift tema</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 hover:bg-accent/50 transition-all duration-300 hover:scale-105 active:scale-95 relative group overflow-hidden before:absolute before:inset-0 before:rounded-full before:bg-primary/5 before:scale-0 before:hover:scale-100 before:transition-transform before:duration-300"
                    onClick={() => setIsNotificationsOpen(true)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                    <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                    {unreadCount > 0 && (
                      <span
                        className={cn(
                          "absolute -right-1 -top-1 flex items-center justify-center",
                          unreadCount === 1
                            ? "min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] text-white font-medium"
                            : "min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] text-white font-medium"
                        )}
                      >
                        {unreadCount}
                      </span>
                    )}
                    <span className="sr-only">Notifikationer</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-background/80 backdrop-blur-lg border border-border/40 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                >
                  <p>Notifikationer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="default"
              size="sm"
              className="hidden buttonsmall sm:flex items-center gap-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-primary/80 group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] before:group-hover:translate-x-[100%] before:transition-transform before:duration-500"
              onClick={() => setIsCreateEventOpen(true)}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 buttonsmall" />
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300 relative z-10 buttonsmall" />
              <span className="relative z-10">
                Ny begivenhed
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </span>
            </Button>
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 hover:bg-accent/50 transition-all duration-300 hover:scale-105 active:scale-95 relative group overflow-hidden before:absolute before:inset-0 before:rounded-full before:bg-primary/5 before:scale-0 before:hover:scale-100 before:transition-transform before:duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                        <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                        <span className="sr-only">Bruger menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-background/80 backdrop-blur-lg border border-border/40 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                  >
                    <p>Bruger menu</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent
                align="end"
                className="w-72 animate-in slide-in-from-top-2 duration-300 backdrop-blur-xl bg-background/80 border border-border/40 shadow-lg"
              >
                <DropdownMenuLabel className="p-4">
                  <div className="flex items-center gap-3 mb-2 group">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden relative">
                        {isLoading ? (
                          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <User className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-180" />
                          </>
                        )}
                      </div>
                      {!isLoading && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate group-hover:text-primary transition-colors duration-300">
                        {isLoading ? "Indlæser..." : "Min konto"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {isLoading ? "Henter brugerinfo..." : userEmail}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40" />
                <div className="p-2">
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer group relative overflow-hidden"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm">Profil indstillinger</span>
                      <span className="text-xs text-muted-foreground">
                        Opdater din profil
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer group relative overflow-hidden"
                    onClick={() => setIsNotificationsSettingsOpen(true)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm">
                        Notifikationsindstillinger
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Håndter dine notifikationer
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="sm:hidden flex items-center gap-2 px-3 py-2 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center relative">
                      <Sun className="h-4 w-4 text-primary absolute inset-0 m-auto transition-all duration-300 group-hover:rotate-90 group-hover:text-yellow-500 dark:opacity-0 dark:rotate-90 dark:group-hover:rotate-0" />
                      <Moon className="h-4 w-4 text-primary absolute inset-0 m-auto transition-all duration-300 group-hover:-rotate-90 group-hover:text-blue-500 opacity-0 rotate-90 dark:opacity-100 dark:rotate-0 dark:group-hover:-rotate-90" />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm">Skift tema</span>
                      <span className="text-xs text-muted-foreground">
                        Lys eller mørkt tema
                      </span>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-border/40" />
                <div className="p-2">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer group relative overflow-hidden text-red-600"
                  >
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <LogOut className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                        Log ud
                      </span>
                      <span className="text-xs text-red-500/70">
                        Afslut din session
                      </span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>{" "}
          </div>
        </div>
      </div>

      <div className="flex flex-1 pt-14 overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-xl z-40 sm:hidden"
            onClick={closeSidebar}
          />
        )}

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[280px] bg-background border-r",
            "transition-transform duration-300 ease-in-out pt-14",
            "sm:relative sm:translate-x-0 sm:pt-0",
            "print:hidden",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="sm:hidden absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 hover:bg-accent/50 rounded-full transition-all"
              onClick={closeSidebar}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Luk menu</span>
            </Button>
          </div>
          <div className="h-full overflow-y-auto">
            <CalendarSidebar
              view={view}
              onViewChange={setView}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              visibleCalendarIds={visibleCalendarIds}
              onVisibleCalendarIdsChange={setVisibleCalendarIds}
              selectedCalendarId={selectedCalendarId}
              onSelectedCalendarIdChange={setSelectedCalendarId}
              isOpen={isSidebarOpen}
              onOpenChange={() => {}}
              showHolidays={showHolidays}
              onShowHolidaysChange={setShowHolidays}
              handlePrint={handlePrint}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 h-full">
          <CalendarView
            ref={calendarRef}
            view={view}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onViewChange={setView}
            visibleCalendarIds={visibleCalendarIds}
            onSidebarOpenChange={setIsSidebarOpen}
            isCreateEventOpen={isCreateEventOpen}
            onCreateEventOpenChange={setIsCreateEventOpen}
            showHolidays={showHolidays}
            events={events}
            onUpdateEvent={updateEvent}
            onDeleteEvent={deleteEvent}
          />
        </div>
      </div>
      <ProfileSettingsDialog
        isOpen={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        userEmail={userEmail}
      />
      <NotificationsDialog
        isOpen={isNotificationsSettingsOpen}
        onOpenChange={setIsNotificationsSettingsOpen}
      />
      <NotificationsListDialog
        isOpen={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
      />
    </div>
  );
}
