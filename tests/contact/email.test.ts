import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Resend } from "resend";
import { getEmailConfig, sendEmail, type EmailConfig } from "../../api/contact/email.js";
import type { Config } from "../../api/contact/config.js";
import type { ContactBody } from "../../api/contact/types.js";

vi.mock("resend");

const mockResend = {
  emails: {
    send: vi.fn()
  }
} satisfies Resend;

describe("email.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (vi.mocked(mockResend.emails.send) as any).mockResolvedValue({ data: [], error: null });
  });

  describe("getEmailConfig", () => {
    it("returns null if config missing or empty props", () => {
      expect(getEmailConfig({ resend: null as any, fromEmail: "a@b.com", toEmail: "c@d.com" })).toBeNull();
      expect(getEmailConfig({ resend: {} as any, fromEmail: "", toEmail: "c@d.com" })).toBeNull();
      expect(getEmailConfig({ resend: {} as any, fromEmail: "a@b.com", toEmail: "" })).toBeNull();
      expect(getEmailConfig({ resend: {} as any, fromEmail: "a@b.com", toEmail: [] })).toBeNull();
    });

    it("returns EmailConfig when valid", () => {
      const result = getEmailConfig({ resend: mockResend, fromEmail: "from@test.com", toEmail: "to@test.com" });
      expect(result).toMatchObject({
        client: mockResend,
        from: 'from@test.com',
        to: 'to@test.com'
      });
    });
  });

  describe("sendEmail", () => {
    const mockEmailConfig: EmailConfig = {
      client: mockResend as any,
      from: "from@test.com",
      to: ["to@test.com"]
    };
    const body: ContactBody = {
      email: "user@test.com",
      subject: "Test\nSubject",
      message: "Hello "
    };

    it("calls resend with sanitized payload", async () => {
      await sendEmail(mockEmailConfig, body);
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: "from@test.com",
        to: ["to@test.com"],
        replyTo: body.email,
        subject: "Contact form: Test Subject",
        text: `From: ${body.email}\n\n${body.message.trim()}`
      });
    });

    it("throws Resend errors", async () => {
      (mockResend.emails.send as any).mockRejectedValue(new Error("API fail"));
      await expect(sendEmail(mockEmailConfig, body)).rejects.toThrow("API fail");
    });

    it("throws on Resend success-with-error response", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      (mockResend.emails.send as any).mockResolvedValue({
        data: null,
        error: { message: "Invalid recipient domain" }
      });

      await expect(sendEmail(mockEmailConfig, body)).rejects.toThrow(/Invalid/);

      expect(consoleSpy).toHaveBeenCalledWith("Resend API error:", { message: "Invalid recipient domain" });
      consoleSpy.mockRestore();
    });
  });
});
