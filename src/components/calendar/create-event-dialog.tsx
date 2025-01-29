"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabase } from "@/components/providers/supabase-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Event } from "@/types/calendar";

// Opdaterer predefinerede kategorier til at matche databasens enum værdier
const PREDEFINED_CATEGORIES = [
  { id: "arbejde", name: "Arbejde", color: "#4285F4" },
  { id: "personlig", name: "Personligt", color: "#EA4335" },
  { id: "familie", name: "Familie", color: "#9C27B0" },
  { id: "ferie", name: "Ferie", color: "#FBBC05" },
  { id: "fødselsdag", name: "Fødselsdag", color: "#FF69B4" },
  { id: "møde", name: "Møde", color: "#34A853" },
  { id: "læge", name: "Læge", color: "#00BCD4" },
  { id: "andet", name: "Andet", color: "#607D8B" },
] as const;

// Gentagelsesmuligheder
const REPEAT_OPTIONS = [
  { id: "NONE", name: "Ingen gentagelse" },
  { id: "DAILY", name: "Dagligt" },
  { id: "WEEKLY", name: "Ugentligt" },
  { id: "MONTHLY", name: "Månedligt" },
  { id: "YEARLY", name: "Årligt" },
] as const;

// Tilføj kategorier med ikoner
const CATEGORIES = [
  { value: "arbejde", label: "Arbejde", icon: "💼" },
  { value: "personlig", label: "Personlig", icon: "👤" },
  { value: "familie", label: "Familie", icon: "👨‍👩‍👧‍👦" },
  { value: "ferie", label: "Ferie", icon: "🏖️" },
  { value: "fødselsdag", label: "Fødselsdag", icon: "🎂" },
  { value: "møde", label: "Møde", icon: "🤝" },
  { value: "læge", label: "Læge", icon: "👨‍⚕️" },
  { value: "andet", label: "Andet", icon: "📌" },
] as const;

interface CreateEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  createEvent: (event: Omit<Event, "id" | "userId">) => Promise<void>;
}

export function CreateEventDialog({
  isOpen,
  onOpenChange,
  defaultDate = new Date(),
  createEvent,
}: CreateEventDialogProps) {
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const [calendars, setCalendars] = useState<
    Array<{ id: string; name: string; user_id: string; permission: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarUsers, setCalendarUsers] = useState<
    { email: string; full_name?: string }[]
  >([]);

  const form = useForm<Omit<Event, "id" | "userId">>({
    defaultValues: {
      title: "",
      description: "",
      start: defaultDate,
      end: defaultDate,
      allDay: false,
      color: "#4285F4",
    },
  });

  // Tilføj fetchCalendars funktion
  const fetchCalendars = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("Ingen bruger fundet");
      return;
    }

    // Hent brugerens egne kalendere
    const { data: userCalendars, error: userCalendarsError } = await supabase
      .from("calendars")
      .select("id, name, user_id")
      .eq("user_id", user.id);

    if (userCalendarsError) {
      console.log(
        "Fejl ved hentning af brugerens kalendere:",
        userCalendarsError
      );
      return;
    }

    // Hent delte kalendere
    const { data: sharedCalendars, error: sharedCalendarsError } =
      await supabase
        .from("calendar_shares")
        .select(
          `
        calendar:calendar_id (
          id,
          name,
          user_id
        ),
        permission
      `
        )
        .eq("user_id", user.id)
        .eq("status", "accepted");

    if (sharedCalendarsError) {
      console.log(
        "Fejl ved hentning af delte kalendere:",
        sharedCalendarsError
      );
      return;
    }

    // Kombiner brugerens egne kalendere (som owner) med delte kalendere
    const allCalendars = [
      ...(userCalendars || []).map((cal) => ({
        id: cal.id,
        name: cal.name,
        user_id: cal.user_id,
        permission: "owner",
      })),
      ...(sharedCalendars || []).map((share) => ({
        id: share.calendar.id,
        name: share.calendar.name,
        user_id: share.calendar.user_id,
        permission: share.permission,
      })),
    ];

    console.log("Alle kalendere med tilladelser:", allCalendars);
    setCalendars(allCalendars);
  };

  // Opdater useEffect til at bruge fetchCalendars
  useEffect(() => {
    const channel = supabase
      .channel("calendar-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calendars" },
        () => {
          fetchCalendars();
        }
      )
      .subscribe();

    // Hent kalendere første gang
    fetchCalendars();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Opdater form schema til kun at vise kalendere hvor brugeren har rettigheder
  const calendarsWithWriteAccess = calendars.filter((cal) => {
    const hasWriteAccess = ["owner", "admin", "editor"].includes(
      cal.permission
    );
    console.log(
      `Kalender ${cal.name} har tilladelse: ${cal.permission}, hasWriteAccess: ${hasWriteAccess}`
    );
    return hasWriteAccess;
  });

  console.log("Kalendere med skriverettigheder:", calendarsWithWriteAccess);

  // Hent kalenderens brugere når kalenderen vælges
  useEffect(() => {
    const fetchCalendarUsers = async () => {
      const selectedCalendarId = form.watch("calendar_id");
      if (!selectedCalendarId) return;

      const { data: shares, error } = await supabase
        .from("calendar_shares")
        .select("email, user_id")
        .eq("calendar_id", selectedCalendarId)
        .eq("status", "accepted");

      if (error) {
        console.error("Fejl ved hentning af kalenderdelte brugere:", error);
        return;
      }

      // Brug email som navn hvis vi ikke kan hente brugerdata
      const usersWithNames = shares.map((share) => ({
        email: share.email,
        full_name: share.email,
      }));

      setCalendarUsers(usersWithNames);
    };

    fetchCalendarUsers();
  }, [form.watch("calendar_id")]);

  const handleSubmit = async (data: Omit<Event, "id" | "userId">) => {
    try {
      setIsLoading(true);

      await createEvent(data);
      form.reset();
      onOpenChange(false);
      toast.success("Begivenheden blev oprettet");
    } catch (error) {
      console.error("Fejl ved oprettelse af begivenhed:", error);
      toast.error("Der skete en fejl ved oprettelse af begivenheden");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] min-h-screen sm:min-h-0 sm:max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden sm:w-full sm:rounded-lg">
        <div className="p-4 pb-0">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-medium">
              Opret begivenhed
            </DialogTitle>
            <DialogDescription className="text-sm">
              {calendarsWithWriteAccess.length > 0
                ? "Udfyld detaljerne for din nye begivenhed"
                : "Du har ikke tilladelse til at oprette begivenheder i nogen af de valgte kalendere"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {calendarsWithWriteAccess.length > 0 ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="calendar_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Kalender
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Vælg kalender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {calendarsWithWriteAccess.map((calendar) => (
                            <SelectItem
                              key={calendar.id}
                              value={calendar.id}
                              className="h-12"
                            >
                              {calendar.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Titel</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Skriv en titel..."
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base">Startdato</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full h-11 justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "d. MMMM yyyy")
                                ) : (
                                  <span>Vælg dato</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base">Slutdato</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full h-11 justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "d. MMMM yyyy")
                                ) : (
                                  <span>Vælg dato</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="allDay"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 h-11">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-110"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 text-base">
                        Hele dagen
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {!form.watch("allDay") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            Starttidspunkt
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            Sluttidspunkt
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Lokation
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Indtast en adresse eller lokation"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Indtast en fuld adresse for at kunne åbne den i Google
                        Maps senere
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Kategori
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vælg en kategori">
                              {field.value && (
                                <span className="flex items-center gap-2">
                                  {
                                    CATEGORIES.find(
                                      (cat) => cat.value === field.value
                                    )?.icon
                                  }
                                  {
                                    CATEGORIES.find(
                                      (cat) => cat.value === field.value
                                    )?.label
                                  }
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                              className="flex items-center gap-2"
                            >
                              <span>{category.icon}</span>
                              <span>{category.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Accordion type="single" collapsible className="w-full">
                {/* Detaljer sektion */}
                <AccordionItem value="details" className="border-b-0">
                  <AccordionTrigger className="text-base py-4 hover:no-underline hover:bg-muted/50 px-4 rounded-lg">
                    Detaljer
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Beskrivelse (valgfrit)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tilføj en beskrivelse"
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lokation (valgfrit)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tilføj en lokation"
                              {...field}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const selectedCategory =
                                PREDEFINED_CATEGORIES.find(
                                  (cat) => cat.id === value
                                );
                              if (selectedCategory) {
                                form.setValue("color", selectedCategory.color);
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Vælg kategori">
                                  {field.value && (
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded-full"
                                        style={{
                                          backgroundColor:
                                            PREDEFINED_CATEGORIES.find(
                                              (cat) => cat.id === field.value
                                            )?.color || "#4285F4",
                                        }}
                                      />
                                      {
                                        PREDEFINED_CATEGORIES.find(
                                          (cat) => cat.id === field.value
                                        )?.name
                                      }
                                    </div>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PREDEFINED_CATEGORIES.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Gentagelse sektion */}
                <AccordionItem value="repeat" className="border-b-0">
                  <AccordionTrigger className="text-base py-4 hover:no-underline hover:bg-muted/50 px-4 rounded-lg">
                    Gentagelse
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-4">
                    <FormField
                      control={form.control}
                      name="repeat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gentagelse</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Vælg gentagelse" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REPEAT_OPTIONS.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("repeat") !== "NONE" && (
                      <>
                        <FormField
                          control={form.control}
                          name="repeat_interval"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gentag hver</FormLabel>
                              <div className="flex items-center space-x-2">
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    className="w-20 h-11"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <span className="text-muted-foreground">
                                  {form.watch("repeat") === "DAILY" && "dag(e)"}
                                  {form.watch("repeat") === "WEEKLY" &&
                                    "uge(r)"}
                                  {form.watch("repeat") === "MONTHLY" &&
                                    "måned(er)"}
                                  {form.watch("repeat") === "YEARLY" && "år"}
                                </span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="repeat_until"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gentag indtil</FormLabel>
                              <FormControl>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full h-11 justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "d. MMMM yyyy")
                                      ) : (
                                        <span>Vælg slutdato</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Invitationer sektion */}
                <AccordionItem value="invitations" className="border-b-0">
                  <AccordionTrigger className="text-base py-4 hover:no-underline hover:bg-muted/50 px-4 rounded-lg">
                    Invitationer
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-4">
                    <FormField
                      control={form.control}
                      name="invitations"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-col gap-3">
                            {/* Vis kalenderdelte brugere */}
                            {calendarUsers.length > 0 ? (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Vælg deltagere
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                  {calendarUsers.map((user) => (
                                    <Button
                                      key={user.email}
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        "h-9 gap-2",
                                        (field.value || []).includes(
                                          user.email
                                        ) && "bg-primary/10"
                                      )}
                                      onClick={() => {
                                        const currentInvitations =
                                          field.value || [];
                                        if (
                                          currentInvitations.includes(
                                            user.email
                                          )
                                        ) {
                                          field.onChange(
                                            currentInvitations.filter(
                                              (email) => email !== user.email
                                            )
                                          );
                                        } else {
                                          field.onChange([
                                            ...currentInvitations,
                                            user.email,
                                          ]);
                                        }
                                      }}
                                    >
                                      {(field.value || []).includes(
                                        user.email
                                      ) ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Plus className="h-4 w-4" />
                                      )}
                                      <span>
                                        {user.full_name || user.email}
                                      </span>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Ingen brugere at invitere fra denne kalender
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <DialogFooter className="flex-col gap-3 p-4 mt-auto border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full h-12"
                >
                  Annuller
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12"
                >
                  {isLoading ? "Opretter..." : "Opret begivenhed"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">
              Du skal have editor eller admin rettigheder for at kunne oprette
              begivenheder.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
