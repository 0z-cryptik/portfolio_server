// server.ts
import type { Request, Response, NextFunction } from "express";

export function requireAdminSecret(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const incomingSecret = req.headers["x-admin-token"];

  if (!incomingSecret || incomingSecret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized access" });
    return;
  }

  next();
}
