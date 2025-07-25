const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function checkDatabase() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    console.log('🔍 Conectando a la base de datos...');
    
    // Query users directly
    const result = await sql('SELECT id, email, role FROM "user" ORDER BY "createdAt" DESC');
    
    console.log(`\n📊 Total de usuarios: ${result.length}`);
    
    if (result.length === 0) {
      console.log('\n❌ No hay usuarios en la base de datos.');
    } else {
      console.log('\n👥 Usuarios encontrados:');
      result.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Rol: ${user.role || 'user'}, ID: ${user.id}`);
      });
      
      const adminUsers = result.filter(u => u.role === 'admin');
      console.log(`\n👑 Usuarios admin: ${adminUsers.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();