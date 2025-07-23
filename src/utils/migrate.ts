import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './db';

export async function runMigrations() {
  try {
    console.log('Ejecutando migraciones...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migraciones completadas exitosamente');
  } catch (error) {
    console.error('Error ejecutando migraciones:', error);
    throw error;
  }
}