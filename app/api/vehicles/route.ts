import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLogs, vehicleGenerations, vehicleMakes, vehicleModels } from "../../../db/schema";
import { isAdminRequest } from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VehicleEntityType = "MAKE" | "MODEL" | "GENERATION";
type JsonRecord = Record<string, unknown>;

const entityTypes = new Set<VehicleEntityType>(["MAKE", "MODEL", "GENERATION"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isEntityType(value: unknown): value is VehicleEntityType {
  return typeof value === "string" && entityTypes.has(value as VehicleEntityType);
}

function requiredName(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

function requiredId(value: unknown) {
  return typeof value === "string" && uuidPattern.test(value) ? value : "";
}

function normalizedList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 120))
    .filter(Boolean)))
    .slice(0, 50);
}

function normalizedSortOrder(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 10_000 ? number : 0;
}

function normalizedActive(value: unknown) {
  return typeof value === "boolean" ? value : true;
}

function databaseError(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "code" in error && error.code === "23505") {
    return Response.json({ error: "같은 상위 항목에 동일한 이름이 이미 등록되어 있습니다." }, { status: 409 });
  }
  return Response.json({ error: fallback }, { status: 503 });
}

async function vehicleTree(includeInactive: boolean) {
  const db = getDb();
  const makeRows = includeInactive
    ? await db.select().from(vehicleMakes).orderBy(asc(vehicleMakes.sortOrder), asc(vehicleMakes.name))
    : await db.select().from(vehicleMakes).where(eq(vehicleMakes.isActive, true)).orderBy(asc(vehicleMakes.sortOrder), asc(vehicleMakes.name));
  const modelRows = includeInactive
    ? await db.select().from(vehicleModels).orderBy(asc(vehicleModels.sortOrder), asc(vehicleModels.name))
    : await db.select().from(vehicleModels).where(eq(vehicleModels.isActive, true)).orderBy(asc(vehicleModels.sortOrder), asc(vehicleModels.name));
  const generationRows = includeInactive
    ? await db.select().from(vehicleGenerations).orderBy(asc(vehicleGenerations.sortOrder), asc(vehicleGenerations.name))
    : await db.select().from(vehicleGenerations).where(eq(vehicleGenerations.isActive, true)).orderBy(asc(vehicleGenerations.sortOrder), asc(vehicleGenerations.name));

  const generationsByModel = new Map<string, typeof generationRows>();
  for (const generation of generationRows) {
    const list = generationsByModel.get(generation.modelId) ?? [];
    list.push(generation);
    generationsByModel.set(generation.modelId, list);
  }
  const modelsByMake = new Map<string, Array<(typeof modelRows)[number] & { generations: typeof generationRows }>>();
  for (const model of modelRows) {
    const list = modelsByMake.get(model.makeId) ?? [];
    list.push({ ...model, generations: generationsByModel.get(model.id) ?? [] });
    modelsByMake.set(model.makeId, list);
  }
  return makeRows.map((make) => ({ ...make, models: modelsByMake.get(make.id) ?? [] }));
}

export async function GET(request: Request) {
  const adminScope = new URL(request.url).searchParams.get("scope") === "admin";
  if (adminScope && !isAdminRequest(request)) {
    return Response.json({ error: "운영자 로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const vehicles = await vehicleTree(adminScope);
    return Response.json(
      { vehicles, total: vehicles.length },
      { headers: { "cache-control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return databaseError(error, "차량 정보를 불러오지 못했습니다.");
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "운영자 로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const body = await request.json() as JsonRecord;
    const entityType = body.entityType;
    const name = requiredName(body.name);
    if (!isEntityType(entityType) || !name) {
      return Response.json({ error: "추가할 항목과 이름을 입력해 주세요." }, { status: 422 });
    }
    const sortOrder = normalizedSortOrder(body.sortOrder);
    const isActive = normalizedActive(body.isActive);
    const db = getDb();

    if (entityType === "MAKE") {
      const created = await db.transaction(async (tx) => {
        const [make] = await tx.insert(vehicleMakes).values({ name, sortOrder, isActive }).returning();
        await tx.insert(auditLogs).values({
          action: "VEHICLE_MAKE_CREATED",
          targetType: "VEHICLE_MAKE",
          targetId: make.id,
          reason: "운영자 차량 제조사 추가",
          diff: { name, sortOrder, isActive },
        });
        return make;
      });
      return Response.json({ vehicle: created }, { status: 201 });
    }

    if (entityType === "MODEL") {
      const makeId = requiredId(body.parentId);
      if (!makeId) return Response.json({ error: "제조사를 선택해 주세요." }, { status: 422 });
      const [parent] = await db.select({ id: vehicleMakes.id }).from(vehicleMakes).where(eq(vehicleMakes.id, makeId)).limit(1);
      if (!parent) return Response.json({ error: "선택한 제조사를 찾을 수 없습니다." }, { status: 404 });
      const created = await db.transaction(async (tx) => {
        const [model] = await tx.insert(vehicleModels).values({ makeId, name, sortOrder, isActive }).returning();
        await tx.insert(auditLogs).values({
          action: "VEHICLE_MODEL_CREATED",
          targetType: "VEHICLE_MODEL",
          targetId: model.id,
          reason: "운영자 차량 모델 추가",
          diff: { makeId, name, sortOrder, isActive },
        });
        return model;
      });
      return Response.json({ vehicle: created }, { status: 201 });
    }

    const modelId = requiredId(body.parentId);
    if (!modelId) return Response.json({ error: "모델을 선택해 주세요." }, { status: 422 });
    const [parent] = await db.select({ id: vehicleModels.id }).from(vehicleModels).where(eq(vehicleModels.id, modelId)).limit(1);
    if (!parent) return Response.json({ error: "선택한 모델을 찾을 수 없습니다." }, { status: 404 });
    const years = normalizedList(body.years);
    const engines = normalizedList(body.engines);
    const specifications = normalizedList(body.specifications);
    const created = await db.transaction(async (tx) => {
      const [generation] = await tx.insert(vehicleGenerations).values({
        modelId,
        name,
        years,
        engines,
        specifications,
        sortOrder,
        isActive,
      }).returning();
      await tx.insert(auditLogs).values({
        action: "VEHICLE_GENERATION_CREATED",
        targetType: "VEHICLE_GENERATION",
        targetId: generation.id,
        reason: "운영자 차량 세대 추가",
        diff: { modelId, name, years, engines, specifications, sortOrder, isActive },
      });
      return generation;
    });
    return Response.json({ vehicle: created }, { status: 201 });
  } catch (error) {
    return databaseError(error, "차량 정보를 추가하지 못했습니다.");
  }
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "운영자 로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const body = await request.json() as JsonRecord;
    const entityType = body.entityType;
    const id = requiredId(body.id);
    const name = requiredName(body.name);
    if (!isEntityType(entityType) || !id || !name) {
      return Response.json({ error: "수정할 항목과 이름을 확인해 주세요." }, { status: 422 });
    }
    const sortOrder = normalizedSortOrder(body.sortOrder);
    const isActive = normalizedActive(body.isActive);
    const db = getDb();

    if (entityType === "MAKE") {
      const [existing] = await db.select().from(vehicleMakes).where(eq(vehicleMakes.id, id)).limit(1);
      if (!existing) return Response.json({ error: "제조사를 찾을 수 없습니다." }, { status: 404 });
      const [updated] = await db.update(vehicleMakes).set({ name, sortOrder, isActive, updatedAt: new Date() }).where(eq(vehicleMakes.id, id)).returning();
      await db.insert(auditLogs).values({
        action: "VEHICLE_MAKE_UPDATED",
        targetType: "VEHICLE_MAKE",
        targetId: id,
        reason: "운영자 차량 제조사 수정",
        diff: { before: existing, after: updated },
      });
      return Response.json({ vehicle: updated });
    }

    if (entityType === "MODEL") {
      const makeId = requiredId(body.parentId);
      if (!makeId) return Response.json({ error: "제조사를 선택해 주세요." }, { status: 422 });
      const [[existing], [parent]] = await Promise.all([
        db.select().from(vehicleModels).where(eq(vehicleModels.id, id)).limit(1),
        db.select({ id: vehicleMakes.id }).from(vehicleMakes).where(eq(vehicleMakes.id, makeId)).limit(1),
      ]);
      if (!existing) return Response.json({ error: "모델을 찾을 수 없습니다." }, { status: 404 });
      if (!parent) return Response.json({ error: "선택한 제조사를 찾을 수 없습니다." }, { status: 404 });
      const [updated] = await db.update(vehicleModels).set({ makeId, name, sortOrder, isActive, updatedAt: new Date() }).where(eq(vehicleModels.id, id)).returning();
      await db.insert(auditLogs).values({
        action: "VEHICLE_MODEL_UPDATED",
        targetType: "VEHICLE_MODEL",
        targetId: id,
        reason: "운영자 차량 모델 수정",
        diff: { before: existing, after: updated },
      });
      return Response.json({ vehicle: updated });
    }

    const modelId = requiredId(body.parentId);
    if (!modelId) return Response.json({ error: "모델을 선택해 주세요." }, { status: 422 });
    const [[existing], [parent]] = await Promise.all([
      db.select().from(vehicleGenerations).where(eq(vehicleGenerations.id, id)).limit(1),
      db.select({ id: vehicleModels.id }).from(vehicleModels).where(eq(vehicleModels.id, modelId)).limit(1),
    ]);
    if (!existing) return Response.json({ error: "세대를 찾을 수 없습니다." }, { status: 404 });
    if (!parent) return Response.json({ error: "선택한 모델을 찾을 수 없습니다." }, { status: 404 });
    const years = normalizedList(body.years);
    const engines = normalizedList(body.engines);
    const specifications = normalizedList(body.specifications);
    const [updated] = await db.update(vehicleGenerations).set({
      modelId,
      name,
      years,
      engines,
      specifications,
      sortOrder,
      isActive,
      updatedAt: new Date(),
    }).where(eq(vehicleGenerations.id, id)).returning();
    await db.insert(auditLogs).values({
      action: "VEHICLE_GENERATION_UPDATED",
      targetType: "VEHICLE_GENERATION",
      targetId: id,
      reason: "운영자 차량 세대 수정",
      diff: { before: existing, after: updated },
    });
    return Response.json({ vehicle: updated });
  } catch (error) {
    return databaseError(error, "차량 정보를 수정하지 못했습니다.");
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "운영자 로그인이 필요합니다." }, { status: 401 });
  }
  try {
    const body = await request.json() as JsonRecord;
    const entityType = body.entityType;
    const id = requiredId(body.id);
    if (!isEntityType(entityType) || !id) {
      return Response.json({ error: "삭제할 차량 항목을 확인해 주세요." }, { status: 422 });
    }
    const db = getDb();
    const config = entityType === "MAKE"
      ? { table: vehicleMakes, idColumn: vehicleMakes.id, targetType: "VEHICLE_MAKE" }
      : entityType === "MODEL"
        ? { table: vehicleModels, idColumn: vehicleModels.id, targetType: "VEHICLE_MODEL" }
        : { table: vehicleGenerations, idColumn: vehicleGenerations.id, targetType: "VEHICLE_GENERATION" };
    const [existing] = await db.select().from(config.table).where(eq(config.idColumn, id)).limit(1);
    if (!existing) return Response.json({ error: "삭제할 차량 항목을 찾을 수 없습니다." }, { status: 404 });
    await db.transaction(async (tx) => {
      await tx.delete(config.table).where(eq(config.idColumn, id));
      await tx.insert(auditLogs).values({
        action: `VEHICLE_${entityType}_DELETED`,
        targetType: config.targetType,
        targetId: id,
        reason: "운영자 차량 정보 삭제",
        diff: { deleted: existing },
      });
    });
    return Response.json({ ok: true });
  } catch (error) {
    return databaseError(error, "차량 정보를 삭제하지 못했습니다.");
  }
}
