import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationCodeEmail } from '../services/emailService.js';

// Generar JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'lushsecret_jwt_super_secret_2026',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Solicitar código de verificación para registro
export const requestRegisterCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const normalizedEmail = email.toLowerCase();
    const existing = await pool.query('SELECT id, is_verified FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0 && existing.rows[0].is_verified) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    let userId;
    if (existing.rows.length === 0) {
      const insert = await pool.query(
        'INSERT INTO users (email, role, is_verified) VALUES ($1, $2, $3) RETURNING id',
        [normalizedEmail, 'CLIENT', false]
      );
      userId = insert.rows[0].id;
    } else {
      userId = existing.rows[0].id;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      'UPDATE users SET passwordless_token = $1, passwordless_expires_at = $2 WHERE id = $3',
      [code, expiresAt, userId]
    );

    await sendVerificationCodeEmail(normalizedEmail, code);

    res.json({ message: 'Verification code sent' });
  } catch (err) {
    console.error('Request register code error:', err);
    res.status(500).json({ message: 'Error sending verification code', error: err.message });
  }
};

// REGISTRO (con código)
export const register = async (req, res) => {
  try {
    const { email, password, name, code } = req.body;

    if (!email || !password || !name || !code) {
      return res.status(400).json({ message: 'Email, password, name and code are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await pool.query('SELECT id, is_verified, passwordless_token, passwordless_expires_at FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Verification code not requested' });
    }

    if (existing.rows[0].is_verified) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const { passwordless_token, passwordless_expires_at, id } = existing.rows[0];
    if (!passwordless_token || passwordless_token !== code || !passwordless_expires_at || new Date(passwordless_expires_at) < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired code' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, name = $2, is_verified = TRUE, passwordless_token = NULL, passwordless_expires_at = NULL WHERE id = $3 RETURNING id, email, name, role',
      [hashed, name, id]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ message: 'User registered', token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    if (!user.is_verified) return res.status(403).json({ message: 'Email not verified' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

// Passwordless: solicitar código
export const requestPasswordlessCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    let userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userRes.rows.length === 0) {
      const insert = await pool.query('INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING id', [email.toLowerCase(), 'New User', 'CLIENT']);
      userRes = insert;
    }

    const userId = userRes.rows[0].id;
    await pool.query('UPDATE users SET passwordless_token = $1, passwordless_expires_at = $2 WHERE id = $3', [code, expiresAt, userId]);

    console.log(`Passwordless code for ${email}: ${code}`);
    res.json({ message: 'Passwordless code sent', ...(process.env.NODE_ENV === 'development' && { code }) });
  } catch (err) {
    console.error('Passwordless error:', err);
    res.status(500).json({ message: 'Error sending code', error: err.message });
  }
};

// Verificar código passwordless
export const verifyPasswordlessCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND passwordless_token = $2 AND passwordless_expires_at > NOW()', [email.toLowerCase(), code]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid or expired code' });

    const user = result.rows[0];
    await pool.query('UPDATE users SET passwordless_token = NULL, passwordless_expires_at = NULL WHERE id = $1', [user.id]);

    const token = generateToken(user);
    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Verify passwordless error:', err);
    res.status(500).json({ message: 'Error verifying code', error: err.message });
  }
};

// Perfil
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT id, email, name, phone, role, created_at FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;
    const result = await pool.query('UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3 RETURNING id, email, name, phone, role', [name, phone, userId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated', user: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

// OAuth login/register
export const oauthLogin = async (req, res) => {
  try {
    const { provider, oauthId, email, name } = req.body;

    if (!provider || !oauthId) {
      return res.status(400).json({ message: 'Provider and oauthId are required' });
    }

    const normalizedEmail = email ? email.toLowerCase() : null;

    // Buscar por provider + oauthId
    let userResult = await pool.query(
      'SELECT id, email, name, role FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      [provider, oauthId]
    );

    if (userResult.rows.length === 0 && normalizedEmail) {
      // Buscar por email para vincular
      userResult = await pool.query('SELECT id, email, name, role FROM users WHERE email = $1', [normalizedEmail]);
      if (userResult.rows.length > 0) {
        await pool.query(
          'UPDATE users SET oauth_provider = $1, oauth_id = $2, is_verified = TRUE, name = COALESCE(name, $3) WHERE id = $4',
          [provider, oauthId, name || null, userResult.rows[0].id]
        );
      }
    }

    if (userResult.rows.length === 0) {
      const insert = await pool.query(
        'INSERT INTO users (email, name, role, is_verified, oauth_provider, oauth_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, role',
        [normalizedEmail, name || 'Usuario', 'CLIENT', true, provider, oauthId]
      );
      userResult = insert;
    }

    const user = userResult.rows[0];
    const token = generateToken(user);

    res.json({ message: 'OAuth login successful', token, user });
  } catch (err) {
    console.error('OAuth login error:', err);
    res.status(500).json({ message: 'Error in OAuth login', error: err.message });
  }
};
