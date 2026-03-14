import type { Resend } from "resend";
import type { ContactBody } from "./types.js";
import type { Config } from "./config.js";

export interface EmailConfig {
  client: Resend;
  from: string;
  to: string;
}

export function getEmailConfig(config: Config): EmailConfig | null {
  if (!config.resend || !config.fromEmail || !config.toEmail) return null;
  return { client: config.resend, from: config.fromEmail, to: config.toEmail };
}

export async function sendEmail(config: EmailConfig, body: ContactBody): Promise<void> {
  await config.client.emails.send({
    from: config.from,
    to: config.to,
    replyTo: body.email,
    subject: `Contact form: ${body.subject.replace(/[\r\n]+/g, " ").trim()}`,
    text: `From: ${body.email}\n\n${body.message.trim()}`
  });
}
