"use client";

import { CalendarEvent } from "@/hooks/use-events";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Users,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { User as SupabaseUser } from "@supabase/supabase-js";

interface ViewEventDialogProps {
  event: CalendarEvent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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
}: ViewEventDialogProps) {
  const { supabase } = useSupabase();
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hent den aktuelle bruger når dialogen åbnes
  useEffect(() => {
    if (isOpen) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setCurrentUser(user);
      });
    }
  }, [isOpen, supabase.auth]);

  const isOwner = currentUser?.id === event.user_id;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (error) throw error;

      toast.success("Begivenheden blev slettet");
      onOpenChange(false);
    } catch (error) {
      console.error("Fejl ved sletning af begivenhed:", error);
      toast.error("Der skete en fejl ved sletning af begivenheden");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getCategoryEmoji = (category: string | undefined) => {
    if (!category) return categoryEmojis.default;
    const normalizedCategory = category.toLowerCase();
    return categoryEmojis[normalizedCategory] || categoryEmojis.default;
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                        : `${event.start_time} - ${event.end_time}`}
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
                        {format(event.start_date, "EEEE d. MMMM yyyy", {
                          locale: da,
                        })}
                      </p>
                      {event.end_date.getTime() !==
                        event.start_date.getTime() && (
                        <p className="text-muted-foreground">
                          til{" "}
                          {format(event.end_date, "EEEE d. MMMM yyyy", {
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
                    <div className="flex items-center gap-4 group">
                      <div
                        className={cn(
                          "bg-primary/10 p-2.5 rounded-xl shrink-0",
                          "transition-all duration-300 group-hover:scale-110 group-hover:rotate-[8deg] group-hover:bg-primary/20"
                        )}
                      >
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="font-medium break-words">
                          {event.location}
                        </p>
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                event.location || ""
                              )}`,
                              "_blank"
                            )
                          }
                          className="text-sm text-primary hover:underline"
                        >
                          Åbn i Google Maps
                        </button>
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
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              key={index}
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
                      {format(event.created_at, "d. MMM yyyy 'kl.' HH:mm", {
                        locale: da,
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>

              {isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-2 mt-8"
                >
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto order-last sm:order-first hover:bg-background"
                    onClick={() => onOpenChange(false)}
                  >
                    Luk
                  </Button>
                  <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                    <Button
                      variant="default"
                      className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90"
                      onClick={() => {
                        // TODO: Implementer redigering
                        toast.info("Redigering kommer snart");
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Rediger
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 sm:flex-none gap-2 hover:bg-destructive/90"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Slet
                    </Button>
                  </div>
                </motion.div>
              )}
              {!isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto hover:bg-background"
                    onClick={() => onOpenChange(false)}
                  >
                    Luk
                  </Button>
                </motion.div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Slet begivenhed</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Er du sikker på, at du vil slette denne begivenhed? Denne handling
              kan ikke fortrydes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="hover:bg-background"
            >
              Annuller
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Sletter..." : "Slet begivenhed"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  let hours = endHour - startHour;
  let minutes = endMinute - startMinute;

  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }

  if (hours === 0) {
    return `${minutes} minutter`;
  } else if (minutes === 0) {
    return `${hours} time${hours === 1 ? "" : "r"}`;
  } else {
    return `${hours} time${hours === 1 ? "" : "r"} og ${minutes} minutter`;
  }
}
