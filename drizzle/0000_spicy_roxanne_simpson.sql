CREATE TABLE "Classroom" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "RecyclingRecord" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kilos" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"studentId" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"classroomId" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar NOT NULL,
	"password" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_username_unique" UNIQUE("username")
);
