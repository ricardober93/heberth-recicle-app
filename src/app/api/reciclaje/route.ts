import { NextRequest, NextResponse } from 'next/server';
import { getAllReciclajes, createReciclaje } from '../../../models/reciclaje';

export async function GET() {
  try {
    const reciclajes = await getAllReciclajes();
    return NextResponse.json(reciclajes);
  } catch (error) {
    console.error('Error obteniendo reciclajes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cantidad, estudianteId, fecha } = body;

    // Validaciones
    if (!cantidad || cantidad <= 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    if (!estudianteId) {
      return NextResponse.json(
        { error: 'El ID del estudiante es requerido' },
        { status: 400 }
      );
    }

    const nuevoReciclaje = await createReciclaje({
      cantidad: parseFloat(cantidad),
      estudianteId: parseInt(estudianteId),
      fecha: fecha ? new Date(fecha) : new Date()
    });

    return NextResponse.json(nuevoReciclaje[0], { status: 201 });
  } catch (error) {
    console.error('Error creando reciclaje:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}