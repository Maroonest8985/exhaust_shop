import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let initialization: Promise<unknown> | null = null;

export async function getDb() {
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }

  initialization ??= env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS commerce_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      kind TEXT NOT NULL,
      payload TEXT NOT NULL,
      actor_id TEXT,
      actor_email TEXT,
      status TEXT DEFAULT 'RECEIVED' NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_commerce_events_kind_created ON commerce_events(kind, created_at)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_commerce_events_actor ON commerce_events(actor_id)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      reason TEXT,
      diff TEXT DEFAULT '{}' NOT NULL,
      actor_id TEXT,
      actor_email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at)"),
  ]);

  await initialization;
  return drizzle(env.DB, { schema });
}
