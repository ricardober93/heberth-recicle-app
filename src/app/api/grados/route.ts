import { NextRequest, NextResponse } from 'next/server';
import { getAllGrados, createGrado } from '../../../models/grado';

export async function GET() {
  try {
    const grados = await getAllGrados();
    return NextResponse.json(grados);
  } catch (error) {
    console.error('Error al obtener grados:', error);
    return NextResponse.json(
      { error: 'Error al obtener los grados' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const nuevoGrado = await createGrado({ nombre: nombre.trim() });
    return NextResponse.json(nuevoGrado[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear grado:', error);
    return NextResponse.json(
      { error: 'Error al crear el grado' },
      { status: 500 }
    );
  }
}