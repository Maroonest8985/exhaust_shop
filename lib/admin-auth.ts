import { createHmac, timingSafeEqual } from "node:crypto";

export const adminCookieName = "taibosi_admin_session";
const sessionTtlSeconds = 60 * 60 * 12;

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function credentialNames() {
  return process.env.NODE_ENV === "production"
    ? { email: "ADMIN_EMAIL", password: "ADMIN_PASSWORD", secret: "ADMIN_SESSION_SECRET" } as const
    : { email: "LOCAL_ADMIN_EMAIL", password: "LOCAL_ADMIN_PASSWORD", secret: "LOCAL_ADMIN_SESSION_SECRET" } as const;
}

function credentials() {
  const names = credentialNames();
  return {
    names,
    email: process.env[names.email]?.trim(),
    password: process.env[names.password],
    secret: process.env[names.secret]?.trim(),
  };
}

export function adminAuthConfigurationError() {
  const current = credentials();
  if (!current.email || !current.password) {
    return `${current.names.email}과 ${current.names.password} 환경 변수를 설정해 주세요.`;
  }
  if (!current.secret || current.secret.length < 32) {
    return `${current.names.secret} 환경 변수에 32자 이상의 임의 문자열을 설정해 주세요.`;
  }
  return null;
}

function signature(payload: string) {
  const secret = credentials().secret;
  if (!secret || secret.length < 32) return null;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function verifyAdminCredentials(email: string, password: string) {
  const { email: expectedEmail, password: expectedPassword } = credentials();
  if (!expectedEmail || !expectedPassword) return false;
  return safeEqual(email.trim().toLowerCase(), expectedEmail.toLowerCase()) && safeEqual(password, expectedPassword);
}

export function createAdminSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds })).toString("base64url");
  const sessionSignature = signature(payload);
  if (!sessionSignature) throw new Error("Admin authentication is not configured.");
  return `${payload}.${sessionSignature}`;
}

export function isAdminRequest(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${adminCookieName}=`));
  const token = cookie?.slice(adminCookieName.length + 1);
  if (!token) return false;
  const [payload, providedSignature] = token.split(".");
  const expectedSignature = payload ? signature(payload) : null;
  if (!payload || !providedSignature || !expectedSignature || !safeEqual(providedSignature, expectedSignature)) return false;
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
