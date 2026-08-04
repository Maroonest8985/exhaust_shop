import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { productVehicleFitments, vehicleGenerations, vehicleMakes, vehicleModels } from "../db/schema";

export type ProductVehicleFitmentSummary = {
  vehicleGenerationId: string;
  maker: string;
  model: string;
  generation: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseVehicleGenerationIds(value: string) {
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string" || !uuidPattern.test(item))) {
    throw new Error("Invalid vehicle generation IDs");
  }
  return Array.from(new Set(parsed)).slice(0, 100);
}

export async function existingVehicleGenerationIds(ids: string[]) {
  if (ids.length === 0) return new Set<string>();
  const db = getDb();
  const rows = await db.select({ id: vehicleGenerations.id }).from(vehicleGenerations).where(inArray(vehicleGenerations.id, ids));
  return new Set(rows.map((row) => row.id));
}

export async function productVehicleFitmentsByProductIds(productIds: string[], activeOnly = false) {
  const result = new Map<string, ProductVehicleFitmentSummary[]>();
  if (productIds.length === 0) return result;
  const db = getDb();
  const conditions = [inArray(productVehicleFitments.productId, productIds)];
  if (activeOnly) {
    conditions.push(
      eq(vehicleMakes.isActive, true),
      eq(vehicleModels.isActive, true),
      eq(vehicleGenerations.isActive, true),
    );
  }
  const rows = await db
    .select({
      productId: productVehicleFitments.productId,
      vehicleGenerationId: vehicleGenerations.id,
      maker: vehicleMakes.name,
      model: vehicleModels.name,
      generation: vehicleGenerations.name,
    })
    .from(productVehicleFitments)
    .innerJoin(vehicleGenerations, eq(productVehicleFitments.vehicleGenerationId, vehicleGenerations.id))
    .innerJoin(vehicleModels, eq(vehicleGenerations.modelId, vehicleModels.id))
    .innerJoin(vehicleMakes, eq(vehicleModels.makeId, vehicleMakes.id))
    .where(and(...conditions))
    .orderBy(
      asc(vehicleMakes.sortOrder),
      asc(vehicleMakes.name),
      asc(vehicleModels.sortOrder),
      asc(vehicleModels.name),
      asc(vehicleGenerations.sortOrder),
      asc(vehicleGenerations.name),
    );
  for (const row of rows) {
    const fitments = result.get(row.productId) ?? [];
    fitments.push({
      vehicleGenerationId: row.vehicleGenerationId,
      maker: row.maker,
      model: row.model,
      generation: row.generation,
    });
    result.set(row.productId, fitments);
  }
  return result;
}
