import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Inserisci il nome utente"),
  password: z.string().min(1, "Inserisci la password"),
});
