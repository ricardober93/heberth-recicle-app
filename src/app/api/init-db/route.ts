import { NextResponse } from 'next/server';
import { initializeDatabase } from '../../../utils/init-db';

export async function POST() {
  try {
    await initializeDatabase();
    return NextResponse.json({ 
      message: 'Base de datos inicializada correctamente' 
    });
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    return NextResponse.json(
      { error: 'Error al inicializar la base de datos' },
      { status: 500 }
    );
  }
}