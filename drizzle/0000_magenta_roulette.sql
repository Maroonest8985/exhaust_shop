CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text,
	`reason` text,
	`diff` text DEFAULT '{}' NOT NULL,
	`actor_id` text,
	`actor_email` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_target` ON `audit_logs` (`target_type`,`target_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_created` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `commerce_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`actor_id` text,
	`actor_email` text,
	`status` text DEFAULT 'RECEIVED' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_commerce_events_kind_created` ON `commerce_events` (`kind`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_commerce_events_actor` ON `commerce_events` (`actor_id`);