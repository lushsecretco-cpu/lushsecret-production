import pool from './db.js';

(async () => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, is_verified, password_hash FROM users WHERE email = $1',
      ['admin@lushsecret.co']
    );
    
    console.log('Admin user:', result.rows[0]);
    console.log('Has password_hash:', !!result.rows[0]?.password_hash);
    console.log('Password hash length:', result.rows[0]?.password_hash?.length);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
})();
