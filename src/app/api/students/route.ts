import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient} from '@/generated/prisma';

const prisma = new PrismaClient();
// POST /api/students - Create a new student
import { authMiddleware } from '../../../middleware/auth';

export const POST = authMiddleware(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, classroomId } = body;

    if (!name || !classroomId) {
      return NextResponse.json({ error: 'Student name and classroom ID are required' }, { status: 400 });
    }

    // Optional: Check if classroom exists
    const classroomExists = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroomExists) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    const newStudent = await prisma.student.create({
      data: {
        name,
        classroomId,
      },
    });
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
})

// GET /api/students?classroomId=... - Fetch students by classroom
export const GET = authMiddleware(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const classroomId = searchParams.get('classroomId');

  if (!classroomId) {
    return NextResponse.json({ error: 'Classroom ID is required' }, { status: 400 });
  }

  try {
    const students = await prisma.student.findMany({
      where: {
        classroomId: classroomId,
      },
      include: { // Optionally include related data
        recyclingRecords: true,
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
})