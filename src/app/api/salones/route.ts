import { NextRequest, NextResponse } from 'next/server';
import { getAllSalones, createSalon } from '../../../models/salon';

export async function GET() {
  try {
    const salones = await getAllSalones();
    return NextResponse.json(salones);
  } catch (error) {
    console.error('Error al obtener salones:', error);
    return NextResponse.json(
      { error: 'Error al obtener los salones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, gradoId } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    if (!gradoId || isNaN(parseInt(gradoId))) {
      return NextResponse.json(
        { error: 'El grado es requerido' },
        { status: 400 }
      );
    }

    const nuevoSalon = await createSalon({ 
      nombre: nombre.trim(), 
      gradoId: parseInt(gradoId) 
    });
    return NextResponse.json(nuevoSalon[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear salón:', error);
    return NextResponse.json(
      { error: 'Error al crear el salón' },
      { status: 500 }
    );
  }
}