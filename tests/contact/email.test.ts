import { vi, describe, it, expect, beforeEach } from "vitest";
import type { EmailProvider, ContactBody } from "@/src/types.js";
import { getEmailConfig, sendEmail, type EmailConfig } from "@/src/email.js";

const mockProvider: EmailProvider = {
  id: "mock",
  send: vi.fn()
};

const mockEmailConfig: EmailConfig = {
  provider: mockProvider,
  from: "from@test.com",
  to: ["to@test.com"]
};

const body: ContactBody = {
  email: "user@test.com",
  message: "Hello"
};

beforeEach(() => vi.clearAllMocks());

describe("email.ts", () => {
  describe("getEmailConfig", () => {
    const base = { provider: mockProvider, fromEmail: mockEmailConfig.from, toEmails: mockEmailConfig.to, allowedOrigins: [] };

    it("returns null if config missing or empty props", () => {
      expect(getEmailConfig({ ...base, provider: null })).toBeNull();
      expect(getEmailConfig({ ...base, fromEmail: "" })).toBeNull();
      expect(getEmailConfig({ ...base, toEmails: [] })).toBeNull();
    });

    it("returns EmailConfig when valid", () => {
      expect(getEmailConfig({ ...base })).toMatchObject(mockEmailConfig);
    });
  });

  describe("sendEmail", () => {
    it("calls resend with sanitized payload", async () => {
      await sendEmail(mockEmailConfig, { ...body, subject: "Test\nSubject" });
      expect(mockProvider.send).toHaveBeenCalledWith({
        from: mockEmailConfig.from,
        to: mockEmailConfig.to,
        replyTo: body.email,
        subject: "Contact form: Test Subject",
        text: `From: ${body.email}\n\n${body.message}`
      });
    });

    it("formats fromLine with name when provided", async () => {
      await sendEmail(mockEmailConfig, { ...body, name: "Tester" });
      expect(mockProvider.send).toHaveBeenCalledWith(
        expect.objectContaining({ text: `From: Tester <${body.email}>\n\n${body.message}` })
      );
    });

    it("uses default subject when not provided", async () => {
      await sendEmail(mockEmailConfig, body);
      expect(mockProvider.send).toHaveBeenCalledWith(
        expect.objectContaining({ subject: "Contact form: New message" })
      );
    });

    it("throws when provider.send rejects", async () => {
      (mockProvider.send as any).mockRejectedValue(new Error("Send failed"));
      await expect(sendEmail(mockEmailConfig, body)).rejects.toThrow("Send failed");
    });  
  });
});
