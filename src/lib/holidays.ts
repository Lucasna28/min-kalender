import {
  addDays,
  setMonth,
  setDate,
  getDay,
  addWeeks,
  setYear,
  lastDayOfMonth,
  startOfMonth,
  nextSunday,
  previousSunday,
  getMonth,
} from "date-fns";

// Beregn påskedag for et givet år
// Baseret på Butcher's algoritme
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

// Finder sidste søndag i en given måned
function getLastSundayOfMonth(year: number, month: number): Date {
  const lastDay = lastDayOfMonth(new Date(year, month));
  while (lastDay.getDay() !== 0) {
    addDays(lastDay, -1);
  }
  return lastDay;
}

export function getDanishHolidays(year: number) {
  // Start med at beregne påske, da mange helligdage er relative til påske
  const easter = calculateEaster(year);
  const palmSunday = addDays(easter, -7);
  const maundyThursday = addDays(easter, -3);
  const goodFriday = addDays(easter, -2);
  const easterMonday = addDays(easter, 1);
  const stPrayerDay = addDays(easter, 26); // Store Bededag (4. fredag efter påske)
  const ascensionDay = addDays(easter, 39);
  const whitSunday = addDays(easter, 49); // Pinsedag
  const whitMonday = addDays(easter, 50); // 2. Pinsedag

  // Faste helligdage
  const newYear = new Date(year, 0, 1);
  const constitution = new Date(year, 5, 5);
  const christmasEve = new Date(year, 11, 24);
  const christmas = new Date(year, 11, 25);
  const boxingDay = new Date(year, 11, 26);
  const newYearsEve = new Date(year, 11, 31);

  // Mors dag (anden søndag i maj)
  const mothersDay = (() => {
    const firstDayOfMay = startOfMonth(new Date(year, 4));
    const firstSunday = nextSunday(firstDayOfMay);
    return addDays(firstSunday, 7);
  })();

  // Fars dag (5. juni - samme som grundlovsdag)
  const fathersDay = new Date(year, 5, 5);

  // Sommertid starter (sidste søndag i marts)
  const daylightSavingStart = getLastSundayOfMonth(year, 2);

  // Vintertid starter (sidste søndag i oktober)
  const daylightSavingEnd = getLastSundayOfMonth(year, 9);

  const holidays = [
    { date: newYear, name: "Nytårsdag", type: "holiday" },
    { date: palmSunday, name: "Palmesøndag", type: "holiday" },
    { date: maundyThursday, name: "Skærtorsdag", type: "holiday" },
    { date: goodFriday, name: "Langfredag", type: "holiday" },
    { date: easter, name: "Påskedag", type: "holiday" },
    { date: easterMonday, name: "Anden påskedag", type: "holiday" },
    { date: stPrayerDay, name: "Store bededag", type: "holiday" },
    { date: ascensionDay, name: "Kristi himmelfartsdag", type: "holiday" },
    { date: whitSunday, name: "Pinsedag", type: "holiday" },
    { date: whitMonday, name: "Anden pinsedag", type: "holiday" },
    { date: constitution, name: "Grundlovsdag", type: "holiday" },
    { date: christmasEve, name: "Juleaften", type: "holiday" },
    { date: christmas, name: "Juledag", type: "holiday" },
    { date: boxingDay, name: "Anden juledag", type: "holiday" },
    { date: newYearsEve, name: "Nytårsaften", type: "holiday" },
    
    // Mærkedage
    { date: new Date(year, 1, 14), name: "Valentinsdag", type: "observance" },
    { date: daylightSavingStart, name: "Sommertid starter", type: "observance" },
    { date: mothersDay, name: "Mors dag", type: "observance" },
    { date: fathersDay, name: "Fars dag", type: "observance" },
    { date: new Date(year, 5, 21), name: "Sommersolhverv", type: "observance" },
    { date: new Date(year, 9, 31), name: "Halloween", type: "observance" },
    { date: daylightSavingEnd, name: "Vintertid starter", type: "observance" },
    { date: new Date(year, 11, 21), name: "Vintersolhverv", type: "observance" },
  ];

  // Sortér datoerne kronologisk
  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
} 