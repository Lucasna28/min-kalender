import type { CalendarViewType } from "@/components/calendar/calendar-view";

export const CALENDAR_VIEWS = ["day", "week", "month", "year"] as const;

export const VIEW_OPTIONS = {
  month: "Måned",
  week: "Uge",
  day: "Dag",
  year: "År",
} as const;

export const WEEKDAYS = [
  { key: "monday", label: "Mandag", shortLabel: "Man" },
  { key: "tuesday", label: "Tirsdag", shortLabel: "Tir" },
  { key: "wednesday", label: "Onsdag", shortLabel: "Ons" },
  { key: "thursday", label: "Torsdag", shortLabel: "Tor" },
  { key: "friday", label: "Fredag", shortLabel: "Fre" },
  { key: "saturday", label: "Lørdag", shortLabel: "Lør" },
  { key: "sunday", label: "Søndag", shortLabel: "Søn" },
] as const;
