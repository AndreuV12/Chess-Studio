CREATE TABLE "moves" (
	"id" serial PRIMARY KEY NOT NULL,
	"fen_from" text NOT NULL,
	"fen_to" text NOT NULL,
	"uci" text NOT NULL,
	"evaluation" real
);
--> statement-breakpoint
CREATE UNIQUE INDEX "moves_fen_from_uci_unique" ON "moves" USING btree ("fen_from","uci");