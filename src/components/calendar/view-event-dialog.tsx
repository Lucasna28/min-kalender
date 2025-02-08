"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Users,
  Trash2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/hooks/use-events";
import { useToast } from "@/components/ui/use-toast";
import { useSupabase } from "@/components/providers/supabase-provider";

interface ViewEventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
}

const categoryEmojis: { [key: string]: string } = {
  møde: "👥",
  frokost: "🍽️",
  pause: "☕️",
  arbejde: "💼",
  fritid: "🎮",
  sport: "🏃‍♂️",
  ferie: "✈️",
  fødselsdag: "🎂",
  undervisning: "📚",
  læge: "🏥",
  tandlæge: "🦷",
  indkøb: "🛒",
  default: "📅",
};

const statusMessages = {
  accepted: "Deltager",
  declined: "Deltager ikke",
  pending: "Afventer svar",
};

const statusColors = {
  accepted: "bg-green-500",
  declined: "bg-red-500",
  pending: "bg-yellow-500",
};

export function ViewEventDialog({
  event,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
}: ViewEventDialogProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const { supabase, session } = useSupabase();

  useEffect(() => {
    // Tjek session når komponenten monteres
    const checkSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (!currentSession) {
        console.log("Ingen aktiv session fundet");
      } else {
        console.log("Aktiv session fundet:", currentSession.user.id);
      }
    };

    checkSession();
  }, [supabase]);

  if (!event) return null;

  // Hjælpefunktion til at sikre gyldige datoer
  const formatEventDate = (date: Date | string) => {
    try {
      const eventDate = date instanceof Date ? date : new Date(date);
      if (isNaN(eventDate.getTime())) {
        console.error("Ugyldig dato:", date);
        return new Date();
      }

      // Tilføj en dag til datoen for at kompensere for tidszoneforskellen
      const adjustedDate = new Date(eventDate);
      adjustedDate.setDate(adjustedDate.getDate() + 1);

      return adjustedDate;
    } catch (error) {
      console.error("Fejl ved formatering af dato:", error);
      return new Date();
    }
  };

  const startDate = formatEventDate(event.start_date);
  const endDate = formatEventDate(event.end_date);

  const createdAtDate = event.created_at
    ? formatEventDate(event.created_at)
    : null;
  console.log("Event data:", {
    event,
    startDate,
    endDate,
    createdAt: createdAtDate,
  });

  const handleEdit = () => {
    toast({
      title: "Coming Soon",
      description: "Redigering af begivenheder kommer snart!",
      duration: 3000,
    });
  };

  const handleDelete = async () => {
    console.log("ViewEventDialog handleDelete starter");
    try {
      if (!event || !onDelete) {
        console.log("Mangler event eller onDelete handler", {
          event,
          hasOnDelete: !!onDelete,
        });
        return;
      }

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession?.user) {
        console.log("Ingen bruger fundet i session");
        toast({
          title: "Fejl",
          description: "Du skal være logget ind for at slette begivenheder",
          variant: "destructive",
        });
        return;
      }

      // Log event detaljer
      console.log("Forsøger at slette event:", {
        eventId: event.id,
        userId: currentSession.user.id,
        calendarId: event.calendar_id,
        eventUserId: event.user_id,
      });

      // Forsøg at slette direkte
      const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id)
        .select();

      if (deleteError) {
        console.error("Database fejl ved sletning:", deleteError);
        toast({
          title: "Fejl",
          description: `Der skete en fejl ved sletning af begivenheden: ${deleteError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log("Event blev slettet fra databasen");
      await onDelete(event.id);
      setShowDeleteDialog(false);
      onOpenChange(false);

      toast({
        title: "Succes",
        description: "Begivenheden er blevet slettet",
      });
    } catch (error) {
      console.error("Fejl ved sletning:", error);
      toast({
        title: "Fejl",
        description: "Der skete en fejl ved sletning af begivenheden",
        variant: "destructive",
      });
    }
  };

  const getCategoryEmoji = (category: string | undefined) => {
    if (!category) return categoryEmojis.default;
    const normalizedCategory = category.toLowerCase();
    return categoryEmojis[normalizedCategory] || categoryEmojis.default;
  };

  return (
    <AnimatePresence mode="wait">
      {!!event && (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent
            className={cn(
              "max-w-[95vw] w-full lg:max-w-3xl p-0 overflow-hidden",
              "bg-gradient-to-b from-background to-muted/20 shadow-xl",
              "rounded-lg md:rounded-xl"
            )}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "6rem" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full relative overflow-hidden rounded-t-lg md:rounded-t-xl"
            >
              <div
                className="absolute inset-0"
                style={{ backgroundColor: event.color }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
                <div
                  className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              <div className="relative h-full p-4 md:p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full"
                  >
                    <span className="text-white/90 text-sm font-medium">
                      {event.is_all_day
                        ? "Hele dagen"
                        : `${format(startDate, "HH:mm")} - ${format(
                            endDate,
                            "HH:mm"
                          )}`}
                    </span>
                  </motion.div>
                </div>
                <div className="mt-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="text-white/90 text-sm font-medium">
                      {event.category && (
                        <span className="flex items-center gap-2">
                          <span className="text-base">
                            {getCategoryEmoji(event.category)}
                          </span>
                          <span className="capitalize">{event.category}</span>
                        </span>
                      )}
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <div className="p-4 md:p-6 lg:p-8">
              <DialogHeader className="mb-6 md:mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                    {event.title}
                  </DialogTitle>
                  {event.description && (
                    <p className="text-muted-foreground mt-2 md:mt-2.5 text-sm md:text-base leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </motion.div>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div className="space-y-6">
                  <div className="flex items-start gap-4 group">
                    <div
                      className={cn(
                        "bg-primary/10 p-2.5 rounded-xl shrink-0",
                        "transition-all duration-300 group-hover:scale-110 group-hover:rotate-[8deg] group-hover:bg-primary/20"
                      )}
                    >
                      <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium">
                        {format(startDate, "EEEE d. MMMM yyyy", {
                          locale: da,
                        })}
                      </p>
                      {endDate.getTime() !== startDate.getTime() && (
                        <p className="text-muted-foreground">
                          til{" "}
                          {format(endDate, "EEEE d. MMMM yyyy", {
                            locale: da,
                          })}
                        </p>
                      )}
                      {event.is_all_day && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                          Hele dagen
                        </span>
                      )}
                    </div>
                  </div>

                  {!event.is_all_day && event.start_time && event.end_time && (
                    <div className="flex items-center gap-4 group">
                      <div
                        className={cn(
                          "bg-primary/10 p-2.5 rounded-xl shrink-0",
                          "transition-all duration-300 group-hover:scale-110 group-hover:rotate-[8deg] group-hover:bg-primary/20"
                        )}
                      >
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="font-medium">
                          {event.start_time} - {event.end_time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Varighed:{" "}
                          {calculateDuration(event.start_time, event.end_time)}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm">{event.location}</p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            event.location
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <span>Åbn i Google Maps</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 group">
                    <div
                      className={cn(
                        "bg-primary/10 p-2.5 rounded-xl shrink-0",
                        "transition-all duration-300 group-hover:scale-110 group-hover:rotate-[8deg] group-hover:bg-primary/20"
                      )}
                    >
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium">Oprettet af</p>
                      <p className="text-muted-foreground break-words">
                        {event.calendar_id === "danish-holidays"
                          ? "Vorherre selv 😇"
                          : event.user_id === "system"
                          ? "Systemets Ånd 🤖"
                          : event.creator_name ||
                            event.creator_email ||
                            "Ukendt bruger"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {event.invitations && event.invitations.length > 0 && (
                    <div className="flex items-start gap-4 group">
                      <div
                        className={cn(
                          "bg-primary/10 p-2.5 rounded-xl mt-0.5 shrink-0",
                          "transition-all duration-300 group-hover:scale-110 group-hover:rotate-[8deg] group-hover:bg-primary/20"
                        )}
                      >
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Deltagere</p>
                          <span className="text-sm text-muted-foreground">
                            ({event.invitations.length})
                          </span>
                        </div>
                        <div className="space-y-2.5 mt-2.5">
                          {event.invitations.map((invite, index) => (
                            <motion.div
                              key={`${invite.email}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className="flex items-center gap-2 group/invite"
                            >
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full transition-transform duration-300 group-hover/invite:scale-125",
                                  statusColors[
                                    invite.status as keyof typeof statusColors
                                  ],
                                  "animate-pulse"
                                )}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {invite.name || invite.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {
                                    statusMessages[
                                      invite.status as keyof typeof statusMessages
                                    ]
                                  }
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 mt-6 border-t border-border/40">
                    <span>
                      Oprettet{" "}
                      {createdAtDate
                        ? format(createdAtDate, "d. MMM yyyy 'kl.' HH:mm", {
                            locale: da,
                          })
                        : "Dato ikke tilgængelig"}
                    </span>
                  </div>
                </div>
              </motion.div>

              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Luk
                </Button>
                {onEdit && event.calendar_id !== "danish-holidays" && (
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="relative group overflow-hidden"
                  >
                    <span className="inline-flex items-center gap-1">
                      Rediger
                      <span className="text-xs opacity-60">(Kommer snart)</span>
                    </span>
                  </Button>
                )}
                {onDelete && event.calendar_id !== "danish-holidays" && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Slet
                  </Button>
                )}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        key={`delete-dialog-${event.id}`}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Denne handling kan ikke fortrydes. Begivenheden vil blive
              permanent slettet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Annuller
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                console.log("Slet knap klikket");
                handleDelete();
              }}
            >
              Slet begivenhed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
}

function calculateDuration(start: string, end: string): string {
  try {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    let durationMinutes =
      endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
    if (durationMinutes < 0) durationMinutes += 24 * 60;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) return `${minutes} minutter`;
    if (minutes === 0) return `${hours} timer`;
    return `${hours} timer og ${minutes} minutter`;
  } catch (error) {
    console.error("Fejl ved beregning af varighed:", error);
    return "Ukendt varighed";
  }
}
