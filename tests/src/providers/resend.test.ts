import { describe, it, expect, vi, beforeEach } from "vitest";
import { Resend } from "resend";
import { ResendProvider } from "../../../src/providers/resend.js";
import type { EmailPayload } from "../../../src/types.js";

vi.mock("resend", () => {
  const mockSend = vi.fn();
  const MockResend = vi.fn().mockImplementation(function(this: any) {
    this.emails = { send: mockSend };
  });
  
  return { Resend: MockResend };
});

describe("ResendProvider", () => {
  const apiKey = "re_123456789";

  const getMockSend = () => {
    const resendInstance = new Resend(apiKey);
    return resendInstance.emails.send as any;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets id to resend", () => {
    const provider = new ResendProvider(apiKey);
    expect(provider.id).toBe("resend");
    expect(Resend).toHaveBeenCalledWith(apiKey);
  });

  it("sends email payload", async () => {
    const provider = new ResendProvider(apiKey);
    const mockSend = getMockSend();
    mockSend.mockResolvedValue({ data: { id: "msg_123" }, error: null });

    const payload: EmailPayload = {
      from: "from@test.com",
      to: ["to@test.com"],
      replyTo: "reply@test.com",
      subject: "Test",
      text: "Hello"
    };

    await expect(provider.send(payload)).resolves.toBeUndefined();
    expect(mockSend).toHaveBeenCalledWith(payload);
  });

  it("throws on resend error response", async () => {
    const provider = new ResendProvider(apiKey);
    const mockSend = getMockSend();
    const mockError = { message: "Invalid recipient domain" };
    mockSend.mockResolvedValue({ data: null, error: mockError });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const payload: EmailPayload = {
      from: "from@test.com",
      to: ["to@test.com"],
      replyTo: "reply@test.com",
      subject: "Test",
      text: "Hello"
    };

    await expect(provider.send(payload)).rejects.toThrow(`Email send failed: ${mockError.message}`);
    expect(consoleSpy).toHaveBeenCalledWith("Resend API error:", mockError);

    consoleSpy.mockRestore();
  });
});
