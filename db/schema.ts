import { index, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const commerceEvents = pgTable(
  "commerce_events",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    actorId: text("actor_id"),
    actorEmail: text("actor_email"),
    status: text("status").notNull().default("RECEIVED"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_commerce_events_kind_created").on(table.kind, table.createdAt),
    index("idx_commerce_events_actor").on(table.actorId),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    reason: text("reason"),
    diff: jsonb("diff").$type<Record<string, unknown>>().notNull().default({}),
    actorId: text("actor_id"),
    actorEmail: text("actor_email"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_audit_logs_target").on(table.targetType, table.targetId),
    index("idx_audit_logs_created").on(table.createdAt),
  ],
);
