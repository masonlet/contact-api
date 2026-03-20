import { describe, it, expect, vi } from "vitest";
import { isOriginAllowed, setCorsHeaders } from "@/api/contact/cors.js";
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

describe("isOriginAllowed", () => {
  it("should return false when allowedOrigins is empty", () => {
    expect(isOriginAllowed("https://example.com", [])).toBe(false);
  });
  it("should return false when origin is undefined", () => {
    expect(isOriginAllowed(undefined, ["https://example.com"])).toBe(false);
  });
  it("should return false when origin is not in the list", () => {
    expect(isOriginAllowed("https://other.com", ["https://example.com"])).toBe(false);
  });
  it("should return true when origin is in the list", () => {
    expect(isOriginAllowed("https://example.com", ["https://example.com"])).toBe(true);
  });
  it("should return true when origin is one of many in the list", () => {
    expect(isOriginAllowed("https://b.com", ["https://a.com", "https://b.com"])).toBe(true);
  });
});

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

  it("should return true and end response on OPTIONS", () => {
    const req = makeReq("https://example.com", "OPTIONS");
    const res = makeRes();
    const result = setCorsHeaders(req, res, ["https://example.com"]);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should return true and end response on OPTIONS from a disallowed origin" , () => {
    const req = makeReq("https://other.com", "OPTIONS");
    const res = makeRes();
    const result = setCorsHeaders(req, res, ["https://example.com"]);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.setHeader).not.toHaveBeenCalledWith("Access-Control-Allow-Origin", expect.anything());
    expect(res.end).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should return false on non-OPTIONS requests", () => {
    const req = makeReq("https://example.com", "POST");
    const res = makeRes();
    expect(setCorsHeaders(req, res, ["https://example.com"])).toBe(false);
  });
});
