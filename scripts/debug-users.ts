import { db } from '../src/utils/db';
import { user } from '../src/models/schema';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');
    
    // Get all users
    const allUsers = await db.select().from(user);
    
    console.log(`\n📊 Total de usuarios encontrados: ${allUsers.length}`);
    
    if (allUsers.length === 0) {
      console.log('\n❌ No hay usuarios en la base de datos.');
      console.log('\n📝 Para crear un usuario administrador:');
      console.log('1. Ve a http://localhost:3000/auth/signup');
      console.log('2. Registra un usuario con cualquier email');
      console.log('3. Ejecuta este script nuevamente para ver los usuarios');
    } else {
      console.log('\n👥 Usuarios encontrados:');
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. Email: ${u.email}, Rol: ${u.role || 'sin rol'}, ID: ${u.id}`);
      });
      
      const adminUsers = allUsers.filter(u => u.role === 'admin');
      console.log(`\n👑 Usuarios con rol admin: ${adminUsers.length}`);
      
      if (adminUsers.length === 0) {
        console.log('\n⚠️  No hay usuarios con rol admin.');
        console.log('\n🔧 Para convertir un usuario en admin, ejecuta:');
        console.log('npm run make-admin <email>');
      }
    }
  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
  } finally {
    process.exit(0);
  }
}

debugUsers();