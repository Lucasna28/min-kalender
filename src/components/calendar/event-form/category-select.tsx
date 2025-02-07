import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { eventSchema } from "@/lib/calendar-constants";

// Opdateret kategori-konfiguration med emojis og beskrivelser
const CATEGORIES = [
  {
    id: "arbejde",
    name: "Arbejde",
    color: "#4285F4",
    emoji: "💼",
    description: "Arbejdsrelaterede begivenheder",
  },
  {
    id: "personlig",
    name: "Personligt",
    color: "#EA4335",
    emoji: "👤",
    description: "Personlige aftaler og gøremål",
  },
  {
    id: "familie",
    name: "Familie",
    color: "#9C27B0",
    emoji: "👨‍👩‍👧‍👦",
    description: "Familiebegivenheder og -aktiviteter",
  },
  {
    id: "ferie",
    name: "Ferie",
    color: "#FBBC05",
    emoji: "✈️",
    description: "Ferier og fridage",
  },
  {
    id: "fødselsdag",
    name: "Fødselsdag",
    color: "#FF69B4",
    emoji: "🎂",
    description: "Fødselsdage og mærkedage",
  },
  {
    id: "møde",
    name: "Møde",
    color: "#34A853",
    emoji: "🤝",
    description: "Møder og aftaler",
  },
  {
    id: "læge",
    name: "Læge",
    color: "#00BCD4",
    emoji: "🏥",
    description: "Lægebesøg og sundhed",
  },
  {
    id: "andet",
    name: "Andet",
    color: "#607D8B",
    emoji: "📌",
    description: "Andre begivenheder",
  },
] as const;

interface CategorySelectProps {
  form: UseFormReturn<z.infer<typeof eventSchema>>;
}

export function CategorySelect({ form }: CategorySelectProps) {
  const selectedCategory = CATEGORIES.find(
    (cat) => cat.id === form.watch("category")
  );

  return (
    <div className="space-y-2">
      <Select
        onValueChange={(value) => form.setValue("category", value)}
        defaultValue={form.watch("category")}
      >
        <FormControl>
          <SelectTrigger className="w-full bg-background/50 border-input/50 h-[52px] hover:bg-background/80 transition-colors">
            <SelectValue placeholder="Vælg en kategori">
              {selectedCategory && (
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: `${selectedCategory.color}20`,
                      border: `2px solid ${selectedCategory.color}`,
                    }}
                  >
                    <span className="text-xl">{selectedCategory.emoji}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-base">
                      {selectedCategory.name}
                    </span>
                    <span className="text-xs text-muted-foreground/80">
                      {selectedCategory.description}
                    </span>
                  </div>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
        </FormControl>
        <SelectContent
          align="start"
          className="w-[340px] p-2"
          position="popper"
          sideOffset={5}
        >
          <div className="grid grid-cols-1 gap-2">
            {CATEGORIES.map((category) => (
              <SelectItem
                key={category.id}
                value={category.id}
                className="flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-muted/50 data-[state=checked]:bg-primary/10 transition-all hover:scale-[0.98] active:scale-95"
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: `${category.color}20`,
                    border: `2px solid ${category.color}`,
                  }}
                >
                  <span className="text-xl">{category.emoji}</span>
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="font-medium text-base">{category.name}</span>
                  <span className="text-xs text-muted-foreground/80 truncate">
                    {category.description}
                  </span>
                </div>
                <div
                  className="w-4 h-4 rounded-md shrink-0 transition-transform"
                  style={{ backgroundColor: category.color }}
                />
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
