import { db } from './db';
import { grados, salones, estudiantes, reciclajes } from '../models/schema';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('Inicializando base de datos...');
    
    // Crear tablas si no existen
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS grados (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS salones (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        grado_id INTEGER NOT NULL REFERENCES grados(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS estudiantes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        apellido VARCHAR(255) NOT NULL DEFAULT '',
        salon_id INTEGER NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reciclajes (
        id SERIAL PRIMARY KEY,
        estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
        cantidad DECIMAL(10,2) NOT NULL,
        tipo_material VARCHAR(100) NOT NULL,
        fecha DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Base de datos inicializada correctamente');
    
    // Insertar datos de ejemplo
    await insertSampleData();
    
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    throw error;
  }
}

async function insertSampleData() {
  try {
    console.log('Insertando datos de ejemplo...');
    
    // Verificar si ya existen datos
    const existingGrados = await db.select().from(grados).limit(1);
    if (existingGrados.length > 0) {
      console.log('Los datos de ejemplo ya existen');
      return;
    }
    
    // Insertar grados
    const gradosInsertados = await db.insert(grados).values([
      { nombre: 'Primero' },
      { nombre: 'Segundo' },
      { nombre: 'Tercero' },
      { nombre: 'Cuarto' },
      { nombre: 'Quinto' }
    ]).returning();
    
    // Insertar salones
    const salonesInsertados = await db.insert(salones).values([
      { nombre: 'A', gradoId: gradosInsertados[0].id },
      { nombre: 'B', gradoId: gradosInsertados[0].id },
      { nombre: 'A', gradoId: gradosInsertados[1].id },
      { nombre: 'B', gradoId: gradosInsertados[1].id },
      { nombre: 'A', gradoId: gradosInsertados[2].id }
    ]).returning();
    
    // Insertar estudiantes
    const estudiantesInsertados = await db.insert(estudiantes).values([
      { nombre: 'Ana', apellido: 'García', salonId: salonesInsertados[0].id },
      { nombre: 'Carlos', apellido: 'López', salonId: salonesInsertados[0].id },
      { nombre: 'María', apellido: 'Rodríguez', salonId: salonesInsertados[1].id },
      { nombre: 'José', apellido: 'Martínez', salonId: salonesInsertados[1].id },
      { nombre: 'Laura', apellido: 'Sánchez', salonId: salonesInsertados[2].id }
    ]).returning();
    
    // Insertar reciclajes
    await db.insert(reciclajes).values([
      { estudianteId: estudiantesInsertados[0].id, cantidad: 2.5, tipoMaterial: 'Plástico', fecha: new Date() },
      { estudianteId: estudiantesInsertados[1].id, cantidad: 1.8, tipoMaterial: 'Papel', fecha: new Date() },
      { estudianteId: estudiantesInsertados[2].id, cantidad: 3.2, tipoMaterial: 'Vidrio', fecha: new Date() },
      { estudianteId: estudiantesInsertados[3].id, cantidad: 1.5, tipoMaterial: 'Metal', fecha: new Date() },
      { estudianteId: estudiantesInsertados[4].id, cantidad: 2.1, tipoMaterial: 'Plástico', fecha: new Date() }
    ]);
    
    console.log('Datos de ejemplo insertados correctamente');
  } catch (error) {
    console.error('Error insertando datos de ejemplo:', error);
  }
}