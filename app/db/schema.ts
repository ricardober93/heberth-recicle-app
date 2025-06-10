import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  classroomId: integer('classroom_id').references(() => classrooms.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const classrooms = pgTable('classrooms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const recycling = pgTable('recycling', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  classroomId: integer('classroom_id').references(() => classrooms.id).notNull(),
  item: text('item').notNull(),
  weight: integer('weight').notNull(),
  recycledAt: timestamp('recycled_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});