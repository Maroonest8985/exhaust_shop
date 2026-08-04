import { createHmac, timingSafeEqual } from "node:crypto";

export const adminCookieName = "taibosi_admin_session";
const sessionTtlSeconds = 60 * 60 * 12;

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function verifyAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase()) && safeEqual(password, expectedPassword);
}

export function createAdminSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function isAdminRequest(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${adminCookieName}=`));
  const token = cookie?.slice(adminCookieName.length + 1);
  if (!token) return false;
  const [payload, providedSignature] = token.split(".");
  if (!payload || !providedSignature || !safeEqual(providedSignature, signature(payload))) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof session.exp === "number" && session.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function adminSessionCookie(value: string, maxAge = sessionTtlSeconds) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${adminCookieName}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}
