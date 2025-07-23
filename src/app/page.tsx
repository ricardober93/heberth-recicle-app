import React from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import { db } from '../utils/db';
import { salones, grados, estudiantes, reciclajes } from '../models/schema';
import { eq, sql } from 'drizzle-orm';

async function getSalones() {
  try {
    const salonesData = await db
      .select({
        id: salones.id,
        nombre: salones.nombre,
        gradoNombre: grados.nombre,
        totalReciclaje: sql<number>`COALESCE(SUM(${reciclajes.cantidad}), 0)`
      })
      .from(salones)
      .leftJoin(grados, eq(salones.gradoId, grados.id))
      .leftJoin(estudiantes, eq(estudiantes.salonId, salones.id))
      .leftJoin(reciclajes, eq(reciclajes.estudianteId, estudiantes.id))
      .groupBy(salones.id, salones.nombre, grados.nombre);

    // Get estudiantes destacados for each salon
    const salonesConDestacados = await Promise.all(
      salonesData.map(async (salon) => {
        const estudiantesDestacados = await db
          .select({
            id: estudiantes.id,
            nombre: estudiantes.nombre,
            apellido: estudiantes.apellido,
            totalReciclaje: sql<number>`COALESCE(SUM(${reciclajes.cantidad}), 0)`
          })
          .from(estudiantes)
          .leftJoin(reciclajes, eq(reciclajes.estudianteId, estudiantes.id))
          .where(eq(estudiantes.salonId, salon.id))
          .groupBy(estudiantes.id, estudiantes.nombre, estudiantes.apellido)
          .orderBy(sql`COALESCE(SUM(${reciclajes.cantidad}), 0) DESC`)
          .limit(3);

        return {
          id: salon.id,
          nombre: salon.nombre,
          grado: salon.gradoNombre,
          totalReciclaje: Number(salon.totalReciclaje),
          estudiantesDestacados: estudiantesDestacados.map(est => ({
            id: est.id,
            nombre: `${est.nombre} ${est.apellido}`,
            totalReciclaje: Number(est.totalReciclaje)
          }))
        };
      })
    );

    return salonesConDestacados;
  } catch (error) {
    console.error('Error obteniendo salones:', error);
    return [];
  }
}

async function getEstudiantesDestacados() {
  try {
    const estudiantesData = await db
      .select({
        id: estudiantes.id,
        nombre: estudiantes.nombre,
        apellido: estudiantes.apellido,
        salonNombre: salones.nombre,
        gradoNombre: grados.nombre,
        totalReciclaje: sql<number>`COALESCE(SUM(${reciclajes.cantidad}), 0)`
      })
      .from(estudiantes)
      .leftJoin(salones, eq(estudiantes.salonId, salones.id))
      .leftJoin(grados, eq(salones.gradoId, grados.id))
      .leftJoin(reciclajes, eq(reciclajes.estudianteId, estudiantes.id))
      .groupBy(estudiantes.id, estudiantes.nombre, estudiantes.apellido, salones.nombre, grados.nombre)
      .orderBy(sql`COALESCE(SUM(${reciclajes.cantidad}), 0) DESC`)
      .limit(3);

    return estudiantesData.map(est => ({
      id: est.id,
      nombre: `${est.nombre} ${est.apellido}`,
      salon: est.salonNombre,
      grado: est.gradoNombre,
      totalReciclaje: Number(est.totalReciclaje)
    }));
  } catch (error) {
    console.error('Error obteniendo estudiantes destacados:', error);
    return [];
  }
}

export default async function Home() {
  const salones = await getSalones();

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Reciclaje Escolar</h1>
        <p className="text-gray-600">Cuidando el planeta desde la escuela</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salones.map((salon) => (
          <Card 
            key={salon.id} 
            title={`${salon.nombre} - ${salon.grado}`}
            className="h-full"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Total Reciclaje</h3>
              <div className="text-3xl font-bold text-green-600">
                {salon.totalReciclaje.toFixed(2)} kg
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Estudiantes Destacados</h3>
              {salon.estudiantesDestacados.length > 0 ? (
                <ul className="space-y-2">
                  {salon.estudiantesDestacados.map((estudiante, index) => (
                    <li key={estudiante.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-green-800 mr-2">{index + 1}.</span>
                        <span>{estudiante.nombre}</span>
                      </div>
                      <span className="font-semibold">{estudiante.totalReciclaje.toFixed(2)} kg</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No hay datos de reciclaje</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {salones.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No hay salones registrados</p>
          <a href="/admin/grado" className="text-green-600 hover:underline">
            Comienza creando un grado y un salón
          </a>
        </div>
      )}
    </div>
  );
}
