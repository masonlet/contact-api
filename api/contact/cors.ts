import type { VercelRequest, VercelResponse } from "@vercel/node";

export function isOriginAllowed(
  origin: string | undefined, 
  allowedOrigins: string[]
): boolean {
  if (allowedOrigins.length === 0) return false;
  return origin !== undefined && allowedOrigins.includes(origin);
}
export function setCorsHeaders(
  req: VercelRequest, 
  res: VercelResponse,
  allowedOrigins: string[]
): boolean {
  res.setHeader("X-Content-Type-Options", "nosniff");
  const origin = req.headers["origin"];

  if (allowedOrigins.length > 0 && allowedOrigins.includes(origin ?? "")) {
    res.setHeader("Access-Control-Allow-Origin", origin!);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
