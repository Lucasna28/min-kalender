import { useState } from "react";
import { Event } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { formatDateTime } from "@/lib/utils";

interface EventDialogProps {
  event: Event | null;
  onClose: () => void;
  onUpdate: (event: Event) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
}

export function EventDialog({
  event,
  onClose,
  onUpdate,
  onDelete,
}: EventDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [start, setStart] = useState(event?.start || new Date());
  const [end, setEnd] = useState(event?.end || new Date());
  const [allDay, setAllDay] = useState(event?.allDay || false);
  const [isLoading, setIsLoading] = useState(false);

  // Opdater form state når event ændres
  useState(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setStart(event.start);
      setEnd(event.end);
      setAllDay(event.allDay || false);
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setIsLoading(true);
    try {
      await onUpdate({
        ...event,
        title,
        description,
        start,
        end,
        allDay,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Fejl ved opdatering af begivenhed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    setIsLoading(true);
    try {
      await onDelete(event.id);
      onClose();
    } catch (error) {
      console.error("Fejl ved sletning af begivenhed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Rediger begivenhed" : "Begivenhedsdetaljer"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Rediger detaljerne for din begivenhed herunder."
              : "Se detaljerne for din begivenhed herunder."}
          </DialogDescription>
        </DialogHeader>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start">Start tidspunkt</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={start.toISOString().slice(0, 16)}
                  onChange={(e) => setStart(new Date(e.target.value))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">Slut tidspunkt</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={end.toISOString().slice(0, 16)}
                  onChange={(e) => setEnd(new Date(e.target.value))}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="allDay"
                  checked={allDay}
                  onCheckedChange={setAllDay}
                />
                <Label htmlFor="allDay">Hele dagen</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Annuller
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Gemmer..." : "Gem ændringer"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="font-medium">{event?.title}</h3>
                {event?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.description}
                  </p>
                )}
              </div>
              <div className="text-sm">
                <p>Start: {event && formatDateTime(event.start)}</p>
                <p>Slut: {event && formatDateTime(event.end)}</p>
                {event?.allDay && <p className="mt-1">Hele dagen</p>}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                Rediger
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Sletter..." : "Slet"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
