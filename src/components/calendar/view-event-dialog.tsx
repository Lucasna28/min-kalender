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
import { CalendarDays, Clock, MapPin, User, Users } from "lucide-react";

interface ViewEventDialogProps {
  event: CalendarEvent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewEventDialog({
  event,
  isOpen,
  onOpenChange,
}: ViewEventDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div
            className="w-full h-2 rounded-t-lg mb-4"
            style={{ backgroundColor: event.color }}
          />
          <DialogTitle className="text-xl font-semibold">
            {event.title}
          </DialogTitle>
          {event.description && (
            <p className="text-muted-foreground mt-2">{event.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CalendarDays className="w-5 h-5 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {format(event.start_date, "EEEE d. MMMM yyyy", { locale: da })}
              </p>
              {event.end_date.getTime() !== event.start_date.getTime() && (
                <p className="text-muted-foreground">
                  til{" "}
                  {format(event.end_date, "EEEE d. MMMM yyyy", { locale: da })}
                </p>
              )}
            </div>
          </div>

          {!event.is_all_day && event.start_time && event.end_time && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <p>
                {event.start_time} - {event.end_time}
              </p>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <p>{event.location}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Oprettet af</p>
              <p className="text-muted-foreground">
                {event.creator_name || event.creator_email || "Ukendt"}
              </p>
            </div>
          </div>

          {event.invitations && event.invitations.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Deltagere</p>
                <div className="space-y-1 mt-1">
                  {event.invitations.map((invite, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          invite.status === "accepted"
                            ? "bg-green-500"
                            : invite.status === "declined"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <p className="text-sm text-muted-foreground">
                        {invite.name || invite.email}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {event.category && (
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: event.color }}
              />
              <p className="capitalize">{event.category}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-6">
            Oprettet{" "}
            {format(event.created_at, "d. MMM yyyy 'kl.' HH:mm", {
              locale: da,
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
