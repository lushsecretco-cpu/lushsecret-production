import pool from './db.js';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  try {
    console.log('🔍 Verificando estado de la base de datos...');
    
    // Verificar si la tabla users existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    const tablesExist = checkTable.rows[0].exists;
    
    if (!tablesExist) {
      console.log('⚠️  Tablas no encontradas. Ejecutando schema.sql...');
      const schema = fs.readFileSync('./schema.sql', 'utf8');
      await pool.query(schema);
      console.log('✅ Schema creado correctamente');
    } else {
      console.log('✅ Tablas ya existen');
    }
    
    // Verificar si existe usuario admin
    const adminCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@lushsecret.co']
    );
    
    if (adminCheck.rows.length === 0) {
      console.log('⚠️  Usuario admin no encontrado. Creando...');
      const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await pool.query(`
        INSERT INTO users (email, password_hash, name, role, is_verified)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin@lushsecret.co', hashedPassword, 'Admin LushSecret', 'ADMIN', true]);
      
      console.log('✅ Usuario admin creado correctamente');
      console.log('   Email: admin@lushsecret.co');
      console.log(`   Password: ${adminPassword}`);
    } else {
      console.log('✅ Usuario admin ya existe');
    }
    
    console.log('✅ Inicialización de base de datos completada');
  } catch (error) {
    console.error('❌ Error en inicialización:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default initDatabase;
