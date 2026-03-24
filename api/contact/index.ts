import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit } from "@vercel/firewall"
import { setCorsHeaders } from "../../src/cors.js";
import { isValidBody } from "../../src/validation.js";
import { getEmailConfig, sendEmail } from "../../src/email.js";
import { config } from "../../src/config.js";

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  const cors = setCorsHeaders(req, res, config.allowedOrigins);
  if (cors === "preflight") return;
  if (cors === "forbidden") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!req.headers["content-type"]?.startsWith("application/json")) {
    res.status(415).json({ error: "Unsupported Media Type" });
    return;
  }

  if(req.body["fax_number"]) {
    console.warn("Honeypot triggered:", req.headers["x-forwarded-for"] ?? "unknown");
    res.json({ success: true, message: "Message sent successfully" });
    return;
  }

  const emailConfig = getEmailConfig(config);
  if (!emailConfig) {
    res.status(503).json({ error: "Service temporarily unavailable" });
    return;
  }

  if (!isValidBody(req.body)) {
    res.status(400).json({ error: "Invalid or missing fields" });
    return;
  }

  const { rateLimited } = await checkRateLimit("contact-form-limit");
  if (rateLimited) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  try {
    await sendEmail(emailConfig, req.body);
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Message delivery failed. Please try again later." });
  }
};
