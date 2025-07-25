import { db } from '../src/utils/db';
import { user } from '../src/models/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
  try {
    const adminEmail = 'admin@reciclaje.com';
    
    // Check if admin user already exists
    const existingUser = await db.select().from(user).where(eq(user.email, adminEmail)).limit(1);
    
    if (existingUser.length > 0) {
      // Update existing user to admin
      await db.update(user)
        .set({ role: 'admin' })
        .where(eq(user.email, adminEmail));
      
      console.log('✅ Usuario existente actualizado a rol admin:', adminEmail);
    } else {
      console.log('❌ No se encontró usuario con email:', adminEmail);
      console.log('\n📝 Para crear un usuario administrador:');
      console.log('1. Ve a http://localhost:3000/auth/signup');
      console.log('2. Registra un usuario con email: admin@reciclaje.com');
      console.log('3. Ejecuta este script nuevamente: npm run create-admin');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();