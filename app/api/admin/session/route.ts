import { adminSessionCookie, createAdminSession, isAdminRequest, verifyAdminCredentials } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return isAdminRequest(request)
    ? Response.json({ authenticated: true })
    : Response.json({ authenticated: false }, { status: 401 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.slice(0, 320) : "";
    const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
    if (!verifyAdminCredentials(email, password)) {
      return Response.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
    return Response.json(
      { ok: true },
      { headers: { "set-cookie": adminSessionCookie(createAdminSession(email)) } },
    );
  } catch {
    return Response.json({ error: "로그인 요청을 처리하지 못했습니다." }, { status: 400 });
  }
}

export async function DELETE() {
  return Response.json({ ok: true }, { headers: { "set-cookie": adminSessionCookie("", 0) } });
}
