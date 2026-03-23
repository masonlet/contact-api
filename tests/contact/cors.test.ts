import { describe, it, expect, vi } from "vitest";
import { setCorsHeaders } from "@/api/contact/cors.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const makeReq = (origin?: string, method = "POST") => ({
  headers: { origin },
  method,
}) as unknown as VercelRequest;

const makeRes = () => {
  const headers: Record<string, string> = {};
  return {
    setHeader: vi.fn((k: string, v: string) => { headers[k] = v; }),
    status: vi.fn().mockReturnThis(),
    end: vi.fn(),
    _headers: headers,
  } as unknown as VercelResponse;
};

describe("setCorsHeaders", () => {
  it("should always set X-Content-Type-Options", () => {
    const req = makeReq();
    const res = makeRes();
    setCorsHeaders(req, res, []);
    expect(res.setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
  });

  it("should set CORS headers when origin is allowed", () => {
    const req = makeReq("https://example.com");
    const res = makeRes();
    setCorsHeaders(req, res, ["https://example.com"]);
    expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", "https://example.com");
    expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Methods", "POST, OPTIONS");
    expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Headers", "Content-Type");
  });

  it("should not set CORS headers when origin is undefined", () => {
    const req = makeReq(undefined);
    const res = makeRes();
    setCorsHeaders(req, res, ["https://example.com"]);
    expect(res.setHeader).not.toHaveBeenCalledWith("Access-Control-Allow-Origin", expect.anything());
  });

  it("should not set CORS headers when origin is not allowed", () => {
    const req = makeReq("https://other.com");
    const res = makeRes();
    setCorsHeaders(req, res, ["https://example.com"]);
    expect(res.setHeader).not.toHaveBeenCalledWith("Access-Control-Allow-Origin", expect.anything());
  });

  it("should return 'preflight' and 204 on OPTIONS from allowed origin", () => {
    const req = makeReq("https://example.com", "OPTIONS");
    const res = makeRes();
    const result = setCorsHeaders(req, res, ["https://example.com"]);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(result).toBe("preflight");
  });

  it("should return 'preflight' and 403 on OPTIONS from a disallowed origin" , () => {
    const req = makeReq("https://other.com", "OPTIONS");
    const res = makeRes();
    const result = setCorsHeaders(req, res, ["https://example.com"]);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.setHeader).not.toHaveBeenCalledWith("Access-Control-Allow-Origin", expect.anything());
    expect(res.end).toHaveBeenCalled();
    expect(result).toBe("preflight");
  });

  it("should return 'forbidden' on non-OPTIONS requests from disallowed origin", () => {
    const req = makeReq("https://example.com", "POST");
    const res = makeRes();
    expect(setCorsHeaders(req, res, ["https://other.com"])).toBe("forbidden");
  });

  it("should return 'ok' on allowed POST request", () => {
    const req = makeReq("https://example.com", "POST");
    const res = makeRes();
    expect(setCorsHeaders(req, res, ["https://example.com"])).toBe("ok");
  });

  it("should return 'forbidden' when allowedOrigins is empty", () => {
    const req = makeReq("https://example.com", "POST");
    const res = makeRes();
    expect(setCorsHeaders(req, res, [])).toBe("forbidden");
  });
});
