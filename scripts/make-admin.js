const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function makeAdmin() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Buscando usuarios en la base de datos...');
    
    // Get all users
    const users = await sql('SELECT id, email, role FROM "user" ORDER BY "createdAt" DESC');
    
    console.log(`\n📊 Total de usuarios: ${users.length}`);
    
    if (users.length === 0) {
      console.log('\n❌ No hay usuarios en la base de datos.');
      console.log('\n📝 Primero debes registrar un usuario en: http://localhost:3000/auth/signup');
      return;
    }
    
    console.log('\n👥 Usuarios encontrados:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Rol: ${user.role || 'user'}`);
    });
    
    // Make the first user admin if no admin exists
    const adminUsers = users.filter(u => u.role === 'admin');
    
    if (adminUsers.length > 0) {
      console.log(`\n✅ Ya existe(n) ${adminUsers.length} usuario(s) admin.`);
      adminUsers.forEach(admin => {
        console.log(`   👑 Admin: ${admin.email}`);
      });
    } else {
      console.log('\n⚠️  No hay usuarios admin. Convirtiendo el primer usuario en admin...');
      
      const firstUser = users[0];
      await sql('UPDATE "user" SET role = $1 WHERE id = $2', ['admin', firstUser.id]);
      
      console.log(`\n✅ Usuario convertido a admin: ${firstUser.email}`);
      console.log('\n🎉 Ahora puedes acceder a las rutas de admin!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeAdmin();