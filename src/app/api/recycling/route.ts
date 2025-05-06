import { NextRequest, NextResponse } from 'next/server';
import { classroom as classroomSchema, user as userSchema, recyclingRecord as recyclingRecordSchema} from '@/db/schema';
import { eq } from 'drizzle-orm';
import  db  from '@/db/client';

// POST /api/recycling - Create a new recycling record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kilos, studentId } = body;

    if (kilos === undefined || !studentId) {
      return NextResponse.json({ error: 'Kilos and student ID are required' }, { status: 400 });
    }

    if (typeof kilos !== 'number' || kilos < 0) {
      return NextResponse.json({ error: 'Kilos must be a non-negative number' }, { status: 400 });
    }

    // Optional: Check if student exists
    const [studentExists] = await db.select()
      .from(userSchema)
      .where(eq(userSchema.id, studentId))
      


    if (!studentExists) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const kilosFloat = kilos.toString();

    const [newRecord] = await db.insert(recyclingRecordSchema)
      .values({
        kilos: kilosFloat,
        studentId,
      })
      .returning();
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating recycling record:', error);
    return NextResponse.json({ error: 'Failed to create recycling record' }, { status: 500 });
  }
}