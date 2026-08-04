import { randomUUID } from "node:crypto";
import { count, desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLogs, commerceEvents, supportInquiries } from "../../../db/schema";
import { isAdminRequest } from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inquiryTypes = new Set([
  "FITMENT",
  "INSTALLATION",
  "ORDER_DELIVERY",
  "WARRANTY_AS",
  "RETURN_EXCHANGE",
  "OTHER",
]);

type InquiryInput = {
  type?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
  customerPhone?: unknown;
  subject?: unknown;
  body?: unknown;
  productSku?: unknown;
  productName?: unknown;
  vehicleSnapshot?: unknown;
  sourcePath?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function makeInquiryNumber() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `INQ-${date.year}${date.month}${date.day}-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

function serializeInquiry(inquiry: typeof supportInquiries.$inferSelect) {
  return {
    id: inquiry.id,
    inquiryNumber: inquiry.inquiryNumber,
    type: inquiry.type,
    status: inquiry.status,
    customerName: inquiry.customerName,
    customerEmail: inquiry.customerEmail,
    customerPhone: inquiry.customerPhone,
    subject: inquiry.subject,
    body: inquiry.body,
    productSku: inquiry.productSku,
    productName: inquiry.productName,
    vehicleSnapshot: inquiry.vehicleSnapshot,
    sourcePath: inquiry.sourcePath,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
  };
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "운영자 로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const requestedLimit = Number(new URL(request.url).searchParams.get("limit") ?? 100);
    const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, Math.trunc(requestedLimit))) : 100;
    const db = getDb();
    const [rows, totalRows] = await Promise.all([
      db.select().from(supportInquiries).orderBy(desc(supportInquiries.createdAt)).limit(limit),
      db.select({ value: count() }).from(supportInquiries),
    ]);

    return Response.json(
      { inquiries: rows.map(serializeInquiry), total: totalRows[0]?.value ?? 0 },
      { headers: { "cache-control": "no-store, max-age=0" } },
    );
  } catch {
    return Response.json({ error: "문의 내역을 불러오지 못했습니다." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InquiryInput;
    const type = text(body.type, 40);
    const customerName = text(body.customerName, 100);
    const customerEmail = text(body.customerEmail, 320).toLowerCase();
    const customerPhone = text(body.customerPhone, 30);
    const subject = text(body.subject, 300);
    const inquiryBody = text(body.body, 5000);
    const sourcePath = text(body.sourcePath, 120);

    if (
      !inquiryTypes.has(type) ||
      customerName.length < 2 ||
      !/^\S+@\S+\.\S+$/.test(customerEmail) ||
      customerPhone.length < 8 ||
      subject.length < 2 ||
      inquiryBody.length < 5 ||
      !sourcePath.startsWith("/support/")
    ) {
      return Response.json({ error: "이름, 이메일, 연락처, 제목과 문의 내용을 정확히 입력해 주세요." }, { status: 422 });
    }

    const inquiryNumber = makeInquiryNumber();
    const db = getDb();
    const inquiry = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(supportInquiries)
        .values({
          inquiryNumber,
          type,
          status: "RECEIVED",
          customerName,
          customerEmail,
          customerPhone,
          subject,
          body: inquiryBody,
          productSku: text(body.productSku, 80) || null,
          productName: text(body.productName, 500) || null,
          vehicleSnapshot: text(body.vehicleSnapshot, 500) || null,
          sourcePath,
        })
        .returning();

      await tx.insert(commerceEvents).values({
        kind: "support",
        status: "RECEIVED",
        actorEmail: customerEmail,
        payload: { inquiryNumber, type, status: "RECEIVED" },
      });
      await tx.insert(auditLogs).values({
        action: "INQUIRY_CREATED",
        targetType: "SUPPORT_INQUIRY",
        targetId: inquiryNumber,
        reason: "고객 문의 접수",
        actorEmail: customerEmail,
        diff: { status: "RECEIVED", type },
      });

      return created;
    });

    return Response.json({ inquiry: serializeInquiry(inquiry) }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return Response.json({ error: "문의 접수번호가 충돌했습니다. 다시 접수해 주세요." }, { status: 409 });
    }
    return Response.json({ error: "문의를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
