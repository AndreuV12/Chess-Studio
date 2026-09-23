import { integer, pgTable, serial, text, real, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./user";

export const moves = pgTable("moves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  parentId: integer("parent_id").references((): any => moves.id),
  fenFrom: text("fen_from").notNull(),
  fenTo: text("fen_to").notNull(),
  uci: text("uci").notNull(),
  evaluation: real("evaluation"),
});

export type Move = typeof moves.$inferSelect;
export type CreateMove = typeof moves.$inferInsert;
