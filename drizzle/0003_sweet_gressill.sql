CREATE TABLE "support_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_number" varchar(32) NOT NULL,
	"type" varchar(40) NOT NULL,
	"status" varchar(32) DEFAULT 'RECEIVED' NOT NULL,
	"customer_name" varchar(100) NOT NULL,
	"customer_email" varchar(320) NOT NULL,
	"customer_phone" varchar(30) NOT NULL,
	"subject" varchar(300) NOT NULL,
	"body" text NOT NULL,
	"product_sku" varchar(80),
	"product_name" text,
	"vehicle_snapshot" text,
	"source_path" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_support_inquiries_number" ON "support_inquiries" USING btree ("inquiry_number");--> statement-breakpoint
CREATE INDEX "idx_support_inquiries_status_created" ON "support_inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_support_inquiries_customer_email" ON "support_inquiries" USING btree ("customer_email");