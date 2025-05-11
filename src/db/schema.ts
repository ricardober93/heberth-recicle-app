import { relations } from 'drizzle-orm';
import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// Definición de la tabla Classroom
export const classroom = pgTable('Classroom', {
  id: uuid().primaryKey().defaultRandom(), // Usamos gen_random_uuid() para generar UUIDs en PostgreSQL
  name: varchar('name').notNull(),
});

// Definición de la tabla Student
export const student = pgTable('Student', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  classroomId: varchar('classroomId', { length: 36 }).notNull(),
});

// Definición de la tabla User
export const user = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar('username').unique().notNull(),
  password: varchar('password').notNull(), // ¡Importante! NUNCA almacenes contraseñas sin hashear
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Definición de la tabla RecyclingRecord
export const recyclingRecord = pgTable('RecyclingRecord', {
  id: uuid().primaryKey().defaultRandom(),
  kilos: integer('kilos').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  studentId: varchar('studentId', { length: 36 }).notNull(),
});

// Definición de relaciones usando drizzle-orm's relations API
export const classroomRelations = relations(classroom, ({ many }) => ({
  students: many(student),
}));

export const studentRelations = relations(student, ({ one, many }) => ({
  classroom: one(classroom, {
    fields: [student.classroomId],
    references: [classroom.id],
  }),
  recyclingRecords: many(recyclingRecord),
}));

export const recyclingRecordRelations = relations(recyclingRecord, ({ one }) => ({
  student: one(student, {
    fields: [recyclingRecord.studentId],
    references: [student.id],
  }),
}));
