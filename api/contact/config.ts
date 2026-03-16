import { Resend } from "resend";

export interface Config {
  resend: Resend | null;
  fromEmail: string | undefined;
  toEmail: string | string[] | undefined;
  allowedOrigins: string[];
}

const apiKey = process.env["RESEND_API_KEY"];
const fromEmail = process.env["FROM_EMAIL"];
const toEmail = process.env["TO_EMAIL"];
const allowedOriginsRaw = process.env["ALLOWED_ORIGINS"] ?? "";
const allowedOrigins = allowedOriginsRaw.split(",").map(o => o.trim()).filter(Boolean);

let resend: Resend | null = null;
if (apiKey) resend = new Resend(apiKey);

export const config: Config = {
  resend,
  fromEmail,
  toEmail,
  allowedOrigins
}

