// prisma/seed.ts
import { PrismaClient } from './../src/generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  // ¡IMPORTANTE! Usa una contraseña segura y cámbiala a través de variables de entorno en producción.
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123'; 

  // Hashear la contraseña
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
  console.log(`Hashed password for ${adminUsername}`);

  // Verificar si el usuario administrador ya existe
  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    // Crear el usuario administrador si no existe
    const adminUser = await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        // Puedes añadir un rol aquí si lo necesitas, ej: role: 'ADMIN'
      },
    });
    console.log(`Created admin user: ${adminUser.username}`);
  } else {
    console.log(`Admin user '${adminUsername}' already exists. Checking password...`);
    // Opcional: Actualizar la contraseña si el usuario existe pero la contraseña es diferente
    // Esto es útil si cambias la contraseña por defecto en el script
    const passwordMatch = await bcrypt.compare(adminPassword, existingAdmin.password);
    if (!passwordMatch) {
      const updatedAdmin = await prisma.user.update({
        where: { username: adminUsername },
        data: { password: hashedPassword },
      });
      console.log(`Updated password for admin user: ${updatedAdmin.username}`);
    } else {
      console.log(`Password for admin user '${adminUsername}' is up to date.`);
    }
  }

  // Puedes añadir más datos iniciales aquí, como aulas de ejemplo
  // Ejemplo:
  // const classroom1 = await prisma.classroom.upsert({
  //   where: { name: 'Aula 1A' }, // Usa un campo único para la búsqueda
  //   update: {}, // No actualiza nada si ya existe
  //   create: { name: 'Aula 1A' },
  // });
  // console.log(`Created/found classroom: ${classroom1.name}`);

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });