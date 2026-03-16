import { vi, describe, it, expect, beforeEach } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

vi.mock("@vercel/firewall", () => ({ checkRateLimit: vi.fn() }));
vi.mock("../../api/contact/cors.js", () => ({ setCorsHeaders: vi.fn(), isOriginAllowed: vi.fn() }));
vi.mock("../../api/contact/validation.js", () => ({ isValidBody: vi.fn() }));
vi.mock("../../api/contact/email.js", () => ({ getEmailConfig: vi.fn(), sendEmail: vi.fn() }));
vi.mock("../../api/contact/config.js", () => ({ config: { allowedOrigins: ["https://example.com"] } }));

import { checkRateLimit } from "@vercel/firewall";
import { setCorsHeaders, isOriginAllowed } from "../../api/contact/cors.js";
import { isValidBody } from "../../api/contact/validation.js";
import { getEmailConfig, sendEmail } from "../../api/contact/email.js";
import handler from "../../api/contact/index.js";

const makeReq = (overrides: Partial<VercelRequest> = {}): VercelRequest => ({
  headers: { origin: "https://example.com", "content-type": "application/json" },
  method: "POST",
  body: { subject: "Hello", email: "user@example.com", message: "HellO" },
  ...overrides,
} as unknown as VercelRequest);

const makeRes = (): VercelResponse => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return res as unknown as VercelResponse;
};

describe("contact handler (index.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(setCorsHeaders).mockReturnValue(false);
    vi.mocked(isOriginAllowed).mockReturnValue(true);
    vi.mocked(checkRateLimit).mockResolvedValue({ rateLimited: false } as any);
    vi.mocked(getEmailConfig).mockReturnValue({ client: {} as any, from: "from@test.com", to: "to@test.com" });
    vi.mocked(isValidBody).mockReturnValue(true);
    vi.mocked(sendEmail).mockResolvedValue(undefined);
  });

  it("returns early when setCorsHeaders returns true (OPTIONS preflight)", async () => {
    vi.mocked(setCorsHeaders).mockReturnValue(true);
    const req = makeReq({ method: "OPTIONS" });
    const res = makeRes();
    await handler(req, res);
    expect(res.status).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns 403 when origin is not allowed", async () => {
    vi.mocked(isOriginAllowed).mockReturnValue(false);
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(isOriginAllowed).mockReturnValue(true);
    vi.mocked(checkRateLimit).mockResolvedValue({ rateLimited: true } as any);
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it("returns 405 when method is not POST", async () => {
    const res = makeRes();
    await handler(makeReq({ method: "GET" }), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns 415 when content-type is not application/json", async () => {
    const res = makeRes();
    await handler(makeReq({ headers: { origin: "https://example.com", "content-type": "text/plain" } }), res);
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it("returns 503 when server is misconfigured", async () => {
    vi.mocked(getEmailConfig).mockReturnValue(null);
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: "Service temporarily unavailable" });
  });

  it("returns fake success and does not send email when honeypot is triggered", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const req = makeReq({ body: { subject: "Hi", email: "user@example.com", message: "Hello", fax_number: "1234567890" } });
    const res = makeRes();
    await handler(req, res);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Message sent successfully" });
    warnSpy.mockRestore();
  });

  it("returns 400 when body is invalid", async () => {
    vi.mocked(isValidBody).mockReturnValue(false);
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid or missing fields" });
  });

  it("returns success when email sends successfully", async () => {
    const res = makeRes();
    await handler(makeReq(), res);
    expect(sendEmail).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Message sent successfully" });
  });

  it("returns 500 when sendEmail throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(sendEmail).mockRejectedValue(new Error("Failure"));
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Message delivery failed. Please try again later." });
    errorSpy.mockRestore();
  });
});
