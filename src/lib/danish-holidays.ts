import { addDays } from "date-fns";

export interface DanishHoliday {
  title: string;
  date: Date;
  type: "holiday" | "special" | "birthday";
  color?: string;
  id?: string;
}

export function getDanishHolidays(year: number): DanishHoliday[] {
  // Faste datoer
  const fixedHolidays: DanishHoliday[] = [
    { title: "Nytår", date: new Date(year-1, 11, 31), type: "special", color: "#FF0000", id: `new-year-${year}` },
    { title: "Nytårsdag", date: new Date(year, 0, 1), type: "holiday", color: "#FF0000", id: `new-years-day-${year}` },
    { title: "Fastelavn", date: new Date(year, 1, getFastelavnDate(year)), type: "special", color: "#FFA500", id: `fastelavn-${year}` },
    { title: "Dronning Marys fødselsdag", date: new Date(year, 1, 5), type: "birthday", color: "#4169E1", id: `queen-mary-${year}` },
    { title: "Valentinsdag", date: new Date(year, 1, 14), type: "special", color: "#FF69B4", id: `valentines-day-${year}` },
    { title: "International Pandekagedag", date: new Date(year, 1, 28), type: "special", color: "#FFD700", id: `pancake-day-${year}` },
    { title: "Sommertid starter", date: new Date(year, 2, getLastSundayInMonth(year, 2)), type: "special", color: "#FDB813", id: `summer-time-${year}` },
    { title: "International Pilsnerdag", date: new Date(year, 3, 23), type: "special", color: "#FFD700", id: `pilsner-day-${year}` },
    { title: "Dronning Margrethes fødselsdag", date: new Date(year, 3, 16), type: "birthday", color: "#4169E1", id: `queen-margrethe-${year}` },
    { title: "Star Wars Dag", date: new Date(year, 4, 4), type: "special", color: "#4B0082", id: `star-wars-day-${year}` },
    { title: "Internationale Kampdag", date: new Date(year, 4, 1), type: "special", color: "#FF0000", id: `labor-day-${year}` },
    { title: "Danmarks Befrielse", date: new Date(year, 4, 5), type: "special", color: "#C8102E", id: `liberation-day-${year}` },
    { title: "International Dansedag", date: new Date(year, 4, 29), type: "special", color: "#FF69B4", id: `dance-day-${year}` },
    { title: "Mors dag", date: new Date(year, 4, getSecondSundayInMonth(year, 4)), type: "special", color: "#FF69B4", id: `mothers-day-${year}` },
    { title: "Store Bededag", date: new Date(year, 4, 17), type: "holiday", color: "#FF0000", id: `prayer-day-${year}` },
    { title: "Kong Frederiks fødselsdag", date: new Date(year, 4, 26), type: "birthday", color: "#4169E1", id: `king-frederik-${year}` },
    { title: "Grundlovsdag", date: new Date(year, 5, 5), type: "holiday", color: "#FF0000", id: `constitution-day-${year}` },
    { title: "Fars dag", date: new Date(year, 5, 5), type: "special", color: "#4169E1", id: `fathers-day-${year}` },
    { title: "Valdemarsdag", date: new Date(year, 5, 15), type: "special", color: "#C8102E", id: `valdemars-day-${year}` },
    { title: "Sankt Hans Aften", date: new Date(year, 5, 23), type: "special", color: "#FFA500", id: `midsummer-${year}` },
    { title: "Lucas' fødselsdag", date: new Date(year, 5, 28), type: "birthday", color: "#C8102E", id: `lucas-birthday-${year}` },
    { title: "International Chokoladedag", date: new Date(year, 6, 7), type: "special", color: "#8B4513", id: `chocolate-day-${year}` },
    { title: "International Øl Dag", date: new Date(year, 7, 5), type: "special", color: "#FFD700", id: `international-beer-day-${year}` },
    { title: "De Danske Udsendte", date: new Date(year, 8, 5), type: "special", color: "#4169E1", id: `deployed-forces-${year}` },
    { title: "Talk Like a Pirate Day", date: new Date(year, 8, 19), type: "special", color: "#8B4513", id: `pirate-day-${year}` },
    { title: "Kronprins Christians fødselsdag", date: new Date(year, 9, 15), type: "birthday", color: "#4169E1", id: `prince-christian-${year}` },
    { title: "J-dag", date: new Date(year, 10, getFirstFridayInMonth(year, 10)), type: "special", color: "#4169E1", id: `j-day-${year}` },
    { title: "Halloween", date: new Date(year, 9, 31), type: "special", color: "#FF6B00", id: `halloween-${year}` },
    { title: "Vintertid starter", date: new Date(year, 9, getLastSundayInMonth(year, 9)), type: "special", color: "#4B0082", id: `winter-time-${year}` },
    { title: "Allehelgensdag", date: new Date(year, 10, 1), type: "special", color: "#4B0082", id: `all-saints-${year}` },
    { title: "Mortensaften", date: new Date(year, 10, 10), type: "special", color: "#FFA500", id: `martins-eve-${year}` },
    { title: "Juleaften", date: new Date(year, 11, 24), type: "special", color: "#FF0000", id: `christmas-eve-${year}` },
    { title: "Juledag", date: new Date(year, 11, 25), type: "holiday", color: "#FF0000", id: `christmas-day-${year}` },
    { title: "2. juledag", date: new Date(year, 11, 26), type: "holiday", color: "#FF0000", id: `boxing-day-${year}` },
    { title: "Racerkørernes Dag", date: new Date(year, 1, 2), type: "special", color: "#FF0000", id: `racing-day-${year}` },
    { title: "International Pizzadag", date: new Date(year, 1, 9), type: "special", color: "#FFA500", id: `pizza-day-${year}` },
    { title: "International Kaffedag", date: new Date(year, 9, 1), type: "special", color: "#8B4513", id: `coffee-day-${year}` },
    { title: "International Kagedag", date: new Date(year, 10, 26), type: "special", color: "#FF69B4", id: `cake-day-${year}` },
    { title: "International Gamingdag", date: new Date(year, 10, 23), type: "special", color: "#4B0082", id: `gaming-day-${year}` },
  ];

  // Beregn påske (forenklet version - du kan tilføje en mere præcis algoritme)
  const easterDate = calculateEaster(year);
  
  // Påskerelaterede helligdage
  const easterHolidays: DanishHoliday[] = [
    { title: "Palmesøndag", date: addDays(easterDate, -7), type: "holiday", color: "#FF0000", id: `palm-sunday-${year}` },
    { title: "Skærtorsdag", date: addDays(easterDate, -3), type: "holiday", color: "#FF0000", id: `maundy-thursday-${year}` },
    { title: "Langfredag", date: addDays(easterDate, -2), type: "holiday", color: "#FF0000", id: `good-friday-${year}` },
    { title: "Påskedag", date: easterDate, type: "holiday", color: "#FF0000", id: `easter-sunday-${year}` },
    { title: "2. påskedag", date: addDays(easterDate, 1), type: "holiday", color: "#FF0000", id: `easter-monday-${year}` },
    { title: "Kr. Himmelfartsdag", date: addDays(easterDate, 39), type: "holiday", color: "#FF0000", id: `ascension-day-${year}` },
    { title: "Pinsedag", date: addDays(easterDate, 49), type: "holiday", color: "#FF0000", id: `pentecost-${year}` },
    { title: "2. pinsedag", date: addDays(easterDate, 50), type: "holiday", color: "#FF0000", id: `whit-monday-${year}` },
  ];

  // Funktion til at finde første fredag i november (J-dag)
  const getJDag = (year: number) => {
    const date = new Date(year, 10, 1); // November er måned 10 (0-baseret)
    while (date.getDay() !== 5) { // 5 er fredag
      date.setDate(date.getDate() + 1);
    }
    return date;
  };

  const holidays = [
    ...fixedHolidays,
    ...easterHolidays,
  ];

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Forenklet version af påskeberegning (Meeus/Jones/Butcher algoritme)
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
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month, day);
}

// Hjælpefunktion til at finde sidste søndag i en måned
function getLastSundayInMonth(year: number, month: number): number {
  const date = new Date(year, month + 1, 0); // Sidste dag i måneden
  const lastSunday = date.getDate() - date.getDay();
  return lastSunday;
}

// Hjælpefunktion til at beregne fastelavn (7 uger før påske)
function getFastelavnDate(year: number): number {
  const easter = calculateEaster(year);
  const fastelavn = new Date(easter);
  fastelavn.setDate(easter.getDate() - 49);
  return fastelavn.getDate();
}

// Hjælpefunktion til at finde anden søndag i en måned
function getSecondSundayInMonth(year: number, month: number): number {
  const firstDay = new Date(year, month, 1);
  const firstSunday = 1 + (7 - firstDay.getDay()) % 7;
  return firstSunday + 7; // Anden søndag
}

// Hjælpefunktion til at finde første fredag i en måned
function getFirstFridayInMonth(year: number, month: number): number {
  const date = new Date(year, month, 1);
  const dayOfWeek = date.getDay();
  // 5 er fredag (0 er søndag, 1 er mandag, osv.)
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  return 1 + daysUntilFriday;
} 