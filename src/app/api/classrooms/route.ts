import db from '@/db/client';
import { classroom as classroomSchema } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';


// Add finally block to disconnect prisma client
async function handleRequest(request: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) {
  try {
    return await handler(request);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } 
}

import { authMiddleware } from '../../../middleware/auth';

export const GET = authMiddleware(async (request: NextRequest) => {
  return handleRequest(request, async () => {
    const classrooms = await db.select().from(classroomSchema);
    return NextResponse.json(classrooms);
  });
})

export const POST = authMiddleware(async (request: NextRequest) => {
  return handleRequest(request, async (req) => {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Classroom name is required' }, { status: 400 });
    }

    const [newClassroom] = await db.insert(classroomSchema).values({
      name,
    }).returning();
    
    return NextResponse.json(newClassroom, { status: 201 });
  });
})