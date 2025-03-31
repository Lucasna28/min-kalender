"use client";

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { eventSchema } from "@/lib/calendar-constants";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronRight,
  Tag,
  AlignLeft,
  Repeat,
} from "lucide-react";
import { CategorySelect } from "./event-form/category-select";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface MobileEventDialogProps {
  form: UseFormReturn<z.infer<typeof eventSchema>>;
  isLoading: boolean;
  handleSubmit: (data: z.infer<typeof eventSchema>) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  calendars: any[];
  currentUser: any;
  invitedUsers: Array<{ email: string; name?: string }>;
  searchUsers: string;
  setSearchUsers: (value: string) => void;
  eventToEdit?: any | null;
}

export function MobileEventDialog({
  form,
  isLoading,
  handleSubmit,
  onOpenChange,
  calendars,
  currentUser,
  invitedUsers,
  searchUsers,
  setSearchUsers,
  eventToEdit,
}: MobileEventDialogProps) {
  // State til at kontrollere åben/lukket tilstand af popovers
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isRepeatOpen, setIsRepeatOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  // Tjek om formularen er gyldig baseret på om titlen er udfyldt
  const formTitle = form.watch("title");
  const formCalendarId = form.watch("calendar_id");
  const formStartDate = form.watch("start_date");
  const formEndDate = form.watch("end_date");

  const formIsValid =
    !!formTitle &&
    formTitle.trim().length > 0 &&
    !!formCalendarId &&
    !!formStartDate &&
    !!formEndDate;

  // Refs til at kontrollere popover-komponenter
  const calendarPopoverRef = useRef<HTMLButtonElement>(null);
  const categoryPopoverRef = useRef<HTMLButtonElement>(null);
  const repeatPopoverRef = useRef<HTMLButtonElement>(null);
  // Ref til scrollable content div
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Beregn om vi kan scrolle op eller ned
  const canScrollUp = scrollPosition > 10;
  const canScrollDown = scrollPosition + clientHeight < scrollHeight - 10;

  // Scroll funktioner til at scrolle op eller ned ved klik på indikatorer
  const handleScrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -200, behavior: "smooth" });
    }
  };

  const handleScrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 200, behavior: "smooth" });
    }
  };

  // Håndter scroll events for at opdatere scroll-position og dimensioner
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      setScrollPosition(scrollTop);
      setScrollHeight(scrollHeight);
      setClientHeight(clientHeight);
    }
  };

  // Initialiser scroll info ved første render
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      setScrollHeight(scrollHeight);
      setClientHeight(clientHeight);
    }
  }, []);

  // Funktion til at få kategorifarven baseret på kategori-id
  const getCategoryColor = (categoryId: string) => {
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
    return colors[categoryId] || colors.andet;
  };

  // Funktion til at få kategorinavn baseret på kategori-id
  const getCategoryName = (categoryId: string) => {
    const names: Record<string, string> = {
      arbejde: "Arbejde",
      personlig: "Personligt",
      familie: "Familie",
      ferie: "Ferie",
      fødselsdag: "Fødselsdag",
      møde: "Møde",
      læge: "Læge",
      andet: "Andet",
    };
    return names[categoryId] || names.andet;
  };

  // Funktion til at få kategori-emoji baseret på kategori-id
  const getCategoryEmoji = (categoryId: string) => {
    const emojis: Record<string, string> = {
      arbejde: "💼",
      personlig: "👤",
      familie: "👨‍👩‍👧‍👦",
      ferie: "✈️",
      fødselsdag: "🎂",
      møde: "🤝",
      læge: "🏥",
      andet: "📌",
    };
    return emojis[categoryId] || emojis.andet;
  };

  // Funktion til at finde kalendernavnet baseret på ID
  const getCalendarName = (calendarId: string) => {
    const calendar = calendars.find((cal) => cal.id === calendarId);
    return calendar?.name || "Vælg kalender";
  };

  // Funktion til at generere et grid med dage for en måned
  const getDaysInMonthGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Første dag i måneden
    const firstDay = new Date(year, month, 1);
    // Sidste dag i måneden
    const lastDay = new Date(year, month + 1, 0);

    // Hvilket ugedag starter måneden på (0 = søndag, 1 = mandag, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Konverter til mandag-søndag format (0 = mandag, 6 = søndag)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Array til at holde alle datoer
    const daysArray: Date[] = [];

    // Tilføj dage fra forrige måned
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -firstDayOfWeek + i + 1);
      daysArray.push(prevDate);
    }

    // Tilføj dage fra denne måned
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(year, month, i));
    }

    // Tilføj dage fra næste måned for at fylde grid'et ud til 42 dage (6 uger)
    const remainingDays = 42 - daysArray.length;
    for (let i = 1; i <= remainingDays; i++) {
      daysArray.push(new Date(year, month + 1, i));
    }

    return daysArray;
  };

  // Funktion til at sammenligne om to datoer er samme dag
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  return (
    <DialogContent className="max-w-[96%] sm:max-w-[450px] p-0 gap-0 overflow-hidden border-none shadow-2xl h-auto max-h-[85vh] rounded-2xl bg-[#121212] animate-in fade-in-0 zoom-in-95 duration-300 slide-in-from-bottom-5 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-5 data-[state=closed]:duration-300">
      <DialogTitle className="sr-only">
        {eventToEdit ? "Rediger begivenhed" : "Opret ny begivenhed"}
      </DialogTitle>

      {/* iOS-style swipe indicator at the top */}
      <div className="w-full flex justify-center pt-2 pb-1">
        <div className="w-12 h-1 bg-white/20 rounded-full"></div>
      </div>

      {/* Header - forbedret med mere iOS-lignende stil */}
      <div className="px-6 py-4 border-b border-[#2c2c2e] flex items-center justify-center sticky top-0 z-30 bg-[#1c1c1e] backdrop-blur-lg bg-opacity-95">
        <h2 className="text-[17px] font-semibold text-white">
          {eventToEdit ? "Rediger begivenhed" : "Ny begivenhed"}
        </h2>
      </div>

      <Form {...form}>
        <form
          id="mobile-event-form"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await form.handleSubmit(async (data) => {
                await handleSubmit(data);
                // Luk dialogen efter vellykket oprettelse/opdatering
                onOpenChange(false);
              })();
            } catch (error) {
              console.error("Fejl ved oprettelse af begivenhed:", error);
              toast.error("Der skete en fejl ved oprettelse af begivenheden");
            }
          }}
        >
          <div
            className="overflow-y-auto max-h-[calc(85vh-160px)] bg-[#121212] text-white relative"
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            {/* Top scroll indikator - vises kun når scrollet ned */}
            {canScrollUp && (
              <div
                className="sticky top-0 left-0 right-0 z-10"
                onClick={handleScrollUp}
              >
                <div className="h-8 bg-gradient-to-b from-[#121212] to-transparent opacity-90 cursor-pointer">
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center">
                    <div className="w-[40px] h-[5px] rounded-full bg-white/40 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Titel input - tilføjet tilbage med forbedret styling */}
            <div className="bg-[#1c1c1e] border-b border-[#2c2c2e]">
              <div className="px-6 pt-6 pb-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] text-[#8E8E93] font-medium mb-2.5 block uppercase tracking-wider">
                        Titel
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Begivenhedens titel..."
                          className="bg-[#2c2c2e] border-none text-white text-[17px] p-3 h-14 focus-visible:ring-1 focus-visible:ring-[#0A84FF] placeholder:text-[#8E8E93] font-normal rounded-xl px-4 w-full transition-all"
                          {...field}
                          autoComplete="off"
                          autoCapitalize="on"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[12px] mt-1.5" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Beskrivelse input - forbedret brugeroplevelse */}
            <div className="border-b border-[#2c2c2e] bg-[#1c1c1e]">
              <div className="px-6 pt-3 pb-5">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-[13px] text-[#8E8E93] font-medium mb-2.5 block uppercase tracking-wider">
                        Beskrivelse
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tilføj detaljer om begivenheden..."
                          className="bg-[#2c2c2e] border-none text-[17px] p-3 min-h-[100px] h-auto focus-visible:ring-1 focus-visible:ring-[#0A84FF] placeholder:text-[#8E8E93] resize-none font-normal rounded-xl px-4 w-full transition-all"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[12px] mt-1.5" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Kalender vælger med Select i stedet for Popover */}
            <div className="border-b border-[#2c2c2e] bg-[#1c1c1e]">
              <div className="flex items-center px-6 py-5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF9500] to-[#FF7B00] flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                  <CalendarIcon className="w-4.5 h-4.5 text-white" />
                </div>
                <FormField
                  control={form.control}
                  name="calendar_id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <div className="flex items-center justify-between w-full whitespace-nowrap">
                        <span className="text-[16px] font-normal text-white mr-2">
                          Kalender
                        </span>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[#2c2c2e] border-none text-[#0A84FF] h-12 min-w-[160px] max-w-[180px] rounded-xl focus:ring-1 focus:ring-[#0A84FF] font-normal shadow-sm touch-manipulation transition-all hover:bg-[#3a3a3c]">
                              <SelectValue>
                                <div className="flex items-center max-w-full overflow-hidden">
                                  <span className="truncate max-w-[160px] text-ellipsis overflow-hidden whitespace-nowrap">
                                    {getCalendarName(field.value)}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#2c2c2e] border-[#2c2c2e] text-white rounded-xl overflow-hidden shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                            <div className="px-3 py-3 border-b border-[#3a3a3c]">
                              <h3 className="text-[15px] font-medium text-white">
                                Vælg kalender
                              </h3>
                            </div>
                            {calendars
                              .filter((cal) => cal.user_id === currentUser?.id)
                              .map((calendar) => (
                                <SelectItem
                                  key={calendar.id}
                                  value={calendar.id}
                                  className="text-white py-4 px-3 hover:bg-[#3a3a3c] text-[16px] focus:bg-[#3a3a3c] focus:text-white cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center">
                                    <div
                                      className="w-6 h-6 rounded-full mr-3"
                                      style={{
                                        backgroundColor:
                                          calendar.color || "#0A84FF",
                                      }}
                                    ></div>
                                    {calendar.name}
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Kategori vælger med Select i stedet for Popover */}
            <div className="border-b border-[#2c2c2e] bg-[#1c1c1e]">
              <div className="flex items-center px-6 py-5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#34C759] to-[#28A745] flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                  <Tag className="w-4.5 h-4.5 text-white" />
                </div>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <div className="flex items-center justify-between w-full whitespace-nowrap">
                        <span className="text-[16px] font-normal text-white mr-2">
                          Kategori
                        </span>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[#2c2c2e] border-none text-[#0A84FF] h-12 min-w-[160px] max-w-[180px] rounded-xl focus:ring-1 focus:ring-[#0A84FF] font-normal shadow-sm touch-manipulation transition-all hover:bg-[#3a3a3c]">
                              <SelectValue>
                                <div className="flex items-center max-w-full overflow-hidden">
                                  <div
                                    className="w-6 h-6 rounded-full mr-2 flex-shrink-0 flex items-center justify-center"
                                    style={{
                                      backgroundColor: getCategoryColor(
                                        field.value
                                      ),
                                    }}
                                  >
                                    <span className="text-[13px]">
                                      {getCategoryEmoji(field.value)}
                                    </span>
                                  </div>
                                  <span className="truncate max-w-[100px] text-ellipsis overflow-hidden whitespace-nowrap">
                                    {getCategoryName(field.value)}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#2c2c2e] border-[#2c2c2e] text-white rounded-xl overflow-hidden shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                            <div className="px-3 py-3 border-b border-[#3a3a3c]">
                              <h3 className="text-[15px] font-medium text-white">
                                Vælg kategori
                              </h3>
                            </div>
                            {[
                              { id: "arbejde", name: "Arbejde", emoji: "💼" },
                              {
                                id: "personlig",
                                name: "Personligt",
                                emoji: "👤",
                              },
                              { id: "familie", name: "Familie", emoji: "👨‍👩‍👧‍👦" },
                              { id: "ferie", name: "Ferie", emoji: "✈️" },
                              {
                                id: "fødselsdag",
                                name: "Fødselsdag",
                                emoji: "🎂",
                              },
                              { id: "møde", name: "Møde", emoji: "🤝" },
                              { id: "læge", name: "Læge", emoji: "🏥" },
                              { id: "andet", name: "Andet", emoji: "📌" },
                            ].map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id}
                                className="text-white py-4 px-3 hover:bg-[#3a3a3c] text-[16px] focus:bg-[#3a3a3c] focus:text-white cursor-pointer transition-colors"
                              >
                                <div className="flex items-center">
                                  <div
                                    className="w-7 h-7 rounded-full mr-3 flex items-center justify-center"
                                    style={{
                                      backgroundColor: getCategoryColor(
                                        category.id
                                      ),
                                    }}
                                  >
                                    <span className="text-[15px]">
                                      {category.emoji}
                                    </span>
                                  </div>
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dato og tid sektion - kompakt iOS-inspireret design */}
            <div className="border-b border-[#2c2c2e] bg-[#1c1c1e]">
              <div className="px-6 pt-5 pb-6">
                {/* Hele dagen toggle - flyttet til toppen */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[17px] font-medium text-white">
                    Hele dagen
                  </span>
                  <FormField
                    control={form.control}
                    name="is_all_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-[#0A84FF] data-[state=checked]:border-[#0A84FF]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-5">
                  {/* STARTER sektion */}
                  <div>
                    <span className="text-[#8E8E93] text-[15px] uppercase font-medium mb-2.5 block">
                      STARTER
                    </span>

                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center bg-[#2c2c2e] text-white px-5 py-2.5 rounded-xl justify-center relative overflow-hidden cursor-pointer h-14 transition-all hover:bg-[#3a3a3c]">
                                  <div className="flex items-center">
                                    <CalendarIcon className="w-6 h-6 text-white opacity-60 mr-3" />
                                    <span className="text-[19px] font-medium text-white">
                                      {field.value ? (
                                        <>
                                          <span className="text-white font-medium">
                                            {format(field.value, "EEE.", {
                                              locale: da,
                                            })}
                                          </span>
                                          <span className="text-white ml-1 font-medium">
                                            {format(field.value, "d. MMM", {
                                              locale: da,
                                            })}
                                          </span>
                                        </>
                                      ) : (
                                        "Vælg dato"
                                      )}
                                    </span>
                                  </div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button className="absolute inset-0 w-full h-full opacity-0" />
                                    </PopoverTrigger>
                                    <PopoverContent
                                      side="bottom"
                                      align="start"
                                      className="bg-[#1c1c1e] border-[#2c2c2e] p-0 rounded-xl w-full shadow-xl max-w-[280px] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                                    >
                                      <div className="p-3">
                                        <div className="grid grid-cols-7 gap-1">
                                          {[
                                            "ma",
                                            "ti",
                                            "on",
                                            "to",
                                            "fr",
                                            "lø",
                                            "sø",
                                          ].map((day) => (
                                            <div
                                              key={day}
                                              className="text-center text-[#8E8E93] text-[12px]"
                                            >
                                              {day}
                                            </div>
                                          ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 mt-1">
                                          {getDaysInMonthGrid(
                                            field.value || new Date()
                                          ).map((date, index) => {
                                            const isCurrentMonth =
                                              date.getMonth() ===
                                              (
                                                field.value || new Date()
                                              ).getMonth();
                                            const isSelected =
                                              field.value &&
                                              isSameDay(date, field.value);
                                            const isToday = isSameDay(
                                              date,
                                              new Date()
                                            );

                                            return (
                                              <Button
                                                key={index}
                                                variant="ghost"
                                                className={cn(
                                                  "h-7 w-7 p-0 rounded-full text-[13px]",
                                                  isSelected
                                                    ? "bg-[#0A84FF] text-white"
                                                    : "text-white",
                                                  !isSelected &&
                                                    isToday &&
                                                    "border border-[#0A84FF]",
                                                  !isCurrentMonth &&
                                                    "opacity-30"
                                                )}
                                                disabled={!isCurrentMonth}
                                                onClick={() => {
                                                  field.onChange(date);
                                                  const popoverTrigger =
                                                    document.activeElement as HTMLElement;
                                                  popoverTrigger?.blur();
                                                }}
                                              >
                                                {date.getDate()}
                                              </Button>
                                            );
                                          })}
                                        </div>

                                        <div className="mt-2 text-right">
                                          <Button
                                            variant="ghost"
                                            className="text-[#0A84FF] hover:bg-[#2c2c2e] text-[14px] h-7 px-2 rounded-lg"
                                            onClick={() => {
                                              field.onChange(new Date());
                                              const popoverTrigger =
                                                document.activeElement as HTMLElement;
                                              popoverTrigger?.blur();
                                            }}
                                          >
                                            I dag
                                          </Button>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {!form.watch("is_all_day") && (
                        <div className="w-40">
                          <FormField
                            control={form.control}
                            name="start_time"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center justify-center bg-[#2c2c2e] rounded-xl px-3 h-14">
                                    <Clock className="w-5 h-5 text-white opacity-60 mr-2" />
                                    <Input
                                      type="time"
                                      className="bg-transparent border-none text-white text-[19px] p-0 focus-visible:ring-0 w-auto font-medium"
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                    />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SLUTTER sektion */}
                  <div>
                    <span className="text-[#8E8E93] text-[15px] uppercase font-medium mb-2.5 block">
                      SLUTTER
                    </span>

                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center bg-[#2c2c2e] text-white px-5 py-2.5 rounded-xl justify-center relative overflow-hidden cursor-pointer h-14 transition-all hover:bg-[#3a3a3c]">
                                  <div className="flex items-center">
                                    <CalendarIcon className="w-6 h-6 text-white opacity-60 mr-3" />
                                    <span className="text-[19px] font-medium text-white">
                                      {field.value ? (
                                        <>
                                          <span className="text-white font-medium">
                                            {format(field.value, "EEE.", {
                                              locale: da,
                                            })}
                                          </span>
                                          <span className="text-white ml-1 font-medium">
                                            {format(field.value, "d. MMM", {
                                              locale: da,
                                            })}
                                          </span>
                                        </>
                                      ) : (
                                        "Vælg dato"
                                      )}
                                    </span>
                                  </div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button className="absolute inset-0 w-full h-full opacity-0" />
                                    </PopoverTrigger>
                                    <PopoverContent
                                      side="bottom"
                                      align="start"
                                      className="bg-[#1c1c1e] border-[#2c2c2e] p-0 rounded-xl w-full shadow-xl max-w-[280px] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                                    >
                                      <div className="p-3">
                                        <div className="grid grid-cols-7 gap-1">
                                          {[
                                            "ma",
                                            "ti",
                                            "on",
                                            "to",
                                            "fr",
                                            "lø",
                                            "sø",
                                          ].map((day) => (
                                            <div
                                              key={day}
                                              className="text-center text-[#8E8E93] text-[12px]"
                                            >
                                              {day}
                                            </div>
                                          ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 mt-1">
                                          {getDaysInMonthGrid(
                                            field.value || new Date()
                                          ).map((date, index) => {
                                            const isCurrentMonth =
                                              date.getMonth() ===
                                              (
                                                field.value || new Date()
                                              ).getMonth();
                                            const isSelected =
                                              field.value &&
                                              isSameDay(date, field.value);
                                            const isToday = isSameDay(
                                              date,
                                              new Date()
                                            );
                                            const isBeforeStart =
                                              form.getValues("start_date") &&
                                              date <
                                                form.getValues("start_date");

                                            return (
                                              <Button
                                                key={index}
                                                variant="ghost"
                                                className={cn(
                                                  "h-7 w-7 p-0 rounded-full text-[13px]",
                                                  isSelected
                                                    ? "bg-[#0A84FF] text-white"
                                                    : "text-white",
                                                  !isSelected &&
                                                    isToday &&
                                                    "border border-[#0A84FF]",
                                                  !isCurrentMonth &&
                                                    "opacity-30",
                                                  isBeforeStart && "opacity-30"
                                                )}
                                                disabled={
                                                  !isCurrentMonth ||
                                                  isBeforeStart
                                                }
                                                onClick={() => {
                                                  field.onChange(date);
                                                  const popoverTrigger =
                                                    document.activeElement as HTMLElement;
                                                  popoverTrigger?.blur();
                                                }}
                                              >
                                                {date.getDate()}
                                              </Button>
                                            );
                                          })}
                                        </div>

                                        <div className="mt-2 text-right">
                                          <Button
                                            variant="ghost"
                                            className="text-[#0A84FF] hover:bg-[#2c2c2e] text-[14px] h-7 px-2 rounded-lg"
                                            onClick={() => {
                                              field.onChange(new Date());
                                              const popoverTrigger =
                                                document.activeElement as HTMLElement;
                                              popoverTrigger?.blur();
                                            }}
                                          >
                                            I dag
                                          </Button>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {!form.watch("is_all_day") && (
                        <div className="w-40">
                          <FormField
                            control={form.control}
                            name="end_time"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center justify-center bg-[#2c2c2e] rounded-xl px-3 h-14">
                                    <Clock className="w-5 h-5 text-white opacity-60 mr-2" />
                                    <Input
                                      type="time"
                                      className="bg-transparent border-none text-white text-[19px] p-0 focus-visible:ring-0 w-auto font-medium"
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                    />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gentagelse med Select i stedet for Popover */}
            <div className="border-b border-[#2c2c2e] bg-[#1c1c1e]">
              <div className="flex items-center px-6 py-5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5856D6] to-[#4A39C4] flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                  <Repeat className="w-4.5 h-4.5 text-white" />
                </div>
                <FormField
                  control={form.control}
                  name="repeat"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <div className="flex items-center justify-between w-full whitespace-nowrap">
                        <span className="text-[16px] font-normal text-white mr-2">
                          Gentag
                        </span>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === "null" ? null : value)
                          }
                          defaultValue={field.value || "null"}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[#2c2c2e] border-none text-[#0A84FF] h-12 min-w-[160px] max-w-[180px] rounded-xl focus:ring-1 focus:ring-[#0A84FF] font-normal shadow-sm touch-manipulation transition-all hover:bg-[#3a3a3c]">
                              <SelectValue>
                                <span className="truncate max-w-[100px] text-ellipsis overflow-hidden whitespace-nowrap">
                                  {field.value === null ||
                                  field.value === "null"
                                    ? "Aldrig"
                                    : field.value === "weekly"
                                      ? "Hver uge"
                                      : field.value === "monthly"
                                        ? "Hver måned"
                                        : field.value === "yearly"
                                          ? "Hvert år"
                                          : "Aldrig"}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#2c2c2e] border-[#2c2c2e] text-white rounded-xl overflow-hidden shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                            <div className="px-3 py-3 border-b border-[#3a3a3c]">
                              <h3 className="text-[15px] font-medium text-white">
                                Gentagelse
                              </h3>
                            </div>
                            <SelectItem
                              value="null"
                              className="text-white py-4 px-3 hover:bg-[#3a3a3c] text-[16px] focus:bg-[#3a3a3c] focus:text-white cursor-pointer transition-colors"
                            >
                              Aldrig
                            </SelectItem>
                            <SelectItem
                              value="weekly"
                              className="text-white py-4 px-3 hover:bg-[#3a3a3c] text-[16px] focus:bg-[#3a3a3c] focus:text-white cursor-pointer transition-colors"
                            >
                              Hver uge
                            </SelectItem>
                            <SelectItem
                              value="monthly"
                              className="text-white py-4 px-3 hover:bg-[#3a3a3c] text-[16px] focus:bg-[#3a3a3c] focus:text-white cursor-pointer transition-colors"
                            >
                              Hver måned
                            </SelectItem>
                            <SelectItem
                              value="yearly"
                              className="text-white py-4 px-3 hover:bg-[#3a3a3c] text-[16px] focus:bg-[#3a3a3c] focus:text-white cursor-pointer transition-colors"
                            >
                              Hvert år
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Lokation input med forbedret UI og padding */}
            <div className="border-b border-[#2c2c2e] bg-[#1c1c1e]">
              <div className="px-6 py-5">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-[13px] text-[#8E8E93] font-medium mb-2.5 block uppercase tracking-wider">
                        Lokation
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center w-full relative">
                          <Input
                            placeholder="Tilføj lokation..."
                            className="bg-[#2c2c2e] border-none text-white text-[16px] pl-10 pr-3 py-3 h-14 focus-visible:ring-1 focus-visible:ring-[#0A84FF] placeholder:text-[#8E8E93] font-normal w-full rounded-xl"
                            {...field}
                          />
                          <MapPin className="absolute left-3 h-5 w-5 text-[#8E8E93]" />
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="absolute right-2 h-8 w-8 p-0 rounded-full hover:bg-[#3a3a3c]"
                              onClick={() => field.onChange("")}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-[#8E8E93]"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </Button>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bottom scroll indikator - vises kun når man kan scrolle ned */}
            {canScrollDown && (
              <div
                className="sticky bottom-0 left-0 right-0"
                onClick={handleScrollDown}
              >
                <div className="h-8 bg-gradient-to-t from-[#121212] to-transparent opacity-90 cursor-pointer">
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center">
                    <div className="w-[40px] h-[5px] rounded-full bg-white/40 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom buttons with improved padding */}
          <div className="px-6 py-4 flex items-center justify-between bg-[#1c1c1e] mt-auto sticky bottom-0 border-t border-[#2c2c2e] shadow-md z-10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white rounded-xl py-2.5 px-4 text-[15px] font-medium flex-1 mr-3 shadow-sm h-11"
            >
              Annuller
            </Button>
            <Button
              type="submit"
              disabled={!formIsValid || isLoading}
              className={cn(
                "rounded-xl py-2.5 px-4 text-[15px] font-medium flex-1 shadow-sm h-11",
                formIsValid && !isLoading
                  ? "bg-[#0A84FF] hover:bg-[#0071e3] text-white"
                  : "bg-[#0a84ff50] text-white/70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  <span>{eventToEdit ? "Opdaterer..." : "Opretter..."}</span>
                </div>
              ) : eventToEdit ? (
                "Opdater"
              ) : (
                "Opret"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
