import type { VercelRequest, VercelResponse } from "@vercel/node";

export function setCorsHeaders(
  req: VercelRequest, 
  res: VercelResponse,
  allowedOrigins: string[]
): "preflight" | "forbidden" | "ok" {
  res.setHeader("X-Content-Type-Options", "nosniff");
  const origin = req.headers["origin"];
  const isAllowed = origin && allowedOrigins.includes(origin);
  
  if (!isAllowed) {
    if (req.method === "OPTIONS") {
      res.status(403).end();
      return "preflight";
    }
    return "forbidden";
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return "preflight";
  }

  return "ok";
}
