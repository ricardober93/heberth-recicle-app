import { NextRequest, NextResponse } from 'next/server';
import { getReciclajeById, updateReciclaje, deleteReciclaje } from '../../../../models/reciclaje';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const reciclaje = await getReciclajeById(id);
    if (!reciclaje) {
      return NextResponse.json(
        { error: 'Reciclaje no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(reciclaje);
  } catch (error) {
    console.error('Error obteniendo reciclaje:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

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

    const reciclajeActualizado = await updateReciclaje(id, {
      cantidad: parseFloat(cantidad),
      estudianteId: parseInt(estudianteId),
      fecha: fecha ? new Date(fecha) : new Date()
    });

    if (!reciclajeActualizado || reciclajeActualizado.length === 0) {
      return NextResponse.json(
        { error: 'Reciclaje no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(reciclajeActualizado[0]);
  } catch (error) {
    console.error('Error actualizando reciclaje:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const reciclajeEliminado = await deleteReciclaje(id);
    if (!reciclajeEliminado || reciclajeEliminado.length === 0) {
      return NextResponse.json(
        { error: 'Reciclaje no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Reciclaje eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando reciclaje:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}