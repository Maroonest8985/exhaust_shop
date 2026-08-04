CREATE TABLE "product_vehicle_fitments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"vehicle_generation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_vehicle_fitments" ADD CONSTRAINT "product_vehicle_fitments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_vehicle_fitments" ADD CONSTRAINT "product_vehicle_fitments_vehicle_generation_id_vehicle_generations_id_fk" FOREIGN KEY ("vehicle_generation_id") REFERENCES "public"."vehicle_generations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_product_vehicle_fitments_product_generation" ON "product_vehicle_fitments" USING btree ("product_id","vehicle_generation_id");--> statement-breakpoint
CREATE INDEX "idx_product_vehicle_fitments_generation" ON "product_vehicle_fitments" USING btree ("vehicle_generation_id");