CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_sku" varchar(80) NOT NULL,
	"product_name" text NOT NULL,
	"option_name" text,
	"vehicle_snapshot" text,
	"fitment_snapshot" varchar(32),
	"stock_type_snapshot" varchar(32),
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"line_total" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" varchar(32),
	"to_status" varchar(32) NOT NULL,
	"reason" text,
	"actor_type" varchar(20) DEFAULT 'CUSTOMER' NOT NULL,
	"actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(32) NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"status" varchar(32) DEFAULT 'RECEIVED' NOT NULL,
	"payment_status" varchar(32) DEFAULT 'PENDING' NOT NULL,
	"payment_method" varchar(32) NOT NULL,
	"fulfillment_method" varchar(32) NOT NULL,
	"customer_name" varchar(100) NOT NULL,
	"customer_email" varchar(320) NOT NULL,
	"customer_phone" varchar(30) NOT NULL,
	"recipient_name" varchar(100) NOT NULL,
	"recipient_phone" varchar(30) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"subtotal" integer NOT NULL,
	"shipping_fee" integer DEFAULT 0 NOT NULL,
	"installation_fee" integer,
	"total_amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'KRW' NOT NULL,
	"customer_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_order_items_order_id" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_order_id" ON "order_status_history" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_orders_order_number" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_orders_idempotency_key" ON "orders" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_orders_created_at" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_orders_customer_email" ON "orders" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");