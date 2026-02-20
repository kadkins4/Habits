-- Replace avoided (integer) with status (text) on anti_habit_entries
-- This migration handles both fresh and already-migrated databases

CREATE TABLE IF NOT EXISTS `anti_habit_entries_new` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`date` text NOT NULL,
	`status` text DEFAULT 'unknown' NOT NULL,
	`temptation_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT OR IGNORE INTO `anti_habit_entries_new` (`id`, `habit_id`, `date`, `status`, `temptation_count`)
SELECT `id`, `habit_id`, `date`, `status`, `temptation_count`
FROM `anti_habit_entries`;
--> statement-breakpoint
DROP TABLE `anti_habit_entries`;
--> statement-breakpoint
ALTER TABLE `anti_habit_entries_new` RENAME TO `anti_habit_entries`;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `anti_habit_entries_habit_date_idx` ON `anti_habit_entries` (`habit_id`,`date`);
