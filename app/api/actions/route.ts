import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLogs, commerceEvents } from "../../../db/schema";

const allowedKinds = new Set(["inquiry", "restock", "booking", "order", "inventory", "fitment", "support"]);

function getActor(request: Request) {
  return {
    actorId: request.headers.get("oai-authenticated-user-id"),
    actorEmail: request.headers.get("oai-authenticated-user-email"),
  };
}

export async function GET() {
  try {
    const db = await getDb();
    const events = await db.select().from(commerceEvents).orderBy(desc(commerceEvents.createdAt), desc(commerceEvents.id)).limit(20);
    return Response.json({ events });
  } catch (error) {
    const message = error instanceof Error ? error.message : "저장 데이터를 불러오지 못했습니다.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { kind?: string; payload?: Record<string, unknown> };
    const kind = body.kind?.trim() ?? "";
    if (!allowedKinds.has(kind) || !body.payload || Array.isArray(body.payload)) {
      return Response.json({ error: "유효한 작업 유형과 데이터가 필요합니다." }, { status: 400 });
    }

    const actor = getActor(request);
    const db = await getDb();
    const [event] = await db
      .insert(commerceEvents)
      .values({ kind, payload: JSON.stringify(body.payload), ...actor })
      .returning();

    if (["inventory", "fitment", "order"].includes(kind)) {
      await db.insert(auditLogs).values({
        action: kind === "inventory" ? "INVENTORY_ADJUSTED" : kind === "fitment" ? "FITMENT_CHANGED" : "ORDER_CREATED",
        targetType: kind.toUpperCase(),
        targetId: String(body.payload.product ?? body.payload.module ?? event.id),
        reason: typeof body.payload.reason === "string" ? body.payload.reason : "고객 또는 운영자 작업",
        diff: JSON.stringify(body.payload),
        ...actor,
      });
    }

    return Response.json({ event }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "작업을 저장하지 못했습니다.";
    return Response.json({ error: message }, { status: 503 });
  }
}
