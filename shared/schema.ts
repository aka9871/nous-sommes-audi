import { z } from "zod";

export const verifyPinSchema = z.object({
  pin: z.string().min(1),
});

export type VerifyPinRequest = z.infer<typeof verifyPinSchema>;
