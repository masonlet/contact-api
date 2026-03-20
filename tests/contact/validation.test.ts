import { describe, it, expect } from "vitest";
import { EMAIL_REGEX, isValidBody } from "@/api/contact/validation.js";

describe("EMAIL_REGEX", () => {
  const validate = (email: string) => EMAIL_REGEX.test(email);

  it("should accept standard emails", () => {
    expect(validate("user@example.com")).toBe(true);
    expect(validate("first.last@domain.org")).toBe(true);
  });

  it("should accept subdomains", () => {
    expect(validate("user@mail.sub.domain.co.uk")).toBe(true);
  });

  it("should accept plus addressing", () => {
    expect(validate("user+tag@example.com")).toBe(true);
  });

  it("should accept numeric local parts", () => {
    expect(validate("123@example.com")).toBe(true);
  });

  it("should reject an empty string", () => {
    expect(validate("")).toBe(false);
  });

  it("should reject emails without an @ symbol", () => {
    expect(validate("userexample")).toBe(false);
  });

  it("should reject emails without a dot in the domain", () => {
    expect(validate("user@domaincom")).toBe(false);
  });

  it("should reject multiple @ symbols", () => {
    expect(validate("user@tag@domain.com")).toBe(false);
  });

  it("should reject whitespace", () => {
    expect(validate(" user@example.com")).toBe(false);
    expect(validate("user@example .com")).toBe(false);
    expect(validate("user@example.com ")).toBe(false);
  });

  it("should reject empty parts", () => {
    expect(validate("@domain.com")).toBe(false);
    expect(validate("user@.com")).toBe(false);
    expect(validate("user@domain.")).toBe(false);
  });
});

describe("isValidBody",() => {
  it("should accept a valid body", () => {
    const valid = {
      subject: "Hello",
      email: "test@example.com",
      message: "Valid test message."
    };
    expect(isValidBody(valid)).toBe(true);
  });

  it("should reject non-objects", () => {
    [null, "string", 42, [], undefined].forEach(v => {
      expect(isValidBody(v)).toBe(false)
    });
  });

  it("should reject missing fields", () => {
    expect(isValidBody({})).toBe(false);
    expect(isValidBody({ subject: "Hello", email: "user@example.com" })).toBe(false);
  });

  it("should reject non-string field types", () => {
    expect(isValidBody({ subject: 123, email: "user@example.com", message: "hello" })).toBe(false);
    expect(isValidBody({ subject: "hi", email: 123, message: "hello" })).toBe(false);
    expect(isValidBody({ subject: "hi", email: "user@example.com", message: 123 })).toBe(false);
  });

  it("should reject whitespace-only subject or message", () => {
    expect(isValidBody({ subject: "  ", email: "user@example.com", message: "hello" })).toBe(false);
    expect(isValidBody({ subject: "hi", email: "user@example.com", message: "   " })).toBe(false);
  });

  it("should reject subject over 200 chars", () => {
    expect(isValidBody({ subject: "x".repeat(201), email: "user@example.com", message: "hello" })).toBe(false);
    expect(isValidBody({ subject: "x".repeat(200), email: "user@example.com", message: "hello"})).toBe(true);
  });

  it("should reject message over 2000 chars", () => {
    expect(isValidBody({ subject: "hello", email: "user@example.com", message: "x".repeat(2001) })).toBe(false);
    expect(isValidBody({ subject: "hello", email: "user@example.com", message: "x".repeat(2000) })).toBe(true);
  });

  it("should reject invalid emails", () => {
    expect(isValidBody({ subject: "hello", email: "invalid", message: "nah..." })).toBe(false);
  });
});
  
