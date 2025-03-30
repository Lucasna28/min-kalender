import { addDays } from "date-fns";

export interface DanishHoliday {
  date: Date;
  title: string;
  type: "holiday" | "special" | "birthday" | "church";
  color: string;
}

// Funktion til at beregne påskedag (Meeus/Jones/Butcher algoritme)
function getEasterSunday(year: number): Date {
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

// Funktion til at finde første søndag i advent (4. søndag før jul)
function getFirstAdventSunday(year: number): Date {
  const christmas = new Date(year, 11, 24); // 24. december
  const christmasDay = christmas.getDay(); // 0 = søndag, 1 = mandag, osv.
  const daysToSubtract = christmasDay + 21; // 3 uger (21 dage) plus dage til søndag
  return addDays(christmas, -daysToSubtract);
}

// Funktion til at finde de andre adventssøndage
function getAdventSundays(year: number): Date[] {
  const firstAdvent = getFirstAdventSunday(year);
  return [
    firstAdvent,
    addDays(firstAdvent, 7),
    addDays(firstAdvent, 14),
    addDays(firstAdvent, 21),
  ];
}

export function getDanishHolidays(year: number): DanishHoliday[] {
  // Beregn påskedag
  const easterSunday = getEasterSunday(year);

  // Beregn andre bevægelige helligdage baseret på påskedag
  const palmSunday = addDays(easterSunday, -7); // Palmesøndag
  const maundyThursday = addDays(easterSunday, -3); // Skærtorsdag
  const goodFriday = addDays(easterSunday, -2); // Langfredag
  const easterMonday = addDays(easterSunday, 1); // 2. Påskedag

  // Fars Dag er samme dag som Grundlovsdag (5. juni)
  const fathersDay = new Date(year, 5, 5);

  // Beregn Mors Dag (anden søndag i maj)
  const mothersDayBase = new Date(year, 4, 1);
  const mothersDayOffset = (7 - mothersDayBase.getDay()) % 7;
  const mothersDay = addDays(mothersDayBase, mothersDayOffset + 7);

  // Beregn Pandekagedagen (tirsdagen efter fastelavn)
  // Fastelavn er 7 uger før påskedag
  const carnavalSunday = addDays(easterSunday, -49);
  const pancakeDay = addDays(carnavalSunday, 2); // Tirsdagen efter fastelavnssøndag

  const holidays: DanishHoliday[] = [
    // Faste helligdage
    {
      date: new Date(year, 0, 1),
      title: "Nytårsdag",
      type: "holiday",
      color: "#dc2626",
    },
    // Kongelige fødselsdage
    {
      date: new Date(year, 4, 26), // 26. maj
      title: "Kong Frederik X's fødselsdag",
      type: "birthday",
      color: "#3b82f6",
    },
    {
      date: new Date(year, 1, 5), // 5. februar
      title: "Dronning Mary's fødselsdag",
      type: "birthday",
      color: "#3b82f6",
    },
    {
      date: new Date(year, 9, 15), // 15. oktober
      title: "Kronprins Christian's fødselsdag",
      type: "birthday",
      color: "#3b82f6",
    },
    {
      date: new Date(year, 3, 16), // 16. april
      title: "Dronning Margrethe II's fødselsdag",
      type: "birthday",
      color: "#3b82f6",
    },
    {
      date: new Date(year, 1, 14),
      title: "Valentinsdag",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: goodFriday,
      title: "Langfredag",
      type: "holiday",
      color: "#3b82f6",
    },
    {
      date: new Date(year, 2, 8),
      title: "Kvindernes Internationale Kampdag",
      type: "special",
      color: "#ec4899",
    },
    {
      date: maundyThursday,
      title: "Skærtorsdag",
      type: "holiday",
      color: "#3b82f6",
    },
    {
      date: palmSunday,
      title: "Palmesøndag",
      type: "special",
      color: "#3b82f6",
    },
    {
      date: easterSunday,
      title: "Påskedag",
      type: "holiday",
      color: "#3b82f6",
    },
    {
      date: easterMonday,
      title: "2. Påskedag",
      type: "holiday",
      color: "#3b82f6",
    },
    {
      date: addDays(easterSunday, 26),
      title: "Store Bededag",
      type: "holiday",
      color: "#dc2626",
    },
    {
      date: new Date(year, 4, 1),
      title: "Arbejdernes Internationale Kampdag",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 4, 4),
      title: "Star Wars Dag (May the 4th)",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 4, 5),
      title: "Danmarks Befrielsesdag",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: addDays(easterSunday, 39),
      title: "Kristi Himmelfartsdag",
      type: "holiday",
      color: "#dc2626",
    },
    {
      date: mothersDay,
      title: "Mors Dag",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: addDays(easterSunday, 49),
      title: "Pinsedag",
      type: "holiday",
      color: "#dc2626",
    },
    {
      date: addDays(easterSunday, 50),
      title: "2. Pinsedag",
      type: "holiday",
      color: "#dc2626",
    },
    {
      date: new Date(year, 5, 5),
      title: "Grundlovsdag",
      type: "holiday",
      color: "#3b82f6",
    },
    {
      date: fathersDay,
      title: "Fars Dag",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 5, 15),
      title: "Valdemarsdag",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 5, 23),
      title: "Sankt Hans",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: pancakeDay,
      title: "Pandekagedagen",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 7, 1),
      title: "International Øldag",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 8, 5),
      title: "Danmarks Udsendte",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 8, 19),
      title: "International Talk Like a Pirate Day",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 9, 1),
      title: "International Kaffedag ☕",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 9, 16),
      title: "Internationale Madspildsdag",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 9, 28),
      title: "International Chokoladedag",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 7, 8), // 8. august
      title: "International Kattedag 🐱",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 7, 26), // 26. august
      title: "International Hundedag 🐕",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 1, 9), // 9. februar
      title: "International Pizzadag 🍕",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 9, 31),
      title: "Halloween",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 10, 1),
      title: "Allehelgensdag",
      type: "church",
      color: "#7c3aed",
    },
    {
      date: new Date(year, 10, 10),
      title: "Mortens Aften",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 10, 11),
      title: "Mortensdag",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: new Date(year, 11, 24),
      title: "Juleaften",
      type: "holiday",
      color: "#dc2626",
    },
    {
      date: new Date(year, 11, 25),
      title: "1. Juledag",
      type: "holiday",
      color: "#dc2626",
    },
    {
      date: new Date(year, 11, 26),
      title: "2. Juledag",
      type: "holiday",
      color: "#dc2626",
    },
    {
      date: new Date(year, 11, 31),
      title: "Nytårsaften",
      type: "holiday",
      color: "#dc2626",
    },
  ];

  // Tilføj adventssøndage
  const adventSundays = getAdventSundays(year);
  adventSundays.forEach((date, index) => {
    holidays.push({
      date,
      title: `${index + 1}. søndag i advent`,
      type: "church",
      color: "#7c3aed",
    });
  });

  // Tilføj sommertid og vintertid
  const summerTime = new Date(
    year,
    2,
    31 - (new Date(year, 2, 31).getDay() || 7),
  );
  const winterTime = new Date(
    year,
    9,
    31 - (new Date(year, 9, 31).getDay() || 7),
  );

  holidays.push(
    {
      date: summerTime,
      title: "Sommertid Starter",
      type: "special",
      color: "#f59e0b",
    },
    {
      date: winterTime,
      title: "Vintertid Starter",
      type: "special",
      color: "#f59e0b",
    },
  );

  // Tilføj fødselsdage til de eksisterende helligdage
  const birthdays: DanishHoliday[] = [
    {
      title: "Lucas' fødselsdag 🎂",
      date: new Date(year, 5, 28), // 28. juni (måned er 0-baseret, så juni er 5)
      type: "birthday",
      color: "#FF69B4",
    },
    {
      title: "Nilaus' fødselsdag 🎂",
      date: new Date(year, 0, 2), // 2. januar
      type: "birthday",
      color: "#FF69B4",
    },
    {
      title: "Fars fødselsdag 🎂",
      date: new Date(year, 0, 21), // 21. januar
      type: "birthday",
      color: "#FF69B4",
    },
    {
      title: "Moars fødselsdag 🎂",
      date: new Date(year, 1, 9), // 9. februar
      type: "birthday",
      color: "#FF69B4",
    },
  ];

  // Kombiner helligdage og fødselsdage
  const combinedHolidays = [
    ...holidays,
    ...birthdays,
  ];

  // Sorter datoerne kronologisk
  return combinedHolidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}
