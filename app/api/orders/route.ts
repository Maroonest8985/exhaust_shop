import { randomUUID } from "node:crypto";
import { count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLogs, commerceEvents, orderItems, orders, orderStatusHistory, products as productTable } from "../../../db/schema";
import { isAdminRequest } from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const paymentMethods = new Set(["CARD", "EASY_PAY", "BANK_TRANSFER"]);
const fulfillmentMethods = new Set(["INSTALLER_DELIVERY", "STANDARD_DELIVERY"]);

type OrderLineInput = {
  productSku?: unknown;
  quantity?: unknown;
  optionName?: unknown;
  vehicleSnapshot?: unknown;
};

type OrderInput = OrderLineInput & {
  idempotencyKey?: unknown;
  items?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
  customerPhone?: unknown;
  recipientName?: unknown;
  recipientPhone?: unknown;
  postalCode?: unknown;
  addressLine1?: unknown;
  addressLine2?: unknown;
  fulfillmentMethod?: unknown;
  paymentMethod?: unknown;
  customerNote?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function makeOrderNumber() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `TB-${date.year}${date.month}${date.day}-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function serializeItem(item: typeof orderItems.$inferSelect) {
  return {
    productSku: item.productSku,
    productName: item.productName,
    optionName: item.optionName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
  };
}

function serializeOrder(order: typeof orders.$inferSelect, items: Array<typeof orderItems.$inferSelect> = []) {
  const serializedItems = items.map(serializeItem);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    fulfillmentMethod: order.fulfillmentMethod,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    totalAmount: order.totalAmount,
    currency: order.currency,
    createdAt: order.createdAt,
    item: serializedItems[0] ?? null,
    items: serializedItems,
  };
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "운영자 로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const requestedLimit = Number(new URL(request.url).searchParams.get("limit") ?? 50);
    const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, Math.trunc(requestedLimit))) : 50;
    const db = getDb();
    const [orderRows, totalRows] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit),
      db.select({ value: count() }).from(orders),
    ]);
    const itemRows = orderRows.length
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderRows.map((order) => order.id)))
      : [];
    const itemsByOrder = new Map<string, Array<typeof orderItems.$inferSelect>>();
    for (const item of itemRows) {
      itemsByOrder.set(item.orderId, [...(itemsByOrder.get(item.orderId) ?? []), item]);
    }

    return Response.json({
      orders: orderRows.map((order) => serializeOrder(order, itemsByOrder.get(order.id))),
      total: totalRows[0]?.value ?? 0,
    });
  } catch {
    return Response.json({ error: "주문 내역을 불러오지 못했습니다." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderInput;
    const idempotencyKey = text(body.idempotencyKey, 36);
    const rawItems: OrderLineInput[] = Array.isArray(body.items)
      ? body.items.filter((item): item is OrderLineInput => typeof item === "object" && item !== null)
      : [{ productSku: body.productSku, quantity: body.quantity, optionName: body.optionName, vehicleSnapshot: body.vehicleSnapshot }];
    const inputItems = rawItems.map((item) => ({
      productSku: text(item.productSku, 80),
      quantity: typeof item.quantity === "number" ? Math.trunc(item.quantity) : 0,
      optionName: text(item.optionName, 200),
      vehicleSnapshot: text(item.vehicleSnapshot, 300),
    }));
    const customerName = text(body.customerName, 100);
    const customerEmail = text(body.customerEmail, 320).toLowerCase();
    const customerPhone = text(body.customerPhone, 30);
    const recipientName = text(body.recipientName, 100);
    const recipientPhone = text(body.recipientPhone, 30);
    const postalCode = text(body.postalCode, 20);
    const addressLine1 = text(body.addressLine1, 500);
    const addressLine2 = text(body.addressLine2, 500);
    const paymentMethod = text(body.paymentMethod, 32);
    const fulfillmentMethod = text(body.fulfillmentMethod, 32);

    if (
      !validUuid(idempotencyKey) ||
      inputItems.length < 1 ||
      inputItems.length > 20 ||
      inputItems.some((item) => !item.productSku || item.quantity < 1 || item.quantity > 10) ||
      customerName.length < 2 ||
      !/^\S+@\S+\.\S+$/.test(customerEmail) ||
      customerPhone.length < 8 ||
      recipientName.length < 2 ||
      recipientPhone.length < 8 ||
      !postalCode ||
      !addressLine1 ||
      !paymentMethods.has(paymentMethod) ||
      !fulfillmentMethods.has(fulfillmentMethod)
    ) {
      return Response.json({ error: "장바구니, 주문자, 배송지와 결제 정보를 정확히 입력해 주세요." }, { status: 422 });
    }

    const db = getDb();
    const [existing] = await db.select().from(orders).where(eq(orders.idempotencyKey, idempotencyKey)).limit(1);
    if (existing) {
      const existingItems = await db.select().from(orderItems).where(eq(orderItems.orderId, existing.id));
      return Response.json({ order: serializeOrder(existing, existingItems), duplicate: true });
    }

    const requestedSkus = [...new Set(inputItems.map((item) => item.productSku))];
    const catalogRows = await db.select().from(productTable).where(inArray(productTable.sku, requestedSkus));
    const catalogBySku = new Map(catalogRows.map((product) => [product.sku, product]));
    if (inputItems.some((item) => {
      const product = catalogBySku.get(item.productSku);
      return !product || product.status !== "PUBLISHED" || product.stockType === "OUT_OF_STOCK";
    })) {
      return Response.json({ error: "판매 중인 상품 정보를 다시 확인해 주세요. 장바구니를 새로 구성해 주세요." }, { status: 422 });
    }

    const resolvedItems = inputItems.map((item) => {
      const product = catalogBySku.get(item.productSku)!;
      return { input: item, product, lineTotal: product.price * item.quantity };
    });
    const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const orderNumber = makeOrderNumber();
    const created = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          idempotencyKey,
          status: "RECEIVED",
          paymentStatus: "PENDING",
          paymentMethod,
          fulfillmentMethod,
          customerName,
          customerEmail,
          customerPhone,
          recipientName,
          recipientPhone,
          postalCode,
          addressLine1,
          addressLine2: addressLine2 || null,
          subtotal,
          shippingFee: 0,
          installationFee: null,
          totalAmount: subtotal,
          customerNote: text(body.customerNote, 1000) || null,
        })
        .returning();

      const items = await tx
        .insert(orderItems)
        .values(resolvedItems.map(({ input, product, lineTotal }) => ({
          orderId: order.id,
          productSku: product.sku,
          productName: product.name,
          optionName: input.optionName || null,
          vehicleSnapshot: input.vehicleSnapshot || null,
          fitmentSnapshot: product.fitmentStatus,
          stockTypeSnapshot: product.stockType,
          quantity: input.quantity,
          unitPrice: product.price,
          lineTotal,
        })))
        .returning();

      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        fromStatus: null,
        toStatus: "RECEIVED",
        reason: "고객 주문 접수",
        actorType: "CUSTOMER",
        actorId: customerEmail,
      });
      const itemSummary = resolvedItems.map(({ input, lineTotal }) => ({ productSku: input.productSku, quantity: input.quantity, lineTotal }));
      await tx.insert(commerceEvents).values({
        kind: "order",
        status: "RECEIVED",
        actorEmail: customerEmail,
        payload: { orderNumber, items: itemSummary, totalAmount: subtotal },
      });
      await tx.insert(auditLogs).values({
        action: "ORDER_CREATED",
        targetType: "ORDER",
        targetId: orderNumber,
        reason: "고객 주문 접수",
        actorEmail: customerEmail,
        diff: { status: "RECEIVED", paymentStatus: "PENDING", items: itemSummary, totalAmount: subtotal },
      });

      return { order, items };
    });

    return Response.json({ order: serializeOrder(created.order, created.items) }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return Response.json({ error: "동일한 주문이 이미 처리됐습니다. 주문 내역을 확인해 주세요." }, { status: 409 });
    }
    return Response.json({ error: "주문을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
