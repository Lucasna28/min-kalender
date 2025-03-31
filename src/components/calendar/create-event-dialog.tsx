"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useSupabase } from "@/components/providers/supabase-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { eventSchema } from "@/lib/calendar-constants";
import { X } from "lucide-react";
import { TimeSettings } from "./event-form/time-settings";
import { CategorySelect } from "./event-form/category-select";
import {
  Calendar,
  MapPin,
  Users,
  Bell,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-media-query";
import { MobileEventDialog } from "./create-event-dialog-mobile";

interface CreateEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: Date;
  visibleCalendarIds: string[];
  createEvent: (event: CreateEventInput) => Promise<void>;
  eventToEdit?: Event | null;
}

interface Calendar {
  id: string;
  name: string;
  user_id: string;
  permission?: string;
}

export function CreateEventDialog({
  isOpen,
  onOpenChange,
  defaultDate,
  visibleCalendarIds,
  createEvent,
  eventToEdit,
}: CreateEventDialogProps) {
  console.log("CreateEventDialog render:", { isOpen, eventToEdit });

  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [invitedUsers, setInvitedUsers] = useState<
    Array<{ email: string; name?: string }>
  >([]);
  const [searchUsers, setSearchUsers] = useState("");
  const isMobile = useIsMobile();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      start_date: defaultDate,
      end_date: defaultDate,
      start_time: "09:00",
      end_time: "10:00",
      is_all_day: false,
      calendar_id: visibleCalendarIds[0] || "",
      category: "andet",
    },
  });

  useEffect(() => {
    if (isOpen && !eventToEdit) {
      // Kun nulstil form hvis vi ikke er i redigeringstilstand
      form.reset({
        title: "",
        description: "",
        start_date: defaultDate,
        end_date: defaultDate,
        start_time: "09:00",
        end_time: "10:00",
        is_all_day: false,
        calendar_id: visibleCalendarIds[0] || "",
        category: "andet",
      });
    }
  }, [isOpen, defaultDate, form, visibleCalendarIds, eventToEdit]);

  useEffect(() => {
    if (eventToEdit) {
      form.reset({
        title: eventToEdit.title,
        description: eventToEdit.description || "",
        start_date: eventToEdit.start_date,
        end_date: eventToEdit.end_date,
        start_time: eventToEdit.start_time || "00:00",
        end_time: eventToEdit.end_time || "23:59",
        is_all_day: eventToEdit.is_all_day,
        location: eventToEdit.location || "",
        calendar_id: eventToEdit.calendar_id,
        category: eventToEdit.category || "arbejde",
        color: eventToEdit.color || "#4285F4",
      });
    }
  }, [eventToEdit, form]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    const fetchCalendars = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Hent brugerens egne kalendere
      const { data: ownCalendars } = await supabase
        .from("calendars")
        .select("id, name, user_id")
        .eq("user_id", user.id)
        .order("name");

      // Hent delte kalendere hvor brugeren har skriverettigheder
      const { data: sharedCalendars } = await supabase
        .from("calendar_shares")
        .select(
          `
          calendar:calendars (
          id,
          name,
          user_id
          )
      `
        )
        .eq("user_id", user.id)
        .in("permission", ["editor", "admin"])
        .eq("status", "accepted");

      const allCalendars = [
        ...(ownCalendars || []),
        ...(sharedCalendars?.map((share) => ({
          id: share.calendar.id,
          name: share.calendar.name,
          user_id: share.calendar.user_id,
        })) || []),
      ];

      setCalendars(allCalendars);
    };

    fetchCalendars();
  }, [supabase]);

  const handleSubmit = async (data: z.infer<typeof eventSchema>) => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Du skal være logget ind");

      // Brug datoerne direkte uden justering
      const event = {
        ...data,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
        user_id: user.id,
        color: getCategoryColor(data.category),
      };

      // Håndter både oprettelse og redigering
      if (eventToEdit) {
        // Hvis vi redigerer, inkluder ID'et
        await createEvent({
          ...event,
          id: eventToEdit.id,
        });
        toast.success("Begivenhed opdateret");
      } else {
        // Ellers opret ny
        await createEvent(event);
        toast.success("Begivenhed oprettet");
      }

      // Luk dialogen og nulstil form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Der skete en fejl:", error);
      toast.error(
        "Der skete en fejl ved " +
          (eventToEdit ? "opdatering" : "oprettelse") +
          " af begivenheden"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isMobile ? (
        <MobileEventDialog
          form={form}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          onOpenChange={onOpenChange}
          calendars={calendars}
          currentUser={currentUser}
          invitedUsers={invitedUsers}
          searchUsers={searchUsers}
          setSearchUsers={setSearchUsers}
          eventToEdit={eventToEdit}
        />
      ) : (
        <DialogContent className="max-w-[600px] p-0 gap-0 overflow-hidden bg-background border-none shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-background via-muted/10 to-background sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {eventToEdit ? "Rediger begivenhed" : "Opret ny begivenhed"}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted/60"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <ScrollArea className="max-h-[650px]">
                <div className="px-6 py-4 space-y-6">
                  {/* Kalender og Kategori sektion */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Kalender vælger */}
                    <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/40 transition-colors h-[140px] flex flex-col">
                      <FormField
                        control={form.control}
                        name="calendar_id"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                              <FormLabel className="text-base font-medium">
                                Kalender
                              </FormLabel>
                            </div>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full bg-background/50 border-input/50">
                                  <SelectValue placeholder="Vælg kalender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent
                                align="start"
                                className="w-[300px]"
                              >
                                <SelectGroup>
                                  <SelectLabel className="font-semibold">
                                    Mine kalendere
                                  </SelectLabel>
                                  {calendars
                                    .filter(
                                      (cal) => cal.user_id === currentUser?.id
                                    )
                                    .map((calendar) => (
                                      <SelectItem
                                        key={calendar.id}
                                        value={calendar.id}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="h-2 w-2 rounded-full bg-primary" />
                                          <span className="font-medium">
                                            {calendar.name}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectGroup>
                                {calendars.some(
                                  (cal) => cal.user_id !== currentUser?.id
                                ) && (
                                  <SelectGroup>
                                    <SelectLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                                      Delte kalendere
                                    </SelectLabel>
                                    {calendars
                                      .filter(
                                        (cal) => cal.user_id !== currentUser?.id
                                      )
                                      .map((calendar) => (
                                        <SelectItem
                                          key={calendar.id}
                                          value={calendar.id}
                                          className="px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-secondary" />
                                            {calendar.name}
                                          </div>
                                        </SelectItem>
                                      ))}
                                  </SelectGroup>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Kategori vælger */}
                    <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/40 transition-colors h-[140px] flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span
                            role="img"
                            aria-label="Kategori"
                            className="text-base"
                          >
                            🏷️
                          </span>
                        </div>
                        <FormLabel className="text-base font-medium">
                          Kategori
                        </FormLabel>
                      </div>
                      <CategorySelect form={form} />
                    </div>
                  </div>

                  {/* Titel og Beskrivelse sektion */}
                  <div className="space-y-4 bg-muted/30 rounded-lg p-4 hover:bg-muted/40 transition-colors">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <div className="relative group">
                            <FormControl>
                              <Input
                                placeholder="Hvad handler begivenheden om?"
                                className="text-base font-medium border-none px-10 py-2.5 bg-background/50 rounded-lg focus-visible:ring-1 placeholder:text-muted-foreground/50 group-hover:bg-background/80 transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 transition-transform group-hover:scale-110 group-focus-within:scale-110">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <span
                                  role="img"
                                  aria-label="Titel"
                                  className="text-xs"
                                >
                                  📝
                                </span>
                              </div>
                            </div>
                          </div>
                          <FormMessage className="ml-10 mt-1 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <div className="relative group">
                            <FormControl>
                              <Textarea
                                placeholder="Tilføj flere detaljer om begivenheden..."
                                className="min-h-[80px] border-none px-10 py-2.5 bg-background/50 rounded-lg focus-visible:ring-1 resize-none placeholder:text-muted-foreground/50 group-hover:bg-background/80 transition-colors text-base"
                                {...field}
                              />
                            </FormControl>
                            <div className="absolute left-2.5 top-2.5 transition-transform group-hover:scale-110 group-focus-within:scale-110">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <span
                                  role="img"
                                  aria-label="Beskrivelse"
                                  className="text-xs"
                                >
                                  ℹ️
                                </span>
                              </div>
                            </div>
                          </div>
                          <FormMessage className="ml-10 mt-1 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tid og Dato sektion */}
                  <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <FormLabel className="text-base font-medium">
                        Tidspunkt
                      </FormLabel>
                    </div>
                    <TimeSettings form={form} />
                    {!form.watch("is_all_day") && (
                      <div className="mt-1">
                        <FormField
                          control={form.control}
                          name="start_time"
                          render={({ field }) => (
                            <FormMessage className="text-xs" />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="end_time"
                          render={({ field }) => (
                            <FormMessage className="text-xs" />
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Avancerede indstillinger */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground/80">
                      Flere indstillinger
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="location" className="border-none">
                        <AccordionTrigger className="hover:no-underline py-2.5 px-4 hover:bg-muted/50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="text-base font-medium">
                                Mødested
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {form.watch("location") ||
                                  "Tilføj adresse eller lokation"}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-1 pb-3">
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      placeholder="F.eks. Rådhuspladsen 1, 1550 København"
                                      className="bg-background/50 pl-8 py-5 text-base h-9"
                                      {...field}
                                    />
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                                  </div>
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-1.5 ml-2">
                                  Tilføj en adresse eller lokation til
                                  begivenheden
                                </p>
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="guests" className="border-none">
                        <AccordionTrigger className="hover:no-underline py-2.5 px-4 hover:bg-muted/50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="text-base font-medium">
                                Inviter andre
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {invitedUsers.length > 0
                                  ? `${invitedUsers.length} ${
                                      invitedUsers.length === 1
                                        ? "person inviteret"
                                        : "personer inviteret"
                                    }`
                                  : "Inviter andre til begivenheden"}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-1 pb-3 space-y-3">
                          <div className="relative">
                            <Input
                              placeholder="Indtast e-mail adresse..."
                              value={searchUsers}
                              onChange={(e) => setSearchUsers(e.target.value)}
                              className="bg-background/50 pl-8 py-5 text-base h-9"
                            />
                            <Users className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                          </div>
                          <p className="text-xs text-muted-foreground ml-2">
                            Inviterede personer modtager en notifikation med
                            invitation
                          </p>
                          {invitedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {invitedUsers.map((user) => (
                                <Badge
                                  key={user.email}
                                  variant="secondary"
                                  className="py-0.5 px-2 hover:bg-muted/80"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <Avatar className="h-4 w-4">
                                      <AvatarFallback className="bg-primary/10 text-[10px]">
                                        {user.name?.[0] || user.email[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs">
                                      {user.name || user.email}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-3.5 w-3.5 hover:bg-muted/50 rounded-full"
                                      onClick={() => {
                                        /* Fjern invitation */
                                      }}
                                    >
                                      <X className="h-2.5 w-2.5" />
                                    </Button>
                                  </div>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem
                        value="notifications"
                        className="border-none"
                      >
                        <AccordionTrigger className="hover:no-underline py-2.5 px-4 hover:bg-muted/50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bell className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="text-base font-medium">
                                Påmindelser
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Kommer snart
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-1 pb-3">
                          <div className="flex items-center justify-center py-4">
                            <div className="text-center space-y-1.5">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <Bell className="h-5 w-5 text-primary" />
                              </div>
                              <p className="text-base font-medium">
                                Påmindelser kommer snart
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Vi arbejder på at tilføje påmindelser
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gradient-to-t from-muted/20 to-background/90 sticky bottom-0 z-10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 rounded-full px-4 hover:bg-muted/40 shadow-sm"
                  onClick={() => onOpenChange(false)}
                >
                  Annuller
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-xs h-8 rounded-full px-4 shadow-sm hover:shadow-md transition-all duration-200"
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Opretter...</span>
                    </div>
                  ) : (
                    "Opret"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      )}
    </Dialog>
  );
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    arbejde: "#4285F4",
    personlig: "#EA4335",
    familie: "#9C27B0",
    ferie: "#FBBC05",
    fødselsdag: "#FF69B4",
    møde: "#34A853",
    læge: "#00BCD4",
    andet: "#607D8B",
  };
  return colors[category] || colors.andet;
};
