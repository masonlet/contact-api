import type { ContactBody } from "./types.js";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidBody(body: unknown): body is ContactBody {
  if (body === null || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  const { subject, email, message } = record as Record<string, unknown>;
  return (
    typeof subject === "string" && !!subject.trim() && subject.length <= 200 &&
    typeof email === "string" && EMAIL_REGEX.test(email) &&
    typeof message === "string" && !!message.trim() && message.length <= 2000
  );
}

