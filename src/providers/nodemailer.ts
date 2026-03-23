import nodemailer from "nodemailer";
import type { EmailProvider, EmailPayload } from "../types.js";

export class NodemailerProvider implements EmailProvider {
  readonly id = "nodemailer";
  private transporter: nodemailer.Transporter;

  constructor(smtpJson: string) {
    const config = JSON.parse(smtpJson);
    this.transporter = nodemailer.createTransport(config);
  }

  async send(payload: EmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: payload.from,
      to: payload.to.join(","),
      replyTo: payload.replyTo,
      subject: payload.subject,
      text: payload.text
    });
  }
}
