CREATE TABLE "game_audio_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"created_by" text NOT NULL,
	"name" text,
	"filename" text NOT NULL,
	"description" text,
	"linked_characters" jsonb DEFAULT '[]'::jsonb,
	"linked_scenes" jsonb DEFAULT '[]'::jsonb,
	"storage_type" text DEFAULT 'supabase',
	"audio_url" text,
	"bucket_path" text,
	"file_size" integer,
	"file_format" text,
	"duration" integer,
	"audio_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"created_by" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"mechanics" jsonb DEFAULT '[]'::jsonb,
	"storage_type" text DEFAULT 'minio',
	"model_url" text,
	"bucket_path" text,
	"thumbnail_url" text,
	"file_size" integer,
	"file_format" text,
	"model_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "game_audio_assets" ADD CONSTRAINT "game_audio_assets_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_audio_assets" ADD CONSTRAINT "game_audio_assets_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_characters" ADD CONSTRAINT "game_characters_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_characters" ADD CONSTRAINT "game_characters_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;