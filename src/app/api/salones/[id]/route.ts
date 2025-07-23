import { NextRequest, NextResponse } from 'next/server';
import { getSalonById, updateSalon, deleteSalon } from '../../../../models/salon';

export async function GET(
  request: NextRequest,
  { params }: { params:  Promise<{ id: string }>  }
) {
  try {
    const { id } = await params;
    const idNumber = parseInt(id);
    if (isNaN(idNumber)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const salon = await getSalonById(idNumber);
    if (!salon) {
      return NextResponse.json(
        { error: 'Salón no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(salon);
  } catch (error) {
    console.error('Error al obtener salón:', error);
    return NextResponse.json(
      { error: 'Error al obtener el salón' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params:  Promise<{ id: string }>  }
) {
  try {
    const { id } = await params;
    const idNumber = parseInt(id);
    if (isNaN(idNumber)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

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

    const salonActualizado = await updateSalon(idNumber, { 
      nombre: nombre.trim(), 
      gradoId: parseInt(gradoId) 
    });
    if (!salonActualizado || salonActualizado.length === 0) {
      return NextResponse.json(
        { error: 'Salón no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(salonActualizado[0]);
  } catch (error) {
    console.error('Error al actualizar salón:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el salón' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params:  Promise<{ id: string }>  }
) {
  try {
    const { id } = await params;
    const idNumber = parseInt(id);
    if (isNaN(idNumber)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const salonEliminado = await deleteSalon(idNumber);
    if (!salonEliminado || salonEliminado.length === 0) {
      return NextResponse.json(
        { error: 'Salón no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Salón eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar salón:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el salón' },
      { status: 500 }
    );
  }
}