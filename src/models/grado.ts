import { db } from '../utils/db';
import { grados } from './schema';
import { eq } from 'drizzle-orm';

export interface Grado {
  id?: number;
  nombre: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getAllGrados() {
  return await db.select().from(grados);
}

export async function getGradoById(id: number) {
  const result = await db.select().from(grados).where(eq(grados.id, id));
  return result[0];
}

export async function createGrado(grado: Grado) {
  return await db.insert(grados).values({
    nombre: grado.nombre,
  }).returning();
}

export async function updateGrado(id: number, grado: Grado) {
  return await db.update(grados)
    .set({
      nombre: grado.nombre,
      updatedAt: new Date()
    })
    .where(eq(grados.id, id))
    .returning();
}

export async function deleteGrado(id: number) {
  return await db.delete(grados).where(eq(grados.id, id)).returning();
}