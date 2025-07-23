import { pgTable, serial, text, timestamp, integer, real, foreignKey } from 'drizzle-orm/pg-core';

export const grados = pgTable('grados', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const salones = pgTable('salones', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  gradoId: integer('grado_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    gradoFk: foreignKey({
      columns: [table.gradoId],
      foreignColumns: [grados.id]
    })
  };
});

export const estudiantes = pgTable('estudiantes', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull().default(''),
  salonId: integer('salon_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    salonFk: foreignKey({
      columns: [table.salonId],
      foreignColumns: [salones.id]
    })
  };
});

export const reciclajes = pgTable('reciclajes', {
  id: serial('id').primaryKey(),
  cantidad: real('cantidad').notNull(),
  estudianteId: integer('estudiante_id').notNull(),
  fecha: timestamp('fecha').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    estudianteFk: foreignKey({
      columns: [table.estudianteId],
      foreignColumns: [estudiantes.id]
    })
  };
});