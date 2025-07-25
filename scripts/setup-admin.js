const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config();

async function setupAdmin() {
  const logFile = 'admin-setup.log';
  
  function log(message) {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
  }
  
  try {
    // Clear previous log
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    log('🔍 Verificando configuración de admin...');
    log('📅 Fecha: ' + new Date().toLocaleString());
    log('');
    
    // Get all users
    const users = await sql`SELECT id, email, role, created_at FROM "user" ORDER BY created_at DESC`;
    
    log(`📊 Total de usuarios en la base de datos: ${users.length}`);
    log('');
    
    if (users.length === 0) {
      log('❌ No hay usuarios en la base de datos.');
      log('');
      log('📝 PASOS PARA CONFIGURAR ADMIN:');
      log('1. Ve a http://localhost:3000/auth/signup');
      log('2. Registra un usuario con cualquier email');
      log('3. Ejecuta este script nuevamente: node scripts/setup-admin.js');
      return;
    }
    
    log('👥 USUARIOS ENCONTRADOS:');
    users.forEach((user, index) => {
      const roleDisplay = user.role || 'user';
      const isAdmin = user.role === 'admin' ? '👑' : '👤';
      log(`${index + 1}. ${isAdmin} ${user.email} (${roleDisplay})`);
    });
    log('');
    
    // Check for admin users
    const adminUsers = users.filter(u => u.role === 'admin');
    
    if (adminUsers.length > 0) {
      log(`✅ CONFIGURACIÓN CORRECTA: ${adminUsers.length} usuario(s) admin encontrado(s)`);
      log('');
      log('👑 ADMINISTRADORES:');
      adminUsers.forEach(admin => {
        log(`   • ${admin.email}`);
      });
      log('');
      log('🎉 El sistema está listo. Puedes acceder a /admin con cualquiera de estos usuarios.');
    } else {
      log('⚠️  NO HAY USUARIOS ADMIN. Configurando automáticamente...');
      log('');
      
      const firstUser = users[0];
      await sql`UPDATE "user" SET role = 'admin' WHERE id = ${firstUser.id}`;
      
      log(`✅ Usuario convertido a administrador: ${firstUser.email}`);
      log('');
      log('🎉 CONFIGURACIÓN COMPLETADA!');
      log('📋 RESUMEN:');
      log(`   • Usuario admin: ${firstUser.email}`);
      log('   • Ahora puedes acceder a http://localhost:3000/admin');
      log('');
      log('🔧 SOLUCIÓN AL PROBLEMA:');
      log('   • El middleware ahora verifica el rol directamente en la base de datos');
      log('   • Se agregaron logs detallados para debugging');
      log('   • El sistema es más robusto ante problemas de sesión');
    }
    
    log('');
    log('📄 Este log se ha guardado en: ' + logFile);
    
  } catch (error) {
    const errorMsg = `❌ ERROR: ${error.message}`;
    log(errorMsg);
    log('📄 Revisa el archivo ' + logFile + ' para más detalles.');
  }
}

setupAdmin();