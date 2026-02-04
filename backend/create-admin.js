import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

(async () => {
  try {
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, name, role, is_verified)
      VALUES ('admin@lushsecret.co', $1, 'Admin LushSecret', 'ADMIN', true)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = $1, role = 'ADMIN', is_verified = true
    `, [hashedPassword]);
    
    console.log('✅ Usuario admin creado/actualizado correctamente');
    console.log('Email: admin@lushsecret.co');
    console.log(`Password: ${adminPassword}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
})();
