import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testAdminLogin() {
  try {
    console.log('🔍 Verificando conexión a Neon...');
    
    // Test conexión
    const testConn = await pool.query('SELECT NOW()');
    console.log('✅ Conectado a Neon:', testConn.rows[0].now);
    
    // Buscar usuario admin
    console.log('\n🔍 Buscando usuario admin...');
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@lushsecret.co']);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario admin NO existe en la base de datos');
      console.log('\n📝 Ejecuta esto en Neon SQL Editor:');
      console.log(`
DELETE FROM users WHERE email = 'admin@lushsecret.co';

INSERT INTO users (email, password_hash, name, role, is_verified)
VALUES ('admin@lushsecret.co', '$2a$10$WoOKU/yIcr6GH63Z/bkwSOjvsx7ON/cCa7UyglU6swslnDkcTJRme', 'Admin', 'ADMIN', true);
      `);
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ Usuario encontrado:');
    console.log('   Email:', user.email);
    console.log('   Rol:', user.role);
    console.log('   Verificado:', user.is_verified);
    console.log('   Password hash:', user.password_hash);
    
    // Verificar contraseñas
    console.log('\n🔐 Verificando contraseñas...');
    const pass1 = await bcrypt.compare('admin123', user.password_hash);
    const pass2 = await bcrypt.compare('Siempreactivo1$', user.password_hash);
    const pass3 = await bcrypt.compare('Admin123!', user.password_hash);
    
    console.log('   admin123:', pass1 ? '✅ CORRECTA' : '❌ Incorrecta');
    console.log('   Siempreactivo1$:', pass2 ? '✅ CORRECTA' : '❌ Incorrecta');
    console.log('   Admin123!:', pass3 ? '✅ CORRECTA' : '❌ Incorrecta');
    
    if (pass1) {
      console.log('\n✅ Usa: admin@lushsecret.co / admin123');
    } else if (pass2) {
      console.log('\n✅ Usa: admin@lushsecret.co / Siempreactivo1$');
    } else if (pass3) {
      console.log('\n✅ Usa: admin@lushsecret.co / Admin123!');
    } else {
      console.log('\n❌ Ninguna contraseña funciona. Actualiza el usuario en Neon.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Verifica DATABASE_URL en .env');
  } finally {
    await pool.end();
  }
}

testAdminLogin();
