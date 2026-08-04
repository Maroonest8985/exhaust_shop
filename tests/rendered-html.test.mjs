import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("replaces the starter with the product-specific storefront", async () => {
  const [page, app, layout, css, packageJson] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/taibosi-app.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);

  assert.match(page, /TaibosiApp/);
  assert.match(app, /내 차에 맞는/);
  assert.match(app, /적용 차량/);
  assert.match(app, /AdminDashboard/);
  assert.match(app, /storedVehiclesToCatalog/);
  assert.match(app, /vehicleModels/);
  assert.match(app, /vehicleGenerations/);
  assert.match(app, /\/api\/vehicles/);
  assert.match(app, /VehicleMasterModule/);
  assert.match(app, /차량 마스터를 불러오는 중/);
  assert.match(app, /사이트 노출 세대/);
  assert.match(app, /compatibleVehicles/);
  assert.match(app, /vehicleUrl\(finderSelection\)/);
  assert.match(app, /storedProductToCatalogProduct/);
  assert.match(app, /ProductVehicleFitmentEditor/);
  assert.match(app, /전 차종 적용/);
  assert.match(app, /isUniversalFitment/);
  assert.match(app, /DatabaseProductDetailPage/);
  assert.match(app, /ProductDetailAdminModule/);
  assert.match(app, /상품 상세·수정/);
  assert.match(app, /수정하고 공개/);
  assert.match(app, /retainedImageIds/);
  assert.match(app, /\/api\/products\?scope=public/);
  assert.match(app, /ProductCatalogLoading/);
  assert.match(app, /databaseProducts === null/);
  assert.match(app, /galleryImages\.map/);
  assert.match(app, /onClick=\{previousImage\}/);
  assert.match(app, /onClick=\{nextImage\}/);
  assert.match(app, /taibosi_cart_v1/);
  assert.match(app, /window\.localStorage\.setItem/);
  assert.match(app, /readStoredCart/);
  assert.match(app, /removeCartItem/);
  assert.match(app, /\/api\/inquiries/);
  assert.match(app, /PostgreSQL 실시간 문의/);
  assert.doesNotMatch(app, /\[product\.image, garageImage, redBmwImage\]/);
  assert.doesNotMatch(app, /catalogProducts = \[\.\.\.databaseCatalogProducts/);
  assert.match(app, /slugEdited/);
  assert.match(app, /다음 항목을 확인해 주세요/);
  assert.doesNotMatch(app, /summary\.trim\(\)\.length < 10|description\.trim\(\)\.length < 20/);
  assert.match(app, /AdminTopbar showToast/);
  assert.match(app, /method: "DELETE"/);
  assert.match(app, /로그아웃/);
  assert.match(layout, /Taibosi Exhaust Korea/);
  assert.match(css, /--red:\s*#d93a2f/i);
  assert.match(css, /catalog-progress-move/);
  assert.match(css, /catalog-skeleton-grid/);
  assert.doesNotMatch(`${page}${layout}${packageJson}`, /codex-preview|react-loading-skeleton|Starter Project/);
  await assert.rejects(access(new URL("app/_sites-preview/SkeletonPreview.tsx", root)));
});

test("defines catch-all customer and admin routes plus persistent actions", async () => {
  const [catchAll, actions, ordersApi, productsApi, productDetailApi, inquiriesApi, vehiclesApi, productFitmentLibrary, adminSessionApi, adminAuth, database, migration, orderMigration, productMigration, inquiryMigration, vehicleMigration, productFitmentMigration, universalFitmentMigration, vercel, packageJson] = await Promise.all([
    readFile(new URL("app/[...path]/page.tsx", root), "utf8"),
    readFile(new URL("app/api/actions/route.ts", root), "utf8"),
    readFile(new URL("app/api/orders/route.ts", root), "utf8"),
    readFile(new URL("app/api/products/route.ts", root), "utf8"),
    readFile(new URL("app/api/products/[productId]/route.ts", root), "utf8"),
    readFile(new URL("app/api/inquiries/route.ts", root), "utf8"),
    readFile(new URL("app/api/vehicles/route.ts", root), "utf8"),
    readFile(new URL("lib/product-vehicle-fitments.ts", root), "utf8"),
    readFile(new URL("app/api/admin/session/route.ts", root), "utf8"),
    readFile(new URL("lib/admin-auth.ts", root), "utf8"),
    readFile(new URL("db/index.ts", root), "utf8"),
    readFile(new URL("drizzle/0000_sour_chronomancer.sql", root), "utf8"),
    readFile(new URL("drizzle/0001_warm_rage.sql", root), "utf8"),
    readFile(new URL("drizzle/0002_mature_fixer.sql", root), "utf8"),
    readFile(new URL("drizzle/0003_sweet_gressill.sql", root), "utf8"),
    readFile(new URL("drizzle/0004_hesitant_union_jack.sql", root), "utf8"),
    readFile(new URL("drizzle/0005_premium_doctor_strange.sql", root), "utf8"),
    readFile(new URL("drizzle/0006_quiet_wolf_cub.sql", root), "utf8"),
    readFile(new URL("vercel.json", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);
  assert.match(catchAll, /path\.join/);
  assert.match(catchAll, /searchParams/);
  assert.match(catchAll, /vehicleQuery/);
  assert.match(actions, /commerceEvents/);
  assert.match(actions, /auditLogs/);
  assert.match(ordersApi, /idempotencyKey/);
  assert.match(ordersApi, /orderStatusHistory/);
  assert.match(ordersApi, /db\.transaction/);
  assert.match(ordersApi, /productTable/);
  assert.match(ordersApi, /body\.items/);
  assert.match(ordersApi, /product\.status !== "PUBLISHED"/);
  assert.match(productsApi, /request\.formData/);
  assert.match(productsApi, /productImages/);
  assert.match(productsApi, /PRODUCT_CREATED/);
  assert.match(productsApi, /publicCatalog/);
  assert.match(productsApi, /products\.status, "PUBLISHED"/);
  assert.match(productsApi, /productVehicleFitments/);
  assert.match(productsApi, /vehicleGenerationIds/);
  assert.match(productsApi, /isUniversalFitment/);
  assert.match(productDetailApi, /export async function PATCH/);
  assert.match(productDetailApi, /PRODUCT_UPDATED/);
  assert.match(productDetailApi, /retainedImageIds/);
  assert.match(productDetailApi, /updatedAt: new Date\(\)/);
  assert.match(productDetailApi, /productVehicleFitments/);
  assert.match(productDetailApi, /isUniversalFitment/);
  assert.match(inquiriesApi, /supportInquiries/);
  assert.match(inquiriesApi, /isAdminRequest/);
  assert.match(inquiriesApi, /INQUIRY_CREATED/);
  assert.match(vehiclesApi, /vehicleMakes/);
  assert.match(vehiclesApi, /vehicleModels/);
  assert.match(vehiclesApi, /vehicleGenerations/);
  assert.match(vehiclesApi, /VEHICLE_GENERATION_CREATED/);
  assert.match(vehiclesApi, /export async function DELETE/);
  assert.match(vehiclesApi, /isAdminRequest/);
  assert.match(productFitmentLibrary, /productVehicleFitmentsByProductIds/);
  assert.match(productFitmentLibrary, /parseVehicleGenerationIds/);
  assert.match(adminSessionApi, /adminAuthConfigurationError/);
  assert.match(adminSessionApi, /no-store/);
  assert.match(adminAuth, /LOCAL_ADMIN_EMAIL/);
  assert.match(adminAuth, /LOCAL_ADMIN_PASSWORD/);
  assert.match(adminAuth, /LOCAL_ADMIN_SESSION_SECRET/);
  assert.match(database, /process\.env\.DATABASE_URL/);
  assert.match(database, /drizzle-orm\/postgres-js/);
  assert.match(migration, /CREATE TABLE "commerce_events"/);
  assert.match(migration, /CREATE TABLE "audit_logs"/);
  assert.match(orderMigration, /CREATE TABLE "orders"/);
  assert.match(orderMigration, /CREATE TABLE "order_items"/);
  assert.match(orderMigration, /CREATE TABLE "order_status_history"/);
  assert.match(productMigration, /CREATE TABLE "products"/);
  assert.match(productMigration, /CREATE TABLE "product_images"/);
  assert.match(inquiryMigration, /CREATE TABLE "support_inquiries"/);
  assert.match(vehicleMigration, /CREATE TABLE "vehicle_makes"/);
  assert.match(vehicleMigration, /CREATE TABLE "vehicle_models"/);
  assert.match(vehicleMigration, /CREATE TABLE "vehicle_generations"/);
  assert.match(vehicleMigration, /INSERT INTO "vehicle_makes"/);
  assert.match(productFitmentMigration, /CREATE TABLE "product_vehicle_fitments"/);
  assert.match(universalFitmentMigration, /is_universal_fitment/);
  assert.match(vercel, /"framework":\s*"nextjs"/);
  assert.match(packageJson, /"build":\s*"next build"/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|@cloudflare\/vite-plugin/);
  await assert.rejects(access(new URL(".openai/hosting.json", root)));
});
