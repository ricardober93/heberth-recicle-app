CREATE TABLE "estudiantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text DEFAULT '' NOT NULL,
	"salon_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "grados" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reciclajes" (
	"id" serial PRIMARY KEY NOT NULL,
	"cantidad" real NOT NULL,
	"estudiante_id" integer NOT NULL,
	"fecha" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "salones" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"grado_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_salon_id_salones_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reciclajes" ADD CONSTRAINT "reciclajes_estudiante_id_estudiantes_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salones" ADD CONSTRAINT "salones_grado_id_grados_id_fk" FOREIGN KEY ("grado_id") REFERENCES "public"."grados"("id") ON DELETE no action ON UPDATE no action;