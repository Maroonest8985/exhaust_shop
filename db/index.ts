import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let initialization: Promise<unknown> | null = null;

export async function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured. Connect a Neon database in Vercel Marketplace.");
  }

  const sql = neon(databaseUrl);
  initialization ??= Promise.all([
    sql`CREATE TABLE IF NOT EXISTS commerce_events (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL,
      payload JSONB NOT NULL,
      actor_id TEXT,
      actor_email TEXT,
      status TEXT DEFAULT 'RECEIVED' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`,
    sql`CREATE INDEX IF NOT EXISTS idx_commerce_events_kind_created ON commerce_events(kind, created_at)`,
    sql`CREATE INDEX IF NOT EXISTS idx_commerce_events_actor ON commerce_events(actor_id)`,
    sql`CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      reason TEXT,
      diff JSONB DEFAULT '{}'::jsonb NOT NULL,
      actor_id TEXT,
      actor_email TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`,
    sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at)`,
  ]);

  await initialization;
  return drizzle(sql, { schema });
}
