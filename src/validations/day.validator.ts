import z from "zod";

const dayBodySchema = z.object({
    dayClosed: z.boolean().optional(),
    openInMinutes: z.int().optional(),
    opeIntervalInMinutes: z.int().optional(),
    closeIntervalInMinutes: z.int().optional(),
    closeInMinutes: z.int().optional(),
});

export const daySchema = z.object({
    body: dayBodySchema,
});

export type DayInput = z.infer<typeof dayBodySchema>;