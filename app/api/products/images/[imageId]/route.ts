import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { productImages, products } from "../../../../../db/schema";
import { isAdminRequest } from "../../../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  try {
    const { imageId } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(imageId)) return new Response(null, { status: 404 });
    const db = getDb();
    const [row] = await db
      .select({ image: productImages, productStatus: products.status })
      .from(productImages)
      .innerJoin(products, eq(products.id, productImages.productId))
      .where(eq(productImages.id, imageId))
      .limit(1);
    if (!row || (row.productStatus !== "PUBLISHED" && !isAdminRequest(request))) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(Buffer.from(row.image.imageBase64, "base64")), {
      headers: {
        "content-type": row.image.mimeType,
        "content-length": String(row.image.byteSize),
        "cache-control": row.productStatus === "PUBLISHED" ? "public, max-age=31536000, immutable" : "private, no-store",
        "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(row.image.fileName)}`,
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
