"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";

interface ViewSelectorProps {
  view: "year" | "month" | "week" | "day";
  date: Date;
  onViewChange: (view: "year" | "month" | "week" | "day") => void;
  onDateChange: (date: Date) => void;
}

export function ViewSelector({
  view,
  date,
  onViewChange,
  onDateChange,
}: ViewSelectorProps) {
  const handlePrevious = () => {
    const newDate = new Date(date);
    switch (view) {
      case "year":
        newDate.setFullYear(date.getFullYear() - 1);
        break;
      case "month":
        newDate.setMonth(date.getMonth() - 1);
        break;
      case "week":
        newDate.setDate(date.getDate() - 7);
        break;
      case "day":
        newDate.setDate(date.getDate() - 1);
        break;
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(date);
    switch (view) {
      case "year":
        newDate.setFullYear(date.getFullYear() + 1);
        break;
      case "month":
        newDate.setMonth(date.getMonth() + 1);
        break;
      case "week":
        newDate.setDate(date.getDate() + 7);
        break;
      case "day":
        newDate.setDate(date.getDate() + 1);
        break;
    }
    onDateChange(newDate);
  };

  const formatDate = () => {
    switch (view) {
      case "year":
        return format(date, "yyyy", { locale: da });
      case "month":
        return format(date, "MMMM yyyy", { locale: da });
      case "week":
        return `Uge ${format(date, "w")} - ${format(date, "MMMM yyyy", {
          locale: da,
        })}`;
      case "day":
        return format(date, "EEEE d. MMMM yyyy", { locale: da });
      default:
        return "";
    }
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-[150px] text-center font-medium">
          {formatDate()}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Select value={view} onValueChange={onViewChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="year">År</SelectItem>
          <SelectItem value="month">Måned</SelectItem>
          <SelectItem value="week">Uge</SelectItem>
          <SelectItem value="day">Dag</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
