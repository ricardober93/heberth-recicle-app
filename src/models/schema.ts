import { pgTable, serial, text, timestamp, integer, real, foreignKey, boolean } from 'drizzle-orm/pg-core';

export const grados = pgTable('grados', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const salones = pgTable('salones', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  gradoId: integer('grado_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    gradoFk: foreignKey({
      columns: [table.gradoId],
      foreignColumns: [grados.id]
    })
  };
});

export const estudiantes = pgTable('estudiantes', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull().default(''),
  salonId: integer('salon_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    salonFk: foreignKey({
      columns: [table.salonId],
      foreignColumns: [salones.id]
    })
  };
});

export const reciclajes = pgTable('reciclajes', {
  id: serial('id').primaryKey(),
  cantidad: real('cantidad').notNull(),
  estudianteId: integer('estudiante_id').notNull(),
  fecha: timestamp('fecha').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    estudianteFk: foreignKey({
      columns: [table.estudianteId],
      foreignColumns: [estudiantes.id]
    })
  };
});

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => true)
    .notNull(),
  image: text('image'),
  role: text('role').notNull().default('user'), // admin, user
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  impersonatedBy: text('impersonated_by'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(
    () => new Date(),
  ),
  updatedAt: timestamp('updated_at').$defaultFn(
    () => new Date(),
  ),
});