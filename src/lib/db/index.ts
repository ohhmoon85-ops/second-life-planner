import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Vercel Serverless / Edge 환경에서 커넥션 풀 없이 HTTP로 연결
const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema })
