CREATE TABLE `anti_habit_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`date` text NOT NULL,
	`avoided` integer DEFAULT 0 NOT NULL,
	`temptation_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `anti_habit_entries_habit_date_idx` ON `anti_habit_entries` (`habit_id`,`date`);