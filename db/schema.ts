import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const commerceEvents = sqliteTable(
  "commerce_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    kind: text("kind").notNull(),
    payload: text("payload").notNull(),
    actorId: text("actor_id"),
    actorEmail: text("actor_email"),
    status: text("status").notNull().default("RECEIVED"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_commerce_events_kind_created").on(table.kind, table.createdAt),
    index("idx_commerce_events_actor").on(table.actorId),
  ],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    reason: text("reason"),
    diff: text("diff").notNull().default("{}"),
    actorId: text("actor_id"),
    actorEmail: text("actor_email"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_audit_logs_target").on(table.targetType, table.targetId),
    index("idx_audit_logs_created").on(table.createdAt),
  ],
);
