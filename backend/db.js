import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Usar DATABASE_URL si está disponible (Railway/Vercel), sino construir URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'lushsecret'}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  process.exit(1);
});

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

export default pool;

// Función para verificar conexión
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection test passed:', result.rows[0]);
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    return false;
  }
}
