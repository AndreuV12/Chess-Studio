CREATE TABLE "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" varchar(255) NOT NULL,
    "name" varchar(255),
    "password_hash" varchar(255) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

--> statement-breakpoint

INSERT INTO "users" ("email", "name", "password_hash")
VALUES ('legacy@chessstudio.local', 'Legacy User', 'temporary');

--> statement-breakpoint

DROP INDEX "moves_fen_from_uci_unique";

--> statement-breakpoint

ALTER TABLE "moves" ADD COLUMN "user_id" integer;

--> statement-breakpoint

UPDATE "moves"
SET "user_id" = (
    SELECT "id"
    FROM "users"
    WHERE "email" = 'legacy@chessstudio.local'
);

--> statement-breakpoint

ALTER TABLE "moves"
ALTER COLUMN "user_id" SET NOT NULL;

--> statement-breakpoint

ALTER TABLE "moves" ADD COLUMN "parent_id" integer;

--> statement-breakpoint

ALTER TABLE "moves"
ADD CONSTRAINT "moves_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."users"("id")
ON DELETE no action
ON UPDATE no action;

--> statement-breakpoint

ALTER TABLE "moves"
ADD CONSTRAINT "moves_parent_id_moves_id_fk"
FOREIGN KEY ("parent_id")
REFERENCES "public"."moves"("id")
ON DELETE no action
ON UPDATE no action;