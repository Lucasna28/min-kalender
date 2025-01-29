"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PancakeDay } from "./special-days/pancake-day";
import { StarWarsDay } from "./special-days/star-wars-day";
import { JDay } from "./special-days/j-day";
import { Fastelavn } from "./special-days/fastelavn";
import { SanktHans } from "./special-days/sankt-hans";
import { MortensAften } from "./special-days/mortens-aften";
import { Allehelgen } from "./special-days/allehelgen";
import { StoreBededag } from "./special-days/store-bededag";
import { Grundlovsdag } from "./special-days/grundlovsdag";
import { Paaske } from "./special-days/paaske";
import { Valentinsdag } from "./special-days/valentinsdag";
import { MorsDag } from "./special-days/mors-dag";
import { FarsDag } from "./special-days/fars-dag";
import { Pinse } from "./special-days/pinse";
import { Valdemarsdag } from "./special-days/valdemarsdag";
import { Halloween } from "./special-days/halloween";
import { KristiHimmelfart } from "./special-days/kristi-himmelfart";
import { Befrielsesdag } from "./special-days/befrielsesdag";
import { DeUdsendte } from "./special-days/de-udsendte";
import { Piratdag } from "./special-days/piratdag";
import { Temadag } from "./special-days/temadag";
import { Advent } from "./special-days/advent";
import { Pizzadag } from "./special-days/pizzadag";
import confetti from "canvas-confetti";
import { Palmesondag } from "./special-days/palmesondag";
import { Event } from "@/types/calendar";

interface EventItemProps {
  event: Event;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export function EventItem({
  event,
  className,
  style,
  onClick,
}: EventItemProps) {
  const title = event.title.toLowerCase();
  const calendarId = event.calendar_id;
  const isDanishHoliday = calendarId === "danish-holidays";

  // Helligdage og mærkedage
  const isNewYear = isDanishHoliday && title.includes("nytår");
  const isEaster =
    isDanishHoliday &&
    (title.includes("påske") ||
      title.includes("skærtorsdag") ||
      title.includes("langfredag"));
  const isFastelavn = isDanishHoliday && title.includes("fastelavn");
  const isAscensionDay =
    isDanishHoliday &&
    (title.includes("kristi himmelfart") ||
      title.includes("kristi himmelfartsdag"));
  const isPentecost = isDanishHoliday && title.includes("pinse");
  const isPrayerDay = isDanishHoliday && title.includes("store bededag");
  const isGroundDay = isDanishHoliday && title.includes("grundlovsdag");
  const isValdemarsDay = isDanishHoliday && title.includes("valdemars");
  const isHalloween =
    isDanishHoliday &&
    (title.includes("halloween") || title.includes("allehelgensaften"));
  const isAllHallows = isDanishHoliday && title.includes("allehelgensdag");
  const isChristmas = isDanishHoliday && title.includes("jul");
  const isMartinsEve =
    isDanishHoliday && (title.includes("mortens") || title.includes("morten"));
  const isAdvent =
    isDanishHoliday &&
    (title.includes("1. søndag i advent") ||
      title.includes("2. søndag i advent") ||
      title.includes("3. søndag i advent") ||
      title.includes("4. søndag i advent"));

  // Internationale dage
  const isValentinesDay = isDanishHoliday && title.includes("valentins");
  const isMothersDay = isDanishHoliday && title.includes("mors dag");
  const isFathersDay = isDanishHoliday && title.includes("fars dag");
  const isLaborDay =
    isDanishHoliday &&
    (title.includes("arbejdernes") || title.includes("kampdag"));
  const isLiberationDay =
    isDanishHoliday &&
    (title.includes("befrielsesdag") || title.includes("5. maj"));
  const isDeployedForces =
    isDanishHoliday &&
    (title.includes("flagdag") || title.includes("udsendte"));
  const isStarWarsDay =
    isDanishHoliday &&
    (title.includes("star wars") || title.includes("may the 4th"));
  const isPirateDay = isDanishHoliday && title.includes("pirat");

  // Temadage
  const isChocolateDay = isDanishHoliday && title.includes("chokolade");
  const isBeerDay =
    isDanishHoliday && (title.includes("øl") || title.includes("pilsner"));
  const isDanceDay = isDanishHoliday && title.includes("dans");
  const isPizzaDay = isDanishHoliday && title.includes("pizza");
  const isCoffeeDay = isDanishHoliday && title.includes("kaffe");
  const isCakeDay = isDanishHoliday && title.includes("kage");
  const isGamingDay =
    isDanishHoliday && (title.includes("spil") || title.includes("gaming"));
  const isPancakeDay = isDanishHoliday && title.includes("pandekage");
  const isJDay = isDanishHoliday && title.includes("j-dag");
  const isRacingDay =
    isDanishHoliday &&
    (title.includes("racerkørernes") ||
      title.includes("formel 1") ||
      title.includes("racing"));
  const isSanktHans =
    isDanishHoliday &&
    (title.includes("sankt hans") || title.includes("sankthans"));

  // System events
  const isSystemBirthday =
    calendarId === "danish-holidays" && title.includes("fødselsdag");
  const isUserBirthday = event.category === "fødselsdag";
  const shouldShowFlag = isSystemBirthday || isUserBirthday;

  const isTimeChange =
    isDanishHoliday &&
    (title.includes("sommertid") || title.includes("vintertid"));

  // Check for specielle dage
  const isPalmSunday =
    event.calendar_id === "danish-holidays" &&
    event.title.includes("Palmesøndag");

  if (isPalmSunday) {
    return (
      <Palmesondag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isTimeChange) {
    const isSummerTime = event.title.includes("Sommertid");

    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Baggrund */}
        <div
          className={cn(
            "absolute inset-0",
            isSummerTime ? "bg-[#FDB813]" : "bg-[#4B0082]"
          )}
        />

        {/* Ur animation */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {isSummerTime ? "🕐" : "🕛"}
        </motion.div>

        {/* Sol/måne animation */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={
            isSummerTime
              ? {
                  y: [0, -10, 0],
                  scale: [1, 1.2, 1],
                }
              : {
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }
          }
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          {isSummerTime ? "☀️" : "🌙"}
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span
            className={cn(
              "px-1.5 py-0.5 rounded",
              isSummerTime ? "bg-[#FF6B6B]/60" : "bg-[#9370DB]/60"
            )}
          >
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isChristmas) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Julebaggrund */}
        <div className="absolute inset-0 bg-[#165B33]" />{" "}
        {/* Mørkegrøn julebaggrund */}
        {/* Snemænd */}
        <motion.div
          className="absolute right-1 top-1 text-white text-xs"
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          ⛄
        </motion.div>
        {/* Juletræ */}
        <motion.div
          className="absolute left-1 bottom-1 text-white text-xs"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🎄
        </motion.div>
        {/* Snefnug animation */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "12px 12px"],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        {/* Titel med rød julebaggrund */}
        <div className="relative px-2 py-1 text-white font-medium">
          <span className="bg-[#BB2528]/90 px-1.5 py-0.5 rounded truncate block text-xs sm:text-sm">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (shouldShowFlag) {
    const handleBirthdayClick = (e: React.MouseEvent) => {
      // Kør konfetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C8102E", "#FFFFFF"], // Danske flag farver
      });

      // Kald original onClick hvis den findes
      onClick?.(e);
    };

    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={handleBirthdayClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Dansk flag baggrund */}
        <div className="absolute inset-0 bg-[#C8102E]" />
        <motion.div
          className="absolute bg-white"
          style={{
            left: "30%",
            top: 0,
            bottom: 0,
            width: "15%",
          }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bg-white"
          style={{
            left: 0,
            right: 0,
            top: "40%",
            height: "20%",
          }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        {/* Balloner animation */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [-5, 5, -5],
            rotate: [-10, 10, -10],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🎈
        </motion.div>
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [5, -5, 5],
            rotate: [10, -10, 10],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
          }}
        >
          🎂
        </motion.div>
        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium">
          <span className="bg-black/40 px-1.5 py-0.5 rounded truncate block text-xs sm:text-sm">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isNewYear) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Mørkeblå baggrund */}
        <div className="absolute inset-0 bg-[#000033]" />

        {/* Fyrværkeri animationer */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          🎆
        </motion.div>

        <motion.div
          className="absolute left-2 top-1/3 text-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        >
          ✨
        </motion.div>

        <motion.div
          className="absolute left-1/2 bottom-1 text-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
        >
          🎇
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#4169E1]/60 px-1.5 py-0.5 rounded truncate max-w-full text-xs sm:text-sm">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isEaster) {
    return (
      <Paaske
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isFastelavn) {
    return (
      <Fastelavn
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isSanktHans) {
    return (
      <SanktHans
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isGroundDay) {
    return (
      <Grundlovsdag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isPrayerDay) {
    return (
      <StoreBededag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isValdemarsDay) {
    return (
      <Valdemarsdag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isAllHallows) {
    return (
      <Allehelgen
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isMothersDay) {
    return (
      <MorsDag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isFathersDay) {
    return (
      <FarsDag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isHalloween) {
    return (
      <Halloween
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isAscensionDay) {
    return (
      <KristiHimmelfart
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isPentecost) {
    return (
      <Pinse
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isMartinsEve) {
    return (
      <MortensAften
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isValentinesDay) {
    return (
      <Valentinsdag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isLiberationDay) {
    return (
      <Befrielsesdag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isLaborDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Rød baggrund */}
        <div className="absolute inset-0 bg-[#FF0000]" />

        {/* Solidaritet */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [-10, 10, -10],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          ✊
        </motion.div>

        {/* Rød fane */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -3, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🚩
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-black/40 px-1.5 py-0.5 rounded truncate block text-xs sm:text-sm">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isDeployedForces) {
    return (
      <DeUdsendte
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isJDay) {
    return (
      <JDay
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isPancakeDay) {
    return (
      <PancakeDay
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isStarWarsDay) {
    return (
      <StarWarsDay
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isPirateDay) {
    return (
      <Piratdag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isChocolateDay || isBeerDay || isDanceDay) {
    return (
      <Temadag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
        theme={isChocolateDay ? "chocolate" : isBeerDay ? "beer" : "dance"}
      />
    );
  }

  if (isRacingDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Racing baggrund */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF0000] to-[#000000]" />

        {/* Racerbil */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            x: [-20, 20, -20],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🏎️
        </motion.div>

        {/* Målflag */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-10, 10, -10],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          🏁
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-black/60 px-1.5 py-0.5 rounded truncate block text-xs sm:text-sm">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isPizzaDay || isCoffeeDay || isCakeDay || isGamingDay) {
    const config = {
      pizza: {
        bg: "#FFA500",
        icon1: "🍕",
        icon2: "🧀",
        textBg: "#FF4500",
      },
      coffee: {
        bg: "#8B4513",
        icon1: "☕",
        icon2: "🫖",
        textBg: "#A0522D",
      },
      cake: {
        bg: "#FF69B4",
        icon1: "🎂",
        icon2: "🧁",
        textBg: "#FF1493",
      },
      gaming: {
        bg: "#4B0082",
        icon1: "🎮",
        icon2: "🕹️",
        textBg: "#800080",
      },
    };

    const theme = isPizzaDay
      ? config.pizza
      : isCoffeeDay
      ? config.coffee
      : isCakeDay
      ? config.cake
      : config.gaming;

    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Baggrund */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: theme.bg }}
        />

        {/* Ikon 1 */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [-10, 10, -10],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {theme.icon1}
        </motion.div>

        {/* Ikon 2 */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -5, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          {theme.icon2}
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span
            className="px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${theme.textBg}60` }}
          >
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isAdvent) {
    return (
      <Advent
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (isPizzaDay) {
    return (
      <Pizzadag
        event={event}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1 text-sm",
        !event.allDay && "bg-primary text-primary-foreground",
        event.allDay && "bg-muted",
        className
      )}
      style={{ backgroundColor: event.color }}
      onClick={onClick}
    >
      <span className="truncate">{event.title}</span>
    </div>
  );
}
