import { NextRequest, NextResponse } from 'next/server';
import { getEstudianteById, updateEstudiante, deleteEstudiante } from '../../../../models/estudiante';

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

    const estudiante = await getEstudianteById(idNumber); 
    if (!estudiante) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(estudiante);
  } catch (error) {
    console.error('Error al obtener estudiante:', error);
    return NextResponse.json(
      { error: 'Error al obtener el estudiante' },
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

    const estudianteActualizado = await updateEstudiante(idNumber, { 
      nombre: nombre.trim(), 
      apellido: apellido.trim(),
      salonId: parseInt(salonId) 
    });
    if (!estudianteActualizado || estudianteActualizado.length === 0) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(estudianteActualizado[0]);
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el estudiante' },
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

    const estudianteEliminado = await deleteEstudiante(idNumber);
    if (!estudianteEliminado || estudianteEliminado.length === 0) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Estudiante eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el estudiante' },
      { status: 500 }
    );
  }
}