import { z } from "zod";

const userBodySchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const userSchema = z.object({
  body: userBodySchema,
});

export type UserInput = z.infer<typeof userBodySchema>;
