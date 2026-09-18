import { pgTable, serial, text, real, uniqueIndex } from "drizzle-orm/pg-core";

export const moves = pgTable(
  "moves",
  {
    id: serial("id").primaryKey(),
    fenFrom: text("fen_from").notNull(),
    fenTo: text("fen_to").notNull(),
    uci: text("uci").notNull(),
    evaluation: real("evaluation"),
  },
  (table) => [uniqueIndex("moves_fen_from_uci_unique").on(table.fenFrom, table.uci)],
);

export type Move = typeof moves.$inferSelect;
export type CreateMove = typeof moves.$inferInsert;
