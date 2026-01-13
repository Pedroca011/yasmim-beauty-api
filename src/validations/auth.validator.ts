import z from "zod";

const authBodySchema = z.object({
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const authSchema = z.object({
  body: authBodySchema,
});

export type AuthInput = z.infer<typeof authBodySchema>;
