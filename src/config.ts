import type { EmailProvider } from "./types.js";
import { ResendProvider } from "./providers/resend.js";
import { NodemailerProvider } from "./providers/nodemailer.js";

export interface Config {
  provider: EmailProvider | null;
  fromEmail: string | undefined;
  toEmails: string[];
  allowedOrigins: string[];
}

const fromEmail = process.env["FROM_EMAIL"];
const toEmailsRaw = process.env["TO_EMAIL"] ?? "";
const toEmails = toEmailsRaw.split(",").map(o => o.trim()).filter(Boolean);
const allowedOriginsRaw = process.env["ALLOWED_ORIGINS"] ?? "";
const allowedOrigins = allowedOriginsRaw.split(",").map(o => o.trim()).filter(Boolean);

function createProvider(): EmailProvider | null {
  const providerName = process.env["EMAIL_PROVIDER"]?.toLowerCase();
  if (!providerName) {
    console.error("EMAIL_PROVIDER is not set");
    return null;
  }

  if (providerName === "resend") {
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) return null;
    return new ResendProvider(apiKey);
  }

  if (providerName === "nodemailer") {
    const smtpConfig = process.env["SMTP_CONFIG"];
    if (!smtpConfig) {
      console.warn("SMTP_CONFIG missing for nodemailer");
      return null;
    }
    return new NodemailerProvider(smtpConfig);
  }

  console.warn(`Unknown EMAIL_PROVIDER: "${providerName}"`);
  return null;
}

export const config: Config = {
  provider: createProvider(),
  fromEmail,
  toEmails,
  allowedOrigins
}

