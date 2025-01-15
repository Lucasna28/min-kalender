import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  addDays,
  addWeeks,
  setDay,
  startOfWeek as dateStartOfWeek,
  endOfWeek as dateEndOfWeek,
  startOfMonth as dateStartOfMonth,
  endOfMonth as dateEndOfMonth,
  isSameDay as dateIsSameDay,
  isToday as dateIsToday,
  isWeekend,
} from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('da-DK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('da-DK', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('da-DK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getMonthName(month: number): string {
  return new Intl.DateTimeFormat('da-DK', { month: 'long' }).format(new Date(2000, month))
}

export function getWeekDays(): string[] {
  return [...Array(7)].map((_, i) => {
    return new Intl.DateTimeFormat('da-DK', { weekday: 'long' }).format(new Date(2000, 0, i + 3))
  })
}

export function getShortWeekDays(): string[] {
  return [...Array(7)].map((_, i) => {
    return new Intl.DateTimeFormat('da-DK', { weekday: 'short' }).format(new Date(2000, 0, i + 3))
  })
}

// Re-export date-fns functions
export { 
  addDays,
  addWeeks,
  setDay,
  dateStartOfWeek as startOfWeek,
  dateEndOfWeek as endOfWeek,
  dateStartOfMonth as startOfMonth,
  dateEndOfMonth as endOfMonth,
  dateIsSameDay as isSameDay,
  dateIsToday as isToday,
};

export function isInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end
}

// Beregn påskedag for et givet år (Meeus/Jones/Butcher algoritme)
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

// Beregn Store Bededag (4. fredag efter påske)
function calculateStoreBededag(easter: Date): Date {
  return addWeeks(setDay(easter, 5), 3); // 5 = fredag
}

// Beregn Kristi Himmelfartsdag (39 dage efter påskedag)
function calculateKristiHimmelfart(easter: Date): Date {
  return addDays(easter, 39);
}

// Beregn Pinsedag (49 dage efter påskedag)
function calculatePinse(easter: Date): Date {
  return addDays(easter, 49);
}

// Beregn ugenummer for en dato
function getWeekOfYear(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export interface Holiday {
  date: Date;
  name: string;
  description?: string;
  color?: string;
  type: 'holiday' | 'vacation' | 'special';
}

export function getDanishHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [
    // Faste helligdage
    {
      date: new Date(year, 0, 1),
      name: "Nytårsdag",
      type: 'holiday',
      color: 'bg-red-100 text-red-800'
    },
    {
      date: new Date(year, 11, 24),
      name: "Juleaften",
      type: 'holiday',
      color: 'bg-red-100 text-red-800'
    },
    {
      date: new Date(year, 11, 25),
      name: "1. juledag",
      type: 'holiday',
      color: 'bg-red-100 text-red-800'
    },
    {
      date: new Date(year, 11, 26),
      name: "2. juledag",
      type: 'holiday',
      color: 'bg-red-100 text-red-800'
    },
    {
      date: new Date(year, 11, 31),
      name: "Nytårsaften",
      type: 'holiday',
      color: 'bg-red-100 text-red-800'
    },
    // Påske (skal beregnes)
    ...calculateEasterHolidays(year),
    // Store bededag (3. fredag efter påske)
    ...calculatePrayerDay(year),
    // Kristi himmelfartsdag (40 dage efter påske)
    ...calculateAscensionDay(year),
    // Pinse (50 dage efter påske)
    ...calculatePentecost(year),
    // Skoleferier
    ...getSchoolVacations(year),
  ];

  return holidays;
}

export function getHolidaysForDate(date: Date, holidays: Holiday[]): Holiday[] {
  return holidays.filter(holiday => dateIsSameDay(date, holiday.date));
}

export function isBankClosed(date: Date, holidays: Holiday[]): boolean {
  const isHoliday = holidays.some(holiday => 
    dateIsSameDay(date, holiday.date) && holiday.type === 'holiday'
  );
  return isHoliday || isWeekend(date);
}

function calculateEasterHolidays(year: number): Holiday[] {
  // Meeus/Jones/Butcher algoritme
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easterSunday = new Date(year, month, day);
  const easterMonday = new Date(year, month, day + 1);
  const maundyThursday = new Date(year, month, day - 3);
  const goodFriday = new Date(year, month, day - 2);

  return [
    {
      date: maundyThursday,
      name: "Skærtorsdag",
      type: 'holiday',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      date: goodFriday,
      name: "Langfredag",
      type: 'holiday',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      date: easterSunday,
      name: "Påskedag",
      type: 'holiday',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      date: easterMonday,
      name: "2. påskedag",
      type: 'holiday',
      color: 'bg-purple-100 text-purple-800'
    }
  ];
}

function calculatePrayerDay(year: number): Holiday[] {
  const easter = calculateEasterHolidays(year)[2].date; // Påskedag
  const prayerDay = new Date(easter);
  prayerDay.setDate(easter.getDate() + 26); // 4. fredag efter påske

  return [{
    date: prayerDay,
    name: "Store bededag",
    type: 'holiday',
    color: 'bg-purple-100 text-purple-800'
  }];
}

function calculateAscensionDay(year: number): Holiday[] {
  const easter = calculateEasterHolidays(year)[2].date; // Påskedag
  const ascensionDay = new Date(easter);
  ascensionDay.setDate(easter.getDate() + 39); // 40 dage efter påske minus 1 (da påskedag tæller med)

  return [{
    date: ascensionDay,
    name: "Kr. himmelfart",
    type: 'holiday',
    color: 'bg-purple-100 text-purple-800'
  }];
}

function calculatePentecost(year: number): Holiday[] {
  const easter = calculateEasterHolidays(year)[2].date; // Påskedag
  const pentecostSunday = new Date(easter);
  pentecostSunday.setDate(easter.getDate() + 49);
  const pentecostMonday = new Date(pentecostSunday);
  pentecostMonday.setDate(pentecostSunday.getDate() + 1);

  return [
    {
      date: pentecostSunday,
      name: "Pinsedag",
      type: 'holiday',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      date: pentecostMonday,
      name: "2. pinsedag",
      type: 'holiday',
      color: 'bg-purple-100 text-purple-800'
    }
  ];
}

function getSchoolVacations(year: number): Holiday[] {
  return [
    // Vinterferie (uge 7)
    {
      date: new Date(year, 1, 12),
      name: "Vinterferie",
      type: 'vacation',
      color: 'bg-blue-100 text-blue-800'
    },
    // Sommerferie (sidste lørdag i juni til første søndag i august)
    {
      date: new Date(year, 5, 24),
      name: "Sommerferie",
      type: 'vacation',
      color: 'bg-yellow-100 text-yellow-800'
    },
    // Efterårsferie (uge 42)
    {
      date: new Date(year, 9, 14),
      name: "Efterårsferie",
      type: 'vacation',
      color: 'bg-orange-100 text-orange-800'
    },
    // Juleferie (23. december til 2. januar)
    {
      date: new Date(year, 11, 23),
      name: "Juleferie",
      type: 'vacation',
      color: 'bg-red-100 text-red-800'
    }
  ];
}

// Hjælpefunktioner til at tjekke datoer
export function isDateInRange(date: Date, start: Date, end?: Date): boolean {
  if (!end) return dateIsSameDay(date, start);
  return date >= start && date <= end;
}
