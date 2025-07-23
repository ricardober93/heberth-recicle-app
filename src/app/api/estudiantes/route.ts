import { NextRequest, NextResponse } from 'next/server';
import { getAllEstudiantes, createEstudiante } from '../../../models/estudiante';

export async function GET() {
  try {
    const estudiantes = await getAllEstudiantes();
    return NextResponse.json(estudiantes);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los estudiantes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, apellido, salonId } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    if (!apellido || !apellido.trim()) {
      return NextResponse.json(
        { error: 'El apellido es requerido' },
        { status: 400 }
      );
    }

    if (!salonId || isNaN(parseInt(salonId))) {
      return NextResponse.json(
        { error: 'El salón es requerido' },
        { status: 400 }
      );
    }

    const nuevoEstudiante = await createEstudiante({ 
      nombre: nombre.trim(), 
      apellido: apellido.trim(),
      salonId: parseInt(salonId) 
    });
    return NextResponse.json(nuevoEstudiante[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    return NextResponse.json(
      { error: 'Error al crear el estudiante' },
      { status: 500 }
    );
  }
}