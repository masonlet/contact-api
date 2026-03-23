import type { EmailProvider, EmailPayload, ContactBody } from "./types.js";
import type { Config } from "./config.js";

export interface EmailConfig {
  provider: EmailProvider;
  from: string;
  to: string[];
}

export function getEmailConfig(config: Config): EmailConfig | null {
  if (
    !config.provider || 
    !config.fromEmail?.trim() || 
    !config.toEmails?.length 
  ) return null;
  return { provider: config.provider, from: config.fromEmail, to: config.toEmails };
}

export async function sendEmail(
  config: EmailConfig, 
  body: ContactBody
): Promise<void> {
  const subjectLine = body.subject?.replace(/[\r\n]+/g, " ").trim() ?? "New message";
  const fromLine = body.name ? `${body.name} <${body.email}>` : body.email;

  const payload: EmailPayload = {
    from: config.from,
    to: config.to,
    replyTo: body.email,
    subject: `Contact form: ${subjectLine}`,
    text: `From: ${fromLine}\n\n${body.message.trim()}`
  }

  await config.provider.send(payload);
}
