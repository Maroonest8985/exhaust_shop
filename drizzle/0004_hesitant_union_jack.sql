CREATE TABLE "vehicle_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"years" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"engines" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specifications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_makes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"make_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vehicle_generations" ADD CONSTRAINT "vehicle_generations_model_id_vehicle_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."vehicle_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_make_id_vehicle_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."vehicle_makes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_vehicle_generations_model_name" ON "vehicle_generations" USING btree ("model_id","name");--> statement-breakpoint
CREATE INDEX "idx_vehicle_generations_model_active_sort" ON "vehicle_generations" USING btree ("model_id","is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_vehicle_makes_name" ON "vehicle_makes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_vehicle_makes_active_sort" ON "vehicle_makes" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_vehicle_models_make_name" ON "vehicle_models" USING btree ("make_id","name");--> statement-breakpoint
CREATE INDEX "idx_vehicle_models_make_active_sort" ON "vehicle_models" USING btree ("make_id","is_active","sort_order");--> statement-breakpoint
INSERT INTO "vehicle_makes" ("name", "sort_order") VALUES
	('BMW', 10),
	('Mercedes-AMG', 20),
	('Audi', 30),
	('Porsche', 40);--> statement-breakpoint
INSERT INTO "vehicle_models" ("make_id", "name", "sort_order")
SELECT makes.id, seed.model_name, seed.sort_order
FROM (VALUES
	('BMW', 'M3', 10), ('BMW', 'M4', 20), ('BMW', 'M5', 30), ('BMW', '5 Series', 40),
	('Mercedes-AMG', 'C63', 10), ('Mercedes-AMG', 'AMG GT', 20), ('Mercedes-AMG', 'E53', 30), ('Mercedes-AMG', 'A45', 40),
	('Audi', 'RS5', 10), ('Audi', 'RS3', 20), ('Audi', 'S4', 30), ('Audi', 'R8', 40),
	('Porsche', '911', 10), ('Porsche', '718', 20), ('Porsche', 'Panamera', 30), ('Porsche', 'Cayenne', 40)
) AS seed(make_name, model_name, sort_order)
JOIN "vehicle_makes" makes ON makes.name = seed.make_name;--> statement-breakpoint
INSERT INTO "vehicle_generations" ("model_id", "name", "years", "engines", "specifications", "sort_order")
SELECT models.id, seed.generation_name, seed.years::jsonb, seed.engines::jsonb, seed.specifications::jsonb, seed.sort_order
FROM (VALUES
	('BMW', 'M3', 'G80', '["2025","2024","2023","2022","2021"]', '["3.0 가솔린"]', '["후륜 · 세단","사륜 · 세단"]', 10),
	('BMW', 'M3', 'F80', '["2018","2017","2016","2015","2014"]', '["3.0 가솔린"]', '["후륜 · 세단"]', 20),
	('BMW', 'M3', 'E92', '["2013","2012","2011","2010","2009","2008"]', '["4.0 가솔린"]', '["후륜 · 쿠페"]', 30),
	('BMW', 'M4', 'G82', '["2025","2024","2023","2022","2021"]', '["3.0 가솔린"]', '["후륜 · 쿠페","사륜 · 쿠페"]', 10),
	('BMW', 'M4', 'F82', '["2020","2019","2018","2017","2016","2015","2014"]', '["3.0 가솔린"]', '["후륜 · 쿠페"]', 20),
	('BMW', 'M5', 'G90', '["2026","2025"]', '["4.4 가솔린 PHEV"]', '["사륜 · 세단"]', 10),
	('BMW', 'M5', 'F90', '["2023","2022","2021","2020","2019","2018"]', '["4.4 가솔린"]', '["사륜 · 세단"]', 20),
	('BMW', '5 Series', 'G60', '["2026","2025","2024"]', '["2.0 가솔린 MHEV","2.0 디젤 MHEV"]', '["후륜 · 세단","사륜 · 세단"]', 10),
	('BMW', '5 Series', 'G30', '["2023","2022","2021","2020","2019","2018","2017"]', '["2.0 가솔린","3.0 가솔린","2.0 디젤"]', '["후륜 · 세단","사륜 · 세단"]', 20),
	('Mercedes-AMG', 'C63', 'W206', '["2026","2025","2024"]', '["2.0 가솔린 PHEV"]', '["사륜 · 세단"]', 10),
	('Mercedes-AMG', 'C63', 'W205', '["2021","2020","2019","2018","2017","2016","2015"]', '["4.0 가솔린"]', '["후륜 · 세단","후륜 · 쿠페"]', 20),
	('Mercedes-AMG', 'AMG GT', 'C192', '["2026","2025","2024"]', '["4.0 가솔린"]', '["사륜 · 쿠페"]', 10),
	('Mercedes-AMG', 'AMG GT', 'C190', '["2023","2022","2021","2020","2019","2018","2017","2016","2015"]', '["4.0 가솔린"]', '["후륜 · 쿠페"]', 20),
	('Mercedes-AMG', 'E53', 'W214', '["2026","2025","2024"]', '["3.0 가솔린 PHEV"]', '["사륜 · 세단"]', 10),
	('Mercedes-AMG', 'A45', 'W177', '["2025","2024","2023","2022","2021","2020"]', '["2.0 가솔린"]', '["사륜 · 해치백"]', 10),
	('Audi', 'RS5', 'B9', '["2024","2023","2022","2021","2020","2019","2018"]', '["2.9 가솔린"]', '["사륜 · 쿠페","사륜 · 스포트백"]', 10),
	('Audi', 'RS5', 'B8.5', '["2016","2015","2014","2013"]', '["4.2 가솔린"]', '["사륜 · 쿠페"]', 20),
	('Audi', 'RS3', '8Y', '["2025","2024","2023","2022"]', '["2.5 가솔린"]', '["사륜 · 세단"]', 10),
	('Audi', 'RS3', '8V', '["2020","2019","2018","2017"]', '["2.5 가솔린"]', '["사륜 · 세단"]', 20),
	('Audi', 'S4', 'B9', '["2024","2023","2022","2021","2020","2019","2018","2017"]', '["3.0 가솔린"]', '["사륜 · 세단"]', 10),
	('Audi', 'R8', '4S', '["2023","2022","2021","2020","2019","2018","2017","2016"]', '["5.2 가솔린"]', '["사륜 · 쿠페"]', 10),
	('Porsche', '911', '992', '["2026","2025","2024","2023","2022","2021","2020","2019"]', '["3.0 가솔린","3.8 가솔린"]', '["후륜 · 쿠페","사륜 · 쿠페"]', 10),
	('Porsche', '911', '991', '["2019","2018","2017","2016","2015","2014","2013","2012"]', '["3.0 가솔린","3.8 가솔린"]', '["후륜 · 쿠페","사륜 · 쿠페"]', 20),
	('Porsche', '718', '982', '["2025","2024","2023","2022","2021","2020","2019","2018","2017"]', '["2.0 가솔린","2.5 가솔린","4.0 가솔린"]', '["후륜 · 쿠페","후륜 · 로드스터"]', 10),
	('Porsche', 'Panamera', '971', '["2023","2022","2021","2020","2019","2018","2017"]', '["2.9 가솔린","4.0 가솔린"]', '["사륜 · 패스트백"]', 10),
	('Porsche', 'Cayenne', '9Y0', '["2025","2024","2023","2022","2021","2020","2019"]', '["3.0 가솔린","4.0 가솔린"]', '["사륜 · SUV"]', 10)
) AS seed(make_name, model_name, generation_name, years, engines, specifications, sort_order)
JOIN "vehicle_makes" makes ON makes.name = seed.make_name
JOIN "vehicle_models" models ON models.make_id = makes.id AND models.name = seed.model_name;
