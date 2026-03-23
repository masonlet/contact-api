import { Resend } from "resend";
import type { EmailProvider, EmailPayload } from "../types.js";

export class ResendProvider implements EmailProvider {
  readonly id = "resend";
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(payload: EmailPayload): Promise<void> {
    const result = await this.client.emails.send(payload);
    if (result.error) {
      console.error("Resend API error:", result.error);
      throw new Error(`Email send failed: ${result.error.message}`);
    }
  }
}
