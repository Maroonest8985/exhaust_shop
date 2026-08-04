import { index, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

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

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sku: varchar("sku", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: text("name").notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    material: varchar("material", { length: 200 }).notNull(),
    price: integer("price").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("DRAFT"),
    stockType: varchar("stock_type", { length: 32 }).notNull(),
    fitmentStatus: varchar("fitment_status", { length: 32 }).notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    specifications: jsonb("specifications").$type<Array<{ label: string; value: string }>>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_products_sku").on(table.sku),
    uniqueIndex("uq_products_slug").on(table.slug),
    index("idx_products_status_created").on(table.status, table.createdAt),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 80 }).notNull(),
    byteSize: integer("byte_size").notNull(),
    imageBase64: text("image_base64").notNull(),
    altText: varchar("alt_text", { length: 300 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_product_images_product_sort").on(table.productId, table.sortOrder)],
);

export const supportInquiries = pgTable(
  "support_inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inquiryNumber: varchar("inquiry_number", { length: 32 }).notNull(),
    type: varchar("type", { length: 40 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("RECEIVED"),
    customerName: varchar("customer_name", { length: 100 }).notNull(),
    customerEmail: varchar("customer_email", { length: 320 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 30 }).notNull(),
    subject: varchar("subject", { length: 300 }).notNull(),
    body: text("body").notNull(),
    productSku: varchar("product_sku", { length: 80 }),
    productName: text("product_name"),
    vehicleSnapshot: text("vehicle_snapshot"),
    sourcePath: varchar("source_path", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_support_inquiries_number").on(table.inquiryNumber),
    index("idx_support_inquiries_status_created").on(table.status, table.createdAt),
    index("idx_support_inquiries_customer_email").on(table.customerEmail),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: varchar("order_number", { length: 32 }).notNull(),
    idempotencyKey: uuid("idempotency_key").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("RECEIVED"),
    paymentStatus: varchar("payment_status", { length: 32 }).notNull().default("PENDING"),
    paymentMethod: varchar("payment_method", { length: 32 }).notNull(),
    fulfillmentMethod: varchar("fulfillment_method", { length: 32 }).notNull(),
    customerName: varchar("customer_name", { length: 100 }).notNull(),
    customerEmail: varchar("customer_email", { length: 320 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 30 }).notNull(),
    recipientName: varchar("recipient_name", { length: 100 }).notNull(),
    recipientPhone: varchar("recipient_phone", { length: 30 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    addressLine1: text("address_line1").notNull(),
    addressLine2: text("address_line2"),
    subtotal: integer("subtotal").notNull(),
    shippingFee: integer("shipping_fee").notNull().default(0),
    installationFee: integer("installation_fee"),
    totalAmount: integer("total_amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("KRW"),
    customerNote: text("customer_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_orders_order_number").on(table.orderNumber),
    uniqueIndex("uq_orders_idempotency_key").on(table.idempotencyKey),
    index("idx_orders_created_at").on(table.createdAt),
    index("idx_orders_customer_email").on(table.customerEmail),
    index("idx_orders_status").on(table.status),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productSku: varchar("product_sku", { length: 80 }).notNull(),
    productName: text("product_name").notNull(),
    optionName: text("option_name"),
    vehicleSnapshot: text("vehicle_snapshot"),
    fitmentSnapshot: varchar("fitment_snapshot", { length: 32 }),
    stockTypeSnapshot: varchar("stock_type_snapshot", { length: 32 }),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
    lineTotal: integer("line_total").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_order_items_order_id").on(table.orderId)],
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: varchar("from_status", { length: 32 }),
    toStatus: varchar("to_status", { length: 32 }).notNull(),
    reason: text("reason"),
    actorType: varchar("actor_type", { length: 20 }).notNull().default("CUSTOMER"),
    actorId: text("actor_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_order_status_history_order_id").on(table.orderId, table.createdAt)],
);
