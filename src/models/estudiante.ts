import { db } from '../utils/db';
import { estudiantes, salones, reciclajes } from './schema';
import { eq, and, sql, desc, sum } from 'drizzle-orm';

export interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  salonId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EstudianteWithSalon extends Estudiante {
  salon?: {
    nombre: string;
  };
}

export interface EstudianteWithReciclaje extends EstudianteWithSalon {
  totalReciclaje: number;
}

export async function getAllEstudiantes() {
  return await db
    .select({
      id: estudiantes.id,
      nombre: estudiantes.nombre,
      apellido: estudiantes.apellido,
      salonId: estudiantes.salonId,
      salonNombre: salones.nombre,
      totalReciclaje: sql<number>`COALESCE(SUM(${reciclajes.cantidad}), 0)`,
      createdAt: estudiantes.createdAt,
      updatedAt: estudiantes.updatedAt,
    })
    .from(estudiantes)
    .leftJoin(salones, eq(estudiantes.salonId, salones.id))
    .leftJoin(reciclajes, eq(estudiantes.id, reciclajes.estudianteId))
    .groupBy(estudiantes.id, salones.nombre, estudiantes.createdAt, estudiantes.updatedAt);
}

export async function getEstudianteById(id: number) {
  const result = await db
    .select({
      id: estudiantes.id,
      nombre: estudiantes.nombre,
      apellido: estudiantes.apellido,
      salonId: estudiantes.salonId,
      salonNombre: salones.nombre,
      createdAt: estudiantes.createdAt,
      updatedAt: estudiantes.updatedAt
    })
    .from(estudiantes)
    .leftJoin(salones, eq(estudiantes.salonId, salones.id))
    .where(eq(estudiantes.id, id));
  
  return result[0];
}

export async function getEstudiantesBySalonId(salonId: number) {
  return await db
    .select()
    .from(estudiantes)
    .where(eq(estudiantes.salonId, salonId));
}

export async function getEstudiantesDestacados(salonId: number, limit: number = 3) {
  return await db
    .select({
      id: estudiantes.id,
      nombre: estudiantes.nombre,
      apellido: estudiantes.apellido,
      totalReciclaje: sql<number>`COALESCE(SUM(${reciclajes.cantidad}), 0)`
    })
    .from(estudiantes)
    .leftJoin(reciclajes, eq(estudiantes.id, reciclajes.estudianteId))
    .where(eq(estudiantes.salonId, salonId))
    .groupBy(estudiantes.id, estudiantes.nombre, estudiantes.apellido)
    .orderBy(desc(sql`totalReciclaje`))
    .limit(limit);
}

export async function createEstudiante(data: { nombre: string; apellido: string; salonId: number }) {
  return await db.insert(estudiantes).values({
    nombre: data.nombre,
    apellido: data.apellido,
    salonId: data.salonId
  }).returning();
}

export async function updateEstudiante(id: number, data: { nombre?: string; apellido?: string; salonId?: number }) {
  return await db.update(estudiantes)
    .set({
      nombre: data.nombre,
      apellido: data.apellido,
      salonId: data.salonId,
      updatedAt: new Date()
    })
    .where(eq(estudiantes.id, id))
    .returning();
}

export async function deleteEstudiante(id: number) {
  return await db.delete(estudiantes).where(eq(estudiantes.id, id)).returning();
}