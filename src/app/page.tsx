import React from 'react';
import Card from '../components/Card';
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
  const estudiantesDestacados = await getEstudiantesDestacados();

  // Calcular estadísticas generales
  const totalReciclaje = salones.reduce((total, salon) => total + salon.totalReciclaje, 0);
  const totalEstudiantes = salones.reduce((total, salon) => total + salon.estudiantesDestacados.length, 0);
  const salonesActivos = salones.filter(salon => salon.totalReciclaje > 0).length;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Reciclaje Escolar</h1>
        <p className="text-gray-100">Cuidando el planeta desde la escuela</p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {totalReciclaje.toFixed(2)} kg
          </div>
          <div className="text-gray-600">Total Reciclado</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {salones.length}
          </div>
          <div className="text-gray-600">Salones Registrados</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {salonesActivos}
          </div>
          <div className="text-gray-600">Salones Activos</div>
        </Card>
      </div>

      {/* Título de Sección */}
      {salones.length > 0 && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-200 mb-2">📚 Salones y Reciclaje</h2>
          <p className="text-gray-100">Información detallada por salón y estudiantes destacados</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salones.map((salon) => (
          <Card 
            key={salon.id} 
            title={`${salon.nombre} - ${salon.grado}`}
            className="h-full border-l-4 border-green-500"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Total Reciclaje</h3>
              <div className="text-3xl font-bold text-green-600">
                {salon.totalReciclaje.toFixed(2)} kg
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                <span className="mr-2">🌟</span>
                Top 3 Estudiantes
              </h3>
              {salon.estudiantesDestacados.length > 0 ? (
                <div className="space-y-2">
                  {salon.estudiantesDestacados.map((estudiante, index) => (
                    <div key={estudiante.id} className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">{estudiante.nombre}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-green-600">{estudiante.totalReciclaje.toFixed(2)} kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-500 text-4xl mb-2">📊</div>
                  <p className="text-gray-700 italic">No hay datos de reciclaje</p>
                  <p className="text-sm text-gray-600 mt-1">¡Comienza a registrar reciclaje!</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {salones.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-700 mb-4">No hay salones registrados</p>
          <a href="/admin/grado" className="text-green-700 hover:text-green-800 hover:underline font-medium">
            Comienza creando un grado y un salón
          </a>
        </div>
      )}

      {/* Estudiantes Destacados Globales */}
      {estudiantesDestacados.length > 0 && (
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-700 mb-2 flex items-center justify-center">
              <span className="mr-3">🏆</span>
              Ranking Global de Reciclaje
              <span className="ml-3">🌍</span>
            </h2>
            <p className="text-gray-600">Los estudiantes más comprometidos con el medio ambiente</p>
          </div>
          
          <Card className="overflow-hidden shadow-lg border-2 border-green-200">
             <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
               <h3 className="text-xl font-bold text-center">🌟 Hall of Fame Ecológico 🌟</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead>
                    <tr className="bg-gray-50">
                      <th className="w-20 text-center font-bold p-3 text-gray-800">Posición</th>
                      <th className="font-bold p-3 text-left text-gray-800">Estudiante</th>
                      <th className="font-bold p-3 text-left text-gray-800">Salón</th>
                      <th className="font-bold p-3 text-left text-gray-800">Grado</th>
                      <th className="text-right font-bold p-3 text-gray-800">Total Reciclado</th>
                    </tr>
                  </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {estudiantesDestacados.map((estudiante, index) => (
                     <tr 
                       key={estudiante.id}
                       className={`transition-colors hover:bg-gray-50 ${
                         index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-l-4 border-yellow-500' :
                         index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-l-4 border-gray-400' :
                         index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-50 border-l-4 border-orange-400' : ''
                       }`}
                     >
                       <td className="text-center p-3">
                         <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold shadow-md ${
                           index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                           index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                           index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                         }`}>
                           {index < 3 ? (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉') : index + 1}
                         </div>
                       </td>
                       <td className={`font-medium p-3 ${index < 3 ? 'text-gray-800' : 'text-gray-700'}`}>
                         {estudiante.nombre}
                         {index < 3 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">⭐ Destacado</span>}
                       </td>
                       <td className={`p-3 text-gray-600 ${index < 3 ? 'font-medium' : ''}`}>{estudiante.salon}</td>
                        <td className={`p-3 text-gray-600 ${index < 3 ? 'font-medium' : ''}`}>{estudiante.grado}</td>
                       <td className="text-right p-3">
                         <span className={`font-bold ${index < 3 ? 'text-green-700 text-lg' : 'text-green-600'}`}>
                           {estudiante.totalReciclaje.toFixed(2)} kg
                         </span>
                         {index === 0 && <div className="text-xs text-yellow-700 font-medium">¡Campeón!</div>}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </Card>
        </div>
       )}

       {/* Mensaje motivacional y llamada a la acción */}
       <div className="mt-12 text-center">
         <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300">
           <div className="p-8">
             <div className="text-6xl mb-4">🌱</div>
             <h3 className="text-2xl font-bold text-green-700 mb-4">
               ¡Juntos Cuidamos Nuestro Planeta!
             </h3>
             <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
               Cada kilogramo de material reciclado cuenta. Gracias a todos los estudiantes y maestros 
               que participan activamente en nuestro programa de reciclaje escolar.
             </p>
             <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
               <div className="flex items-center">
                 <span className="mr-2">♻️</span>
                 Reduce, Reutiliza, Recicla
               </div>
               <div className="flex items-center">
                 <span className="mr-2">🌍</span>
                 Un planeta más limpio
               </div>
               <div className="flex items-center">
                 <span className="mr-2">👥</span>
                 Trabajo en equipo
               </div>
             </div>
           </div>
         </Card>
       </div>
     </div>
   );
 }
