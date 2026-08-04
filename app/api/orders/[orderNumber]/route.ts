import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { orderItems, orders, orderStatusHistory } from "../../../../db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const { orderNumber } = await params;
    if (!/^TB-[0-9]{6}-[0-9A-F]{12}$/.test(orderNumber)) {
      return Response.json({ error: "유효하지 않은 주문번호입니다." }, { status: 400 });
    }

    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (!order) return Response.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });

    const [items, history] = await Promise.all([
      db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
      db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id)),
    ]);

    return Response.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        fulfillmentMethod: order.fulfillmentMethod,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: items.map((item) => ({
          productSku: item.productSku,
          productName: item.productName,
          optionName: item.optionName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
        history: history.map((entry) => ({
          toStatus: entry.toStatus,
          reason: entry.reason,
          createdAt: entry.createdAt,
        })),
      },
    });
  } catch {
    return Response.json({ error: "주문 정보를 불러오지 못했습니다." }, { status: 503 });
  }
}
