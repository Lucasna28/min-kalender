import * as z from "zod";

// Definerer et Zod schema for event form validering
export const eventSchema = z.object({
    title: z.string().min(1, {
        message: "Titel er påkrævet",
    }),
    description: z.string().optional(),
    start_date: z.date({
        required_error: "Start dato er påkrævet",
    }),
    end_date: z.date({
        required_error: "Slut dato er påkrævet",
    }),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    is_all_day: z.boolean(),
    calendar_id: z.string().min(1, {
        message: "Vælg venligst en kalender",
    }),
    category: z.enum([
        "arbejde",
        "personlig",
        "familie",
        "ferie",
        "fødselsdag",
        "møde",
        "læge",
        "andet",
    ], {
        required_error: "Vælg venligst en kategori",
    }),
    color: z.string().default("#4285F4"),
    repeat: z.string().optional(),
    repeat_days: z.array(z.number()).optional(),
    invitations: z.array(z.string()).optional(),
    location: z.string().optional(),
}).refine(
    (data) => {
        if (data.is_all_day) return true;
        return data.start_time != null && data.end_time != null;
    },
    {
        message:
            "Start- og sluttid er påkrævet når begivenheden ikke varer hele dagen",
        path: ["start_time"],
    },
).refine(
    (data) => {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        return start <= end;
    },
    {
        message: "Slutdato skal være efter eller lig med startdato",
        path: ["end_date"],
    },
);

// Predefinerede kategorier med farver og ikoner - eksporteres ikke længere herfra, da de er defineret i CategorySelect komponenten
