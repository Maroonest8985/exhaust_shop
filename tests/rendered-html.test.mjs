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
  assert.match(app, /차량별 적합성 확인/);
  assert.match(app, /AdminDashboard/);
  assert.match(layout, /Taibosi Exhaust Korea/);
  assert.match(css, /--red:\s*#d93a2f/i);
  assert.doesNotMatch(`${page}${layout}${packageJson}`, /codex-preview|react-loading-skeleton|Starter Project/);
  await assert.rejects(access(new URL("app/_sites-preview/SkeletonPreview.tsx", root)));
});

test("defines catch-all customer and admin routes plus persistent actions", async () => {
  const [catchAll, actions, hosting, migration] = await Promise.all([
    readFile(new URL("app/[...path]/page.tsx", root), "utf8"),
    readFile(new URL("app/api/actions/route.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL("drizzle/0000_magenta_roulette.sql", root), "utf8"),
  ]);
  assert.match(catchAll, /path\.join/);
  assert.match(actions, /commerceEvents/);
  assert.match(actions, /auditLogs/);
  assert.match(hosting, /"d1":\s*"DB"/);
  assert.match(migration, /CREATE TABLE `commerce_events`/);
  assert.match(migration, /CREATE TABLE `audit_logs`/);
});
