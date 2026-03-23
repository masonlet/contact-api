import type { Resend } from "resend";
import type { ContactBody } from "./types.js";
import type { Config } from "./config.js";

export interface EmailConfig {
  client: Resend;
  from: string;
  to: string[];
}

export function getEmailConfig(config: Config): EmailConfig | null {
  if (
    !config.resend || 
    !config.fromEmail?.trim() || 
    !config.toEmails?.length 
  ) return null;
  return { client: config.resend, from: config.fromEmail, to: config.toEmails };
}

export async function sendEmail(
  config: EmailConfig, 
  body: ContactBody
): Promise<void> {
  const subjectLine = body.subject?.replace(/[\r\n]+/g, " ").trim() ?? "New message";
  const fromLine = body.name ? `${body.name} <${body.email}>` : body.email;

  const result = await config.client.emails.send({
    from: config.from,
    to: config.to,
    replyTo: body.email,
    subject: `Contact form: ${subjectLine}`,
    text: `From: ${fromLine}\n\n${body.message.trim()}`
  });

  if (result.error) {
    console.error("Resend API error:", result.error);
    throw new Error(`Email send failed: ${result.error.message}`);
  }
}
