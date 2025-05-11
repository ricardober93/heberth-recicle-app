
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '@/db/client';
import { user as userSchema} from '@/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';



export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    console.log(username, password);
    
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const [user] = await db.select().from(userSchema).where(eq(userSchema.username, username));
    
    console.log(user);
    
    
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(passwordMatch);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    return NextResponse.json({ token });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } 
}