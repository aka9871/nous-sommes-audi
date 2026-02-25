import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/verify", (req, res) => {
    const schema = z.object({ pin: z.string() });
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Code PIN requis." });
    }

    const correctPin = process.env.AUTH_PIN || "0000";

    if (parsed.data.pin === correctPin) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: "Code PIN incorrect." });
    }
  });

  return httpServer;
}
