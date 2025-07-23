import { NextRequest, NextResponse } from 'next/server';
import { getGradoById, updateGrado, deleteGrado } from '../../../../models/grado';

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

    const grado = await getGradoById(idNumber);
    if (!grado) {
      return NextResponse.json(
        { error: 'Grado no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(grado);
  } catch (error) {
    console.error('Error al obtener grado:', error);
    return NextResponse.json(
      { error: 'Error al obtener el grado' },
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
    const { nombre } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const gradoActualizado = await updateGrado(idNumber, { nombre: nombre.trim() });
    if (!gradoActualizado || gradoActualizado.length === 0) {
      return NextResponse.json(
        { error: 'Grado no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(gradoActualizado[0]);
  } catch (error) {
    console.error('Error al actualizar grado:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el grado' },
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

    const gradoEliminado = await deleteGrado(idNumber);
    if (!gradoEliminado || gradoEliminado.length === 0) {
      return NextResponse.json(
        { error: 'Grado no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Grado eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar grado:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el grado' },
      { status: 500 }
    );
  }
}