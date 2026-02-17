CREATE TABLE `habits_new` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL DEFAULT 'active',
	`difficulty` text NOT NULL DEFAULT 'medium',
	`type` text NOT NULL DEFAULT 'habit',
	`description` text,
	`icon` text,
	`sort_order` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `habits_new` (id, name, status, difficulty, type, description, icon, sort_order, created_at)
SELECT id, name,
  CASE WHEN active = 1 THEN 'active' ELSE 'archived' END,
  CASE WHEN xp <= 7 THEN 'easy' WHEN xp <= 15 THEN 'medium' ELSE 'hard' END,
  'habit', NULL, NULL, sort_order, created_at
FROM habits;
--> statement-breakpoint
DROP TABLE `habits`;
--> statement-breakpoint
ALTER TABLE `habits_new` RENAME TO `habits`;
