import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  integer,
} from 'drizzle-orm/pg-core'

// Auth.js 필수 테이블
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

// @auth/drizzle-adapter v1 requires these exact JS property names
export const accounts = pgTable('accounts', {
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
})

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

// 계산 결과 저장 (로그인 사용자)
export const calculations = pgTable('calculations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),           // 'military' | 'civil' | 'national'
  input: jsonb('input').notNull(),
  result: jsonb('result').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewCalculation = typeof calculations.$inferInsert
export type Calculation = typeof calculations.$inferSelect
