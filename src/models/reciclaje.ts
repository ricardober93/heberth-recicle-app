import { db } from '../utils/db';
import { reciclajes, estudiantes, salones } from './schema';
import { eq, and, sql, desc, sum } from 'drizzle-orm';

export interface Reciclaje {
  id?: number;
  cantidad: number;
  estudianteId: number;
  fecha?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReciclajeWithEstudiante extends Reciclaje {
  estudiante?: {
    nombre: string;
    apellido: string;
    salonId: number;
  };
}

export async function getAllReciclajes() {
  return await db
    .select({
      id: reciclajes.id,
      cantidad: reciclajes.cantidad,
      estudianteId: reciclajes.estudianteId,
      estudianteNombre: estudiantes.nombre,
      estudianteApellido: estudiantes.apellido,
      salonId: estudiantes.salonId,
      fecha: reciclajes.fecha,
      createdAt: reciclajes.createdAt,
      updatedAt: reciclajes.updatedAt
    })
    .from(reciclajes)
    .leftJoin(estudiantes, eq(reciclajes.estudianteId, estudiantes.id));
}

export async function getReciclajeById(id: number) {
  const result = await db
    .select({
      id: reciclajes.id,
      cantidad: reciclajes.cantidad,
      estudianteId: reciclajes.estudianteId,
      estudianteNombre: estudiantes.nombre,
      estudianteApellido: estudiantes.apellido,
      salonId: estudiantes.salonId,
      fecha: reciclajes.fecha,
      createdAt: reciclajes.createdAt,
      updatedAt: reciclajes.updatedAt
    })
    .from(reciclajes)
    .leftJoin(estudiantes, eq(reciclajes.estudianteId, estudiantes.id))
    .where(eq(reciclajes.id, id));
  
  return result[0];
}

export async function getReciclajesByEstudianteId(estudianteId: number) {
  return await db
    .select()
    .from(reciclajes)
    .where(eq(reciclajes.estudianteId, estudianteId));
}

export async function getTotalReciclajeBySalon(salonId: number) {
  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${reciclajes.cantidad}), 0)`
    })
    .from(reciclajes)
    .innerJoin(estudiantes, eq(reciclajes.estudianteId, estudiantes.id))
    .where(eq(estudiantes.salonId, salonId));
  
  return result[0]?.total || 0;
}

export async function createReciclaje(reciclaje: Reciclaje) {
  return await db.insert(reciclajes).values({
    cantidad: reciclaje.cantidad,
    estudianteId: reciclaje.estudianteId,
    fecha: reciclaje.fecha || new Date()
  }).returning();
}

export async function updateReciclaje(id: number, reciclaje: Reciclaje) {
  return await db.update(reciclajes)
    .set({
      cantidad: reciclaje.cantidad,
      estudianteId: reciclaje.estudianteId,
      fecha: reciclaje.fecha,
      updatedAt: new Date()
    })
    .where(eq(reciclajes.id, id))
    .returning();
}

export async function deleteReciclaje(id: number) {
  return await db.delete(reciclajes).where(eq(reciclajes.id, id)).returning();
}