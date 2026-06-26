import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

// Neon requires SSL in production; local dev can skip it
const useSSL = process.env.NODE_ENV === 'production' || 
  (connectionString && connectionString.includes('neon.tech'));

const pool = new Pool({
  connectionString,
  ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {}),
  max: 10,              // max pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
