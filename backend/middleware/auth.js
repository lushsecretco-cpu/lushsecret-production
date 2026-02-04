import jwt from 'jsonwebtoken';

// Middleware para verificar token JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // { id, email, role }
    next();
  });
};

// Middleware para autorizar solo admin
export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Middleware para verificar admin vía URL secreta (para panel admin)
export const adminSecretAuth = (req, res, next) => {
  const { adminPath, adminPassword } = req.body;
  
  const expectedPath = process.env.ADMIN_SECRET_PATH || 'secreto-admin-2025';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'adminpass123';

  if (adminPath === expectedPath && adminPassword === expectedPassword) {
    // Crear token JWT para sesión de admin
    const token = jwt.sign(
      { id: 0, email: 'admin@lushsecret.co', role: 'ADMIN' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );
    return res.json({ token, message: 'Admin access granted' });
  }

  res.status(401).json({ message: 'Invalid admin credentials' });
};

// Middleware para validación de errores
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
