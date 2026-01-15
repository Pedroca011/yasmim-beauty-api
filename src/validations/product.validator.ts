import z from "zod";

const productBodySchema = z.object({
  name: z.string().min(3, "O nome deve pelo menos 3 caracteres."),
  description: z
    .string()
    .min(10, "A description deve ter pelo menos 10 caracteres.")
    .max(255, "A description deve ter pelo menos 255 caracteres."),
  currentPrice: z.coerce.number().positive(),
  promotionalPrice: z.coerce.number().positive().optional(),
  duration: z.number().positive(),
});

export const productSchema = z.object({
  body: productBodySchema,
});

export type ProductInput = z.infer<typeof productBodySchema>;
