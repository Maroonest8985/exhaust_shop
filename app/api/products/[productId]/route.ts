import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { auditLogs, productImages, products, productVehicleFitments } from "../../../../db/schema";
import { isAdminRequest } from "../../../../lib/admin-auth";
import { existingVehicleGenerationIds, parseVehicleGenerationIds, productVehicleFitmentsByProductIds, type ProductVehicleFitmentSummary } from "../../../../lib/product-vehicle-fitments";

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

function validProductId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseSpecifications(value: string) {
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const label = "label" in item && typeof item.label === "string" ? item.label.trim().slice(0, 100) : "";
      const specificationValue = "value" in item && typeof item.value === "string" ? item.value.trim().slice(0, 500) : "";
      return label && specificationValue ? { label, value: specificationValue } : null;
    })
    .filter((item): item is { label: string; value: string } => item !== null)
    .slice(0, 30);
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

async function findProduct(productId: string) {
  const db = getDb();
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return null;
  const images = await db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder));
  const vehicleFitments = await productVehicleFitmentsByProductIds([product.id]);
  return { product, images, vehicleFitments: vehicleFitments.get(product.id) ?? [] };
}

export async function GET(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "운영자 로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const { productId } = await params;
    if (!validProductId(productId)) return Response.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
    const result = await findProduct(productId);
    if (!result) return Response.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    return Response.json(
      { product: serializeProduct(result.product, result.images, result.vehicleFitments) },
      { headers: { "cache-control": "no-store, max-age=0" } },
    );
  } catch {
    return Response.json({ error: "상품 정보를 불러오지 못했습니다." }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "운영자 로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const { productId } = await params;
    if (!validProductId(productId)) return Response.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
    const existing = await findProduct(productId);
    if (!existing) return Response.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });

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
    let specifications: Array<{ label: string; value: string }> = [];
    let retainedImageIds: string[] = [];
    let vehicleGenerationIds: string[] = [];
    try {
      specifications = parseSpecifications(field(formData, "specifications", 20_000));
      const parsedImageIds = JSON.parse(field(formData, "retainedImageIds", 10_000)) as unknown;
      retainedImageIds = Array.isArray(parsedImageIds)
        ? parsedImageIds.filter((value): value is string => typeof value === "string")
        : [];
      vehicleGenerationIds = parseVehicleGenerationIds(field(formData, "vehicleGenerationIds", 10_000));
    } catch {
      return Response.json({ error: "제품 사양, 이미지 또는 적용 차량 정보 형식이 올바르지 않습니다." }, { status: 422 });
    }

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
    if (!summary || !description) return Response.json({ error: "한 줄 요약과 상세 설명을 입력해 주세요." }, { status: 422 });
    if (specifications.length === 0) return Response.json({ error: "항목과 값이 모두 입력된 제품 사양을 하나 이상 등록해 주세요." }, { status: 422 });
    if (!isUniversalFitment && vehicleGenerationIds.length === 0) return Response.json({ error: "적용 차량을 한 대 이상 선택해 주세요." }, { status: 422 });
    const existingGenerationIds = isUniversalFitment ? new Set<string>() : await existingVehicleGenerationIds(vehicleGenerationIds);
    if (!isUniversalFitment && existingGenerationIds.size !== vehicleGenerationIds.length) {
      return Response.json({ error: "차량 마스터에 없는 세대 정보가 포함되어 있습니다. 다시 선택해 주세요." }, { status: 422 });
    }

    const retainedSet = new Set(retainedImageIds);
    const retainedImages = existing.images.filter((image) => retainedSet.has(image.id));
    const removedImageIds = existing.images.filter((image) => !retainedSet.has(image.id)).map((image) => image.id);
    const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    if (retainedImages.length + files.length < 1 || retainedImages.length + files.length > 4) {
      return Response.json({ error: "기존 이미지와 새 이미지를 합쳐 1장 이상 4장 이하로 유지해 주세요." }, { status: 422 });
    }
    const totalBytes = retainedImages.reduce((sum, image) => sum + image.byteSize, 0) + files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > maxTotalImageBytes || files.some((file) => file.size > maxImageBytes || !allowedImageTypes.has(file.type))) {
      return Response.json({ error: "이미지는 JPG, PNG, WebP만 가능하며 장당 2MB, 전체 4MB 이하여야 합니다." }, { status: 413 });
    }

    const encodedImages = await Promise.all(files.map(async (file, index) => ({
      fileName: file.name.slice(0, 255),
      mimeType: file.type,
      byteSize: file.size,
      imageBase64: Buffer.from(await file.arrayBuffer()).toString("base64"),
      altText: retainedImages.length + index === 0 ? imageAltText : `${imageAltText} ${retainedImages.length + index + 1}`,
      sortOrder: retainedImages.length + index,
    })));

    const db = getDb();
    await db.transaction(async (tx) => {
      await tx.update(products).set({
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
        updatedAt: new Date(),
      }).where(eq(products.id, productId));
      if (removedImageIds.length > 0) {
        await tx.delete(productImages).where(and(eq(productImages.productId, productId), inArray(productImages.id, removedImageIds)));
      }
      for (const [index, image] of retainedImages.entries()) {
        await tx.update(productImages).set({
          sortOrder: index,
          altText: index === 0 ? imageAltText : `${imageAltText} ${index + 1}`,
        }).where(and(eq(productImages.id, image.id), eq(productImages.productId, productId)));
      }
      if (encodedImages.length > 0) {
        await tx.insert(productImages).values(encodedImages.map((image) => ({ ...image, productId })));
      }
      await tx.delete(productVehicleFitments).where(eq(productVehicleFitments.productId, productId));
      if (!isUniversalFitment) {
        await tx.insert(productVehicleFitments).values(vehicleGenerationIds.map((vehicleGenerationId) => ({ productId, vehicleGenerationId })));
      }
      await tx.insert(auditLogs).values({
        action: "PRODUCT_UPDATED",
        targetType: "PRODUCT",
        targetId: productId,
        reason: existing.product.status !== status ? `상품 상태 변경: ${existing.product.status} → ${status}` : "운영자 상품 정보 수정",
        diff: {
          before: { sku: existing.product.sku, slug: existing.product.slug, status: existing.product.status, price: existing.product.price, imageCount: existing.images.length, isUniversalFitment: existing.product.isUniversalFitment, vehicleGenerationIds: existing.vehicleFitments.map((fitment) => fitment.vehicleGenerationId) },
          after: { sku, slug, status, price, imageCount: retainedImages.length + encodedImages.length, isUniversalFitment, vehicleGenerationIds: isUniversalFitment ? [] : vehicleGenerationIds },
        },
      });
    });

    const updated = await findProduct(productId);
    if (!updated) return Response.json({ error: "수정한 상품을 다시 불러오지 못했습니다." }, { status: 503 });
    return Response.json({ product: serializeProduct(updated.product, updated.images, updated.vehicleFitments) });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return Response.json({ error: "이미 사용 중인 SKU 또는 URL 슬러그입니다." }, { status: 409 });
    }
    return Response.json({ error: "상품을 수정하지 못했습니다." }, { status: 503 });
  }
}
