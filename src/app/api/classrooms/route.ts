import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma'; // Corrected import

const prisma = new PrismaClient(); // Instantiate client

// Add finally block to disconnect prisma client
async function handleRequest(request: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) {
  try {
    return await handler(request);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

import { authMiddleware } from '../../../middleware/auth';

export const GET = authMiddleware(async (request: NextRequest) => {
  return handleRequest(request, async () => {
    const classrooms = await prisma.classroom.findMany();
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

    const newClassroom = await prisma.classroom.create({
      data: {
        name,
      },
    });
    return NextResponse.json(newClassroom, { status: 201 });
  });
})