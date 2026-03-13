import { Resend } from "resend";
import { checkRateLimit } from "@vercel/firewall"
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ContactBody } from "./types.js";
 
const apiKey = process.env["RESEND_API_KEY"];
const fromEmail = process.env["FROM_EMAIL"];
const toEmail = process.env["TO_EMAIL"];
const resend = apiKey ? new Resend(apiKey) : null;

const ALLOWED_ORIGINS = (process.env["ALLOWED_ORIGINS"] ?? "")
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidBody(body: unknown): body is ContactBody {
  if (body === null || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  
  const subject = record["subject"];
  const email = record["email"];
  const message = record["message"];

  return (
    typeof subject === "string" && !!subject.trim() && subject.length <= 200 &&
    typeof email === "string" && EMAIL_REGEX.test(email) &&
    typeof message === "string" && !!message.trim() && message.length <= 2000
  );
}

export function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers["origin"];
  if (origin !== undefined && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  const { rateLimited } = await checkRateLimit("contact-form-limit", { request: req });
  if (rateLimited) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  if (setCorsHeaders(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!resend || !fromEmail || !toEmail) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  if (!isValidBody(req.body)) {
    res.status(400).json({ error: "Invalid or missing fields" });
    return;
  }

  const { subject, email, message } = req.body;
  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Contact form: ${subject}`,
      text: `From: ${email}\n\n${message}`
    });
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};
