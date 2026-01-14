import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { games } from "./games";
import { user } from "./users";

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id").references(() => games.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  isGameDocument: boolean("is_game_document").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  game: one(games, {
    fields: [documents.gameId],
    references: [games.id],
  }),
  user: one(user, {
    fields: [documents.userId],
    references: [user.id],
  }),
}));

export const gameScenes = pgTable("game_scenes", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  description: text("description"),
  engine: text("engine").notNull(),
  engineVersion: text("engine_version"),
  storageType: text("storage_type").default("minio"),
  sceneUrl: text("scene_url"),
  bucketPath: text("bucket_path"),
  thumbnailUrl: text("thumbnail_url"),
  fileSize: integer("file_size"),
  fileFormat: text("file_format"),
  sceneData: jsonb("scene_data"),
  version: integer("version").default(1),
  status: text("status").default("active"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameScenesRelations = relations(gameScenes, ({ one, many }) => ({
  game: one(games, {
    fields: [gameScenes.gameId],
    references: [games.id],
  }),
  creator: one(user, {
    fields: [gameScenes.createdBy],
    references: [user.id],
  }),
  tags: many(sceneTags),
}));

export const sceneTags = pgTable("scene_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameSceneId: uuid("game_scene_id")
    .notNull()
    .references(() => gameScenes.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
});

export const sceneTagsRelations = relations(sceneTags, ({ one }) => ({
  scene: one(gameScenes, {
    fields: [sceneTags.gameSceneId],
    references: [gameScenes.id],
  }),
}));

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").default("Untitled"),
  content: text("content"),
  tags: jsonb("tags").$type<string[]>().default([]),
  game: text("game"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(user, {
    fields: [notes.userId],
    references: [user.id],
  }),
}));
