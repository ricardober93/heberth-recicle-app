import { db } from '../utils/db';
import { salones, grados, estudiantes } from './schema';
import { eq, and, sql } from 'drizzle-orm';

export interface Salon {
  id?: number;
  nombre: string;
  gradoId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SalonWithGrado extends Salon {
  grado?: {
    nombre: string;
  };
}

export interface SalonWithEstadisticas extends SalonWithGrado {
  totalReciclaje: number;
  estudiantesDestacados?: any[];
}

export async function getAllSalones() {
  return await db
    .select({
      id: salones.id,
      nombre: salones.nombre,
      gradoId: salones.gradoId,
      gradoNombre: grados.nombre,
      createdAt: salones.createdAt,
      updatedAt: salones.updatedAt
    })
    .from(salones)
    .leftJoin(grados, eq(salones.gradoId, grados.id));
}

export async function getSalonById(id: number) {
  const result = await db
    .select({
      id: salones.id,
      nombre: salones.nombre,
      gradoId: salones.gradoId,
      gradoNombre: grados.nombre,
      createdAt: salones.createdAt,
      updatedAt: salones.updatedAt
    })
    .from(salones)
    .leftJoin(grados, eq(salones.gradoId, grados.id))
    .where(eq(salones.id, id));
  
  return result[0];
}

export async function getSalonesByGradoId(gradoId: number) {
  return await db
    .select()
    .from(salones)
    .where(eq(salones.gradoId, gradoId));
}

export async function createSalon(salon: Salon) {
  return await db.insert(salones).values({
    nombre: salon.nombre,
    gradoId: salon.gradoId
  }).returning();
}

export async function updateSalon(id: number, salon: Salon) {
  return await db.update(salones)
    .set({
      nombre: salon.nombre,
      gradoId: salon.gradoId,
      updatedAt: new Date()
    })
    .where(eq(salones.id, id))
    .returning();
}

export async function deleteSalon(id: number) {
  return await db.delete(salones).where(eq(salones.id, id)).returning();
}

export async function getSalonEstadisticas(id: number) {
  // Esta función se implementará más adelante cuando tengamos la tabla de reciclajes
  // Devolverá el total de reciclaje y los estudiantes destacados
  return null;
}