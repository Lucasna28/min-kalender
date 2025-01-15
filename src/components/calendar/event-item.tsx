"use client";

import { motion } from "framer-motion";
import type { CalendarEvent } from "@/hooks/use-events";
import { cn } from "@/lib/utils";

interface EventItemProps {
  event: CalendarEvent;
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
  const isSystemBirthday =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("fødselsdag");
  const isUserBirthday = event.category === "fødselsdag";
  const shouldShowFlag = isSystemBirthday || isUserBirthday;

  const isChristmas =
    event.calendar_id === "danish-holidays" &&
    (event.title.toLowerCase().includes("jul") ||
      event.title.toLowerCase().includes("jule"));

  const isTimeChange =
    event.calendar_id === "danish-holidays" &&
    (event.title.includes("Sommertid") || event.title.includes("Vintertid"));

  const isNewYear =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("nytår");

  const isEaster =
    event.calendar_id === "danish-holidays" &&
    (event.title.toLowerCase().includes("påske") ||
      event.title.toLowerCase().includes("palme") ||
      event.title.toLowerCase().includes("skær") ||
      event.title.toLowerCase().includes("langfredag"));

  const isSanktHans =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("sankt hans");

  const isFastelavn =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("fastelavn");

  const isGroundDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("grundlov");

  const isPrayerDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("bededag");

  const isValdemarsDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("valdemars");

  const isAllHallows =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("allehelgen");

  const isMothersDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("mors dag");

  const isFathersDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("fars dag");

  const isHalloween =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("halloween");

  const isAscensionDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("himmel");

  const isPentecost =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("pinse");

  const isMartinsEve =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("mortens");

  const isValentinesDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("valentin");

  const isLiberationDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("befrielse");

  const isLaborDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("kampdag");

  const isDeployedForces =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("udsendte");

  const isJDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("j-dag");

  const isPancakeDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("pandekage");

  const isStarWarsDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("star wars");

  const isPirateDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("pirate");

  const isChocolateDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("chokolade");

  const isBeerDay =
    event.calendar_id === "danish-holidays" &&
    (event.title.toLowerCase().includes("pilsner") ||
      event.title.toLowerCase().includes("øl"));

  const isDanceDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("danse");

  const isRacingDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("racerkør");

  const isPizzaDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("pizza");

  const isCoffeeDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("kaffe");

  const isCakeDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("kage");

  const isGamingDay =
    event.calendar_id === "danish-holidays" &&
    event.title.toLowerCase().includes("gaming");

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
          <span className="bg-[#BB2528]/90 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (shouldShowFlag) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Dansk flag baggrund */}
        <div className="absolute inset-0 bg-[#C8102E]" /> {/* Rød baggrund */}
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
        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium">
          <span className="bg-black/40 px-1.5 py-0.5 rounded">
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
          <span className="bg-[#4169E1]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isEaster) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Lysegul baggrund */}
        <div className="absolute inset-0 bg-[#FFF4B8]" />

        {/* Påskeæg animationer */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-10, 10, -10],
            y: [0, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🥚
        </motion.div>

        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🐰
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-black font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-white/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isSanktHans) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Mørk aftenhimmel baggrund */}
        <div className="absolute inset-0 bg-[#1A237E]" />

        {/* Bål animation */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          🔥
        </motion.div>

        {/* Heks animation */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🧙‍♀️
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#FF9800]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isFastelavn) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Festlig baggrund */}
        <div className="absolute inset-0 bg-[#FF69B4]" />

        {/* Fastelavnsris */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-10, 10, -10],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🌿
        </motion.div>

        {/* Tønde og kat */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          🪣🐱
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#9370DB]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isGroundDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Rød-hvid baggrund */}
        <div className="absolute inset-0 bg-[#C8102E]" />

        {/* Grundlov */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          📜
        </motion.div>

        {/* Dannebrog */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🇩🇰
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-white/60 px-1.5 py-0.5 rounded text-[#C8102E]">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isPrayerDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Rolig baggrund */}
        <div className="absolute inset-0 bg-[#4B0082]" />

        {/* Kirkeklokke */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-20, 20, -20],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🔔
        </motion.div>

        {/* Foldede hænder */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🙏
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#800080]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isValdemarsDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Dannebrog baggrund */}
        <div className="absolute inset-0 bg-[#C8102E]" />

        {/* Faldende Dannebrog */}
        <motion.div
          className="absolute right-2 top-0 text-lg"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          🇩🇰
        </motion.div>

        {/* Krone */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          👑
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-white/60 px-1.5 py-0.5 rounded text-[#C8102E]">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isAllHallows) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Mørk baggrund */}
        <div className="absolute inset-0 bg-[#2C3E50]" />

        {/* Lysende lys */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🕯️
        </motion.div>

        {/* Engel */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -5, 0],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          👼
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#34495E]/80 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isMothersDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Rosa baggrund */}
        <div className="absolute inset-0 bg-[#FF69B4]" />

        {/* Hjerter */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          ❤️
        </motion.div>

        {/* Blomster */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-10, 10, -10],
            y: [0, -3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🌸
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#FF1493]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isFathersDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Blå baggrund */}
        <div className="absolute inset-0 bg-[#4169E1]" />

        {/* Værktøj */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-20, 20, -20],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🔧
        </motion.div>

        {/* Slips */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -2, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          👔
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#000080]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isHalloween) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Orange baggrund */}
        <div className="absolute inset-0 bg-[#FF6B00]" />

        {/* Græskar */}
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
          🎃
        </motion.div>

        {/* Spøgelse */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -5, 0],
            x: [-2, 2, -2],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          👻
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#000000]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isAscensionDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Himmelblå baggrund */}
        <div className="absolute inset-0 bg-[#87CEEB]" />

        {/* Sky */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -5, 0],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          ☁️
        </motion.div>

        {/* Due */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -3, 0],
            x: [-2, 2, -2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🕊️
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#4682B4]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isPentecost) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Gylden baggrund */}
        <div className="absolute inset-0 bg-[#FFD700]" />

        {/* Ild */}
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
          🔥
        </motion.div>

        {/* Due */}
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
          🕊️
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#B8860B]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isMartinsEve) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Brun baggrund */}
        <div className="absolute inset-0 bg-[#8B4513]" />

        {/* Gås */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-10, 10, -10],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🦢
        </motion.div>

        {/* Lanterne */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🏮
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#D2691E]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isValentinesDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Romantisk rosa baggrund */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF69B4] to-[#FF1493]" />

        {/* Flyvende hjerter */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          💝
        </motion.div>

        {/* Cupids bue og pil */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-10, 10, -10],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🏹
        </motion.div>

        {/* Faldende rosenblade */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,192,203,0.4) 2px, transparent 2px)",
            backgroundSize: "16px 16px",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "16px 16px"],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#FF1493]/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isLiberationDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Rød-hvid baggrund */}
        <div className="absolute inset-0 bg-[#C8102E]" />

        {/* Frihedskæmper */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          ✊
        </motion.div>

        {/* Dannebrog */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -5, 0],
            rotate: [-10, 10, -10],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🇩🇰
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-white/60 px-1.5 py-0.5 rounded text-[#C8102E]">
            {event.title}
          </span>
        </div>
      </motion.div>
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
          <span className="bg-black/40 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isDeployedForces) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Blå baggrund */}
        <div className="absolute inset-0 bg-[#4169E1]" />

        {/* Medalje */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🎖️
        </motion.div>

        {/* FN flag */}
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
          🇺🇳
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#000080]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isJDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Blå Tuborg baggrund */}
        <div className="absolute inset-0 bg-[#4169E1]" />

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

        {/* Øl */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-10, 10, -10],
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🍺
        </motion.div>

        {/* Julemand */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🎅
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-white/60 px-1.5 py-0.5 rounded text-[#4169E1]">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isPancakeDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Gylden baggrund */}
        <div className="absolute inset-0 bg-[#FFD700]" />

        {/* Pandekage */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          🥞
        </motion.div>

        {/* Sirup */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, 5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🍯
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#8B4513]/60 px-1.5 py-0.5 rounded">
            {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isStarWarsDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Space baggrund */}
        <div className="absolute inset-0 bg-[#000000]" />

        {/* Lysende stjerner */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        {/* Lyssværd */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-45, 45, -45],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          ⚔️
        </motion.div>

        {/* Yoda */}
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          👽
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#4B0082]/60 px-1.5 py-0.5 rounded">
            May the 4th be with you
          </span>
        </div>
      </motion.div>
    );
  }

  if (isPirateDay) {
    return (
      <motion.div
        className={cn("relative overflow-hidden", className)}
        style={style}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Havblå baggrund */}
        <div className="absolute inset-0 bg-[#000080]" />

        {/* Pirat */}
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-lg"
          animate={{
            rotate: [-10, 10, -10],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🏴‍☠️
        </motion.div>

        {/* Papegøje */}
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
          🦜
        </motion.div>

        {/* Titel */}
        <div className="relative px-2 py-1 text-white font-medium flex justify-center items-center min-h-[2rem]">
          <span className="bg-[#8B4513]/60 px-1.5 py-0.5 rounded">
            Arrr! {event.title}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isChocolateDay || isBeerDay || isDanceDay) {
    const config = {
      chocolate: {
        bg: "#8B4513",
        icon1: "🍫",
        icon2: "🎂",
        textBg: "#D2691E",
      },
      beer: {
        bg: "#FFD700",
        icon1: "🍺",
        icon2: "🍻",
        textBg: "#DAA520",
      },
      dance: {
        bg: "#FF69B4",
        icon1: "💃",
        icon2: "🕺",
        textBg: "#FF1493",
      },
    };

    const theme = isChocolateDay
      ? config.chocolate
      : isBeerDay
      ? config.beer
      : config.dance;

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
          <span className="bg-black/60 px-1.5 py-0.5 rounded">
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

  return (
    <motion.div
      className={cn(
        "px-2 py-1 font-medium text-white overflow-hidden",
        className
      )}
      style={{
        backgroundColor: event.color || "#4285F4",
        ...style,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {event.title}
    </motion.div>
  );
}
