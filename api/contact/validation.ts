import type { ContactBody } from "./types.js";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidBody(body: unknown): body is ContactBody {
  if (body === null || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  const { email, message, subject, name } = record;
  return (
    typeof email === "string" && EMAIL_REGEX.test(email) &&
    typeof message === "string" && !!message.trim() && message.length <= 2000 &&
    (subject === undefined || (typeof subject === "string" && subject.length <= 200)) &&
    (name === undefined || (typeof name === "string" && name.length <= 100))
  );
}

