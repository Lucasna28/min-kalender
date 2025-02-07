import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { eventSchema } from "@/lib/calendar-constants";

interface AdditionalSettingsProps {
  form: UseFormReturn<z.infer<typeof eventSchema>>;
  visibleCalendarIds: string[];
}

export function AdditionalSettings({
  form,
  visibleCalendarIds,
}: AdditionalSettingsProps) {
  return (
    <div className="space-y-4 px-4">
      <FormField
        control={form.control}
        name="calendar_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kalender</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Vælg kalender" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {visibleCalendarIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Vælg hvilken kalender begivenheden skal oprettes i
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lokation</FormLabel>
            <FormControl>
              <Input placeholder="Tilføj lokation" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Farve</FormLabel>
            <FormControl>
              <Input type="color" {...field} className="h-10 px-2 w-full" />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
