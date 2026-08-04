CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(80) NOT NULL,
	"byte_size" integer NOT NULL,
	"image_base64" text NOT NULL,
	"alt_text" varchar(300) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" varchar(80) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"name" text NOT NULL,
	"category" varchar(80) NOT NULL,
	"material" varchar(200) NOT NULL,
	"price" integer NOT NULL,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"stock_type" varchar(32) NOT NULL,
	"fitment_status" varchar(32) NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"specifications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_product_images_product_sort" ON "product_images" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_products_sku" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_products_slug" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_products_status_created" ON "products" USING btree ("status","created_at");