CREATE TABLE `accelerators` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`memory_gb` real NOT NULL,
	`manufacturer` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accelerator_unique_idx` ON `accelerators` (`name`,`type`,`memory_gb`);--> statement-breakpoint
CREATE TABLE `benchmark_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`system_id` integer,
	`accelerator_id` integer,
	`model_variant_id` integer,
	`runtime_id` integer,
	`avg_prompt_tps` real NOT NULL,
	`avg_gen_tps` real NOT NULL,
	`avg_ttft_ms` real NOT NULL,
	`performance_score` real NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`system_id`) REFERENCES `benchmark_systems`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`accelerator_id`) REFERENCES `accelerators`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_variant_id`) REFERENCES `model_variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`runtime_id`) REFERENCES `runtimes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `benchmark_systems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cpu_name` text,
	`cpu_arch` text,
	`ram_gb` real,
	`kernel_type` text,
	`kernel_release` text,
	`system_version` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `system_unique_idx` ON `benchmark_systems` (`cpu_name`,`cpu_arch`,`ram_gb`,`kernel_type`,`kernel_release`,`system_version`);--> statement-breakpoint
CREATE TABLE `model_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model_id` integer,
	`quantization` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `model_variant_unique_idx` ON `model_variants` (`model_id`,`quantization`);--> statement-breakpoint
CREATE TABLE `models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`params` integer NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `model_name_idx` ON `models` (`name`);--> statement-breakpoint
CREATE TABLE `runtimes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`version` text,
	`commit_hash` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `runtime_unique_idx` ON `runtimes` (`name`,`version`,`commit_hash`);--> statement-breakpoint
CREATE TABLE `test_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`benchmark_run_id` integer,
	`name` text,
	`n_prompt` integer,
	`n_gen` integer,
	`avg_time_ms` real,
	`power_watts` real,
	`prompt_tps` real,
	`gen_tps` real,
	`prompt_tps_watt` real,
	`gen_tps_watt` real,
	`vram_used_mb` real,
	`ttft_ms` real,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`benchmark_run_id`) REFERENCES `benchmark_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE VIEW `accelerator_model_performance_scores` AS select "accelerators"."id", "accelerators"."name", "accelerators"."type", "accelerators"."memory_gb", "models"."id", "models"."name", "model_variants"."id", "model_variants"."quantization", AVG(CASE WHEN "benchmark_runs"."avg_prompt_tps" = 0 THEN NULL ELSE "benchmark_runs"."avg_prompt_tps" END) as "avg_prompt_tps", AVG(CASE WHEN "benchmark_runs"."avg_gen_tps" = 0 THEN NULL ELSE "benchmark_runs"."avg_gen_tps" END) as "avg_gen_tps", AVG(CASE WHEN "benchmark_runs"."avg_ttft_ms" = 0 THEN NULL ELSE "benchmark_runs"."avg_ttft_ms" END) as "avg_ttft", AVG(CASE WHEN "benchmark_runs"."performance_score" = 0 THEN NULL ELSE "benchmark_runs"."performance_score" END) as "performance_score" from "accelerators" inner join "benchmark_runs" on "accelerators"."id" = "benchmark_runs"."accelerator_id" inner join "model_variants" on "benchmark_runs"."model_variant_id" = "model_variants"."id" inner join "models" on "model_variants"."model_id" = "models"."id" group by "accelerators"."id", "accelerators"."name", "accelerators"."type", "accelerators"."memory_gb", "models"."id", "models"."name", "model_variants"."id", "model_variants"."quantization";