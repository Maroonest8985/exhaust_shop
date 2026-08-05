import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLogs, productImages, products, productVehicleFitments } from "../../../db/schema";
import { isAdminRequest } from "../../../lib/admin-auth";
import { parseProductOptionGroups, type ProductOptionGroup } from "../../../lib/product-options";
import { existingVehicleGenerationIds, parseVehicleGenerationIds, productVehicleFitmentsByProductIds, type ProductVehicleFitmentSummary } from "../../../lib/product-vehicle-fitments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedStatuses = new Set(["DRAFT", "PUBLISHED"]);
const allowedStockTypes = new Set(["DOMESTIC", "OVERSEAS_ORDER", "PREORDER", "OUT_OF_STOCK"]);
const allowedFitments = new Set(["VERIFIED", "CONDITIONAL", "CONSULTATION_REQUIRED", "INCOMPATIBLE", "NO_DATA"]);
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 2_000_000;
const maxTotalImageBytes = 4_000_000;

function field(formData: FormData, name: string, maxLength: number) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function serializeProduct(product: typeof products.$inferSelect, images: Array<typeof productImages.$inferSelect>, vehicleFitments: ProductVehicleFitmentSummary[] = []) {
  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    category: product.category,
    material: product.material,
    price: product.price,
    status: product.status,
    stockType: product.stockType,
    fitmentStatus: product.fitmentStatus,
    isUniversalFitment: product.isUniversalFitment,
    summary: product.summary,
    description: product.description,
    specifications: product.specifications,
    optionGroups: product.optionGroups,
    vehicleFitments,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    images: images.map((image) => ({
      id: image.id,
      fileName: image.fileName,
      mimeType: image.mimeType,
      byteSize: image.byteSize,
      altText: image.altText,
      sortOrder: image.sortOrder,
      url: `/api/products/images/${image.id}`,
    })),
  };
}

export async function GET(request: Request) {
  const publicCatalog = new URL(request.url).searchParams.get("scope") === "public";
  if (!publicCatalog && !isAdminRequest(request)) {
    return Response.json({ error: "운영자 로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const db = getDb();
    const query = db
      .select({ product: products, image: productImages })
      .from(products)
      .leftJoin(productImages, eq(productImages.productId, products.id));
    const rows = publicCatalog
      ? await query.where(eq(products.status, "PUBLISHED")).orderBy(desc(products.createdAt), productImages.sortOrder)
      : await query.orderBy(desc(products.createdAt), productImages.sortOrder);
    const grouped = new Map<string, { product: typeof products.$inferSelect; images: Array<typeof productImages.$inferSelect> }>();
    for (const row of rows) {
      const entry = grouped.get(row.product.id) ?? { product: row.product, images: [] };
      if (row.image) entry.images.push(row.image);
      grouped.set(row.product.id, entry);
    }
    const productIds = Array.from(grouped.keys());
    const vehicleFitments = await productVehicleFitmentsByProductIds(productIds, publicCatalog);
    const items = Array.from(grouped.values()).map(({ product, images }) => serializeProduct(product, images, vehicleFitments.get(product.id) ?? []));
    return Response.json(
      { products: items, total: items.length },
      { headers: { "cache-control": "no-store, max-age=0" } },
    );
  } catch {
    return Response.json({ error: "상품 목록을 불러오지 못했습니다." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "운영자 로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const sku = field(formData, "sku", 80).toUpperCase();
    const slug = field(formData, "slug", 160).toLowerCase();
    const name = field(formData, "name", 300);
    const category = field(formData, "category", 80);
    const material = field(formData, "material", 200);
    const price = Number(field(formData, "price", 20));
    const status = field(formData, "status", 20);
    const stockType = field(formData, "stockType", 32);
    const fitmentStatus = field(formData, "fitmentStatus", 32);
    const isUniversalFitment = field(formData, "isUniversalFitment", 5) === "true";
    const summary = field(formData, "summary", 500);
    const description = field(formData, "description", 10_000);
    const imageAltText = field(formData, "imageAltText", 300) || name;
    const rawSpecifications = field(formData, "specifications", 20_000);
    let specifications: Array<{ label: string; value: string }> = [];
    let vehicleGenerationIds: string[] = [];
    let optionGroups: ProductOptionGroup[] = [];
    try {
      const parsed = JSON.parse(rawSpecifications) as unknown;
      if (Array.isArray(parsed)) {
        specifications = parsed
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const label = "label" in item && typeof item.label === "string" ? item.label.trim().slice(0, 100) : "";
            const value = "value" in item && typeof item.value === "string" ? item.value.trim().slice(0, 500) : "";
            return label && value ? { label, value } : null;
          })
          .filter((item): item is { label: string; value: string } => item !== null)
          .slice(0, 30);
      }
      vehicleGenerationIds = parseVehicleGenerationIds(field(formData, "vehicleGenerationIds", 10_000));
      optionGroups = parseProductOptionGroups(field(formData, "optionGroups", 30_000) || "[]");
    } catch {
      return Response.json({ error: "제품 사양 또는 적용 차량 정보 형식이 올바르지 않습니다." }, { status: 422 });
    }
    const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);

    if (
      sku.length < 3 ||
      !/^[A-Z0-9][A-Z0-9._-]+$/.test(sku) ||
      !/^[a-z0-9][a-z0-9-]+$/.test(slug) ||
      name.length < 3 ||
      !category ||
      !material ||
      !Number.isSafeInteger(price) ||
      price < 0 ||
      price > 2_000_000_000 ||
      !allowedStatuses.has(status) ||
      !allowedStockTypes.has(stockType) ||
      !allowedFitments.has(fitmentStatus)
    ) {
      return Response.json({ error: "SKU, URL 슬러그, 상품명, 카테고리, 재질, 판매가를 정확히 입력해 주세요." }, { status: 422 });
    }
    if (!summary || !description) {
      return Response.json({ error: "한 줄 요약과 상세 설명을 입력해 주세요." }, { status: 422 });
    }
    if (specifications.length === 0) {
      return Response.json({ error: "항목과 값이 모두 입력된 제품 사양을 하나 이상 등록해 주세요." }, { status: 422 });
    }
    if (!isUniversalFitment && vehicleGenerationIds.length === 0) {
      return Response.json({ error: "적용 차량을 한 대 이상 선택해 주세요." }, { status: 422 });
    }
    const existingGenerationIds = isUniversalFitment ? new Set<string>() : await existingVehicleGenerationIds(vehicleGenerationIds);
    if (!isUniversalFitment && existingGenerationIds.size !== vehicleGenerationIds.length) {
      return Response.json({ error: "차량 마스터에 없는 세대 정보가 포함되어 있습니다. 다시 선택해 주세요." }, { status: 422 });
    }
    if (files.length === 0 || files.length > 4) {
      return Response.json({ error: "상품 이미지를 1장 이상 4장 이하로 등록해 주세요." }, { status: 422 });
    }
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > maxTotalImageBytes || files.some((file) => file.size > maxImageBytes || !allowedImageTypes.has(file.type))) {
      return Response.json({ error: "이미지는 JPG, PNG, WebP만 가능하며 장당 2MB, 전체 4MB 이하여야 합니다." }, { status: 413 });
    }

    const encodedImages = await Promise.all(files.map(async (file, index) => ({
      fileName: file.name.slice(0, 255),
      mimeType: file.type,
      byteSize: file.size,
      imageBase64: Buffer.from(await file.arrayBuffer()).toString("base64"),
      altText: index === 0 ? imageAltText : `${imageAltText} ${index + 1}`,
      sortOrder: index,
    })));
    const db = getDb();
    const created = await db.transaction(async (tx) => {
      const [product] = await tx.insert(products).values({
        sku,
        slug,
        name,
        category,
        material,
        price,
        status,
        stockType,
        fitmentStatus,
        isUniversalFitment,
        summary,
        description,
        specifications,
        optionGroups,
      }).returning();
      const images = await tx.insert(productImages).values(encodedImages.map((image) => ({ ...image, productId: product.id }))).returning();
      if (!isUniversalFitment) {
        await tx.insert(productVehicleFitments).values(vehicleGenerationIds.map((vehicleGenerationId) => ({ productId: product.id, vehicleGenerationId })));
      }
      await tx.insert(auditLogs).values({
        action: "PRODUCT_CREATED",
        targetType: "PRODUCT",
        targetId: product.id,
        reason: "운영자 상품 등록",
        diff: { sku, slug, status, price, imageCount: images.length, optionGroupCount: optionGroups.length, isUniversalFitment, vehicleGenerationIds: isUniversalFitment ? [] : vehicleGenerationIds },
      });
      return { product, images };
    });
    const vehicleFitments = await productVehicleFitmentsByProductIds([created.product.id]);
    return Response.json({ product: serializeProduct(created.product, created.images, vehicleFitments.get(created.product.id) ?? []) }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return Response.json({ error: "이미 사용 중인 SKU 또는 URL 슬러그입니다." }, { status: 409 });
    }
    return Response.json({ error: "상품을 저장하지 못했습니다." }, { status: 503 });
  }
}
