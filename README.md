# 🌸 LushSecret - E-commerce Platform

**Tienda discreta online de lencería y juguetes sexuales**

- **Empresa**: Lush Secret S.A.S
- **NIT**: 902022366-7
- **Teléfono**: +57 3005951133
- **Email**: info@lushsecret.co
- **Dominio**: https://lushsecret.co

---

## 📋 Tabla de Contenidos

1. [Estado del Proyecto](#estado-del-proyecto)
2. [Documentación](#documentación)
3. [Tech Stack](#tech-stack)
4. [Inicio Rápido](#inicio-rápido)
5. [Características](#características)
6. [API Endpoints](#api-endpoints)
7. [Deployment](#deployment)

---

## ✅ Estado del Proyecto

| Componente | Estado | % |
|-----------|--------|---|
| Backend | ✅ Completado | 100% |
| Frontend | ⏳ En Progreso | 0% |
| BD Schema | ✅ Completado | 100% |
| Documentación | ✅ Completada | 100% |
| Deployment | ⏳ Por Hacer | 0% |

**MVP Status**: Backend 100% listo, Frontend en desarrollo

---

## 📚 Documentación

### 👉 **COMIENZA AQUÍ**
- **[INDEX.md](INDEX.md)** - Guía de inicio
- **[QUICK_START.md](QUICK_START.md)** - Setup en 5 minutos

### 📖 Documentación Completa
- **[SETUP_DEPLOYMENT.md](SETUP_DEPLOYMENT.md)** - Guía de deployment
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Próximos pasos
- **[ROADMAP.md](ROADMAP.md)** - Plan del proyecto
- **[STATUS_REPORT.md](STATUS_REPORT.md)** - Estado detallado

---

## 🛠️ Tech Stack

```
Frontend:     Next.js 14 + React + Tailwind CSS + DaisyUI
Backend:      Express.js + PostgreSQL + Node.js 18+
Auth:         JWT + Passwordless (6 dígitos por email)
Pagos:        PayU (PSE, Nequi, Tarjeta Crédito)
Email:        SendGrid
Storage:      Cloudflare R2 (imágenes)
Hosting:      Railway (Backend) + Vercel (Frontend)
```

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- Git

### Setup Local (5 minutos)

```bash
# 1. Clonar y instalar
git clone <repo> && cd lushsecret
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Crear BD
psql -U postgres -c "CREATE DATABASE lushsecret_db;"
psql -U postgres -d lushsecret_db -f backend/schema.sql

# 3. Variables de entorno
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/lushsecret_db
JWT_SECRET=tu_secret_aqui
NODE_ENV=development
PORT=3001

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=tu_secret_aqui

# 4. Ejecutar
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev # Terminal 2

# 5. Acceder
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/health
```

---

## ✨ Características

### 🛍️ Para Clientes
- ✅ Registro e inicio de sesión (Email + Passwordless)
- ✅ Catálogo con 5 secciones (Línea Íntima, Smart Pleasure, Lub & Care, Power Up, Zona Fetish)
- ✅ Carrito de compras
- ✅ Checkout seguro
- ✅ Pago con PayU (PSE, Nequi, Tarjeta)
- ✅ Historial de órdenes
- ✅ Rastreo de envíos
- ✅ Notificaciones por email

### 👨‍💼 Para Administradores
- ✅ Panel admin (URL secreta)
- ✅ Gestión de productos (CRUD)
- ✅ Control de stock
- ✅ Órdenes y estados
- ✅ Estadísticas de ventas
- ✅ Reporte de productos trending

---

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/register                 - Registrarse
POST   /api/auth/login                    - Iniciar sesión
POST   /api/auth/passwordless/request     - Pedir código
POST   /api/auth/passwordless/verify      - Verificar código
GET    /api/auth/profile                  - Mi perfil
PUT    /api/auth/profile                  - Actualizar perfil
```

### Productos
```
GET    /api/products                      - Listar productos
GET    /api/products/trending             - Más vendidos
GET    /api/products/:id                  - Detalle producto
POST   /api/products                      - Crear (admin)
PUT    /api/products/:id                  - Editar (admin)
DELETE /api/products/:id                  - Eliminar (admin)
```

### Carrito
```
GET    /api/cart                          - Ver carrito
POST   /api/cart                          - Agregar item
PUT    /api/cart/:itemId                  - Actualizar cantidad
DELETE /api/cart/:itemId                  - Quitar item
DELETE /api/cart                          - Limpiar carrito
```

### Órdenes
```
GET    /api/orders                        - Mis órdenes
GET    /api/orders/:id                    - Detalle orden
POST   /api/orders                        - Crear orden
GET    /api/admin/orders                  - Todas las órdenes (admin)
PUT    /api/admin/orders/:id              - Actualizar estado (admin)
```

### Pagos
```
GET    /api/payments/:orderId             - Información de pago
POST   /api/payments/link/:orderId        - Generar link PayU
POST   /api/payments/payu-webhook         - Webhook PayU (público)
GET    /api/admin/payments                - Todas transacciones (admin)
GET    /api/admin/payments/stats          - Estadísticas (admin)
```

---

## 🔐 Admin Access

**URL Secreta**: `/api/auth/admin-login`

```json
{
  "adminPath": "secreto-admin-2025",
  "adminPassword": "adminpass123"
}
```

---

## 📡 Deployment

### Railway (Backend)
```bash
1. Ir a https://railway.app
2. Conectar GitHub
3. Agregar PostgreSQL
4. Copiar DATABASE_URL
5. Agregar variables de entorno
6. Deploy automático
```

### Vercel (Frontend)
```bash
1. Ir a https://vercel.com
2. Conectar GitHub
3. Agregar NEXT_PUBLIC_API_URL
4. Agregar NEXTAUTH_SECRET
5. Deploy automático
```

Ver [SETUP_DEPLOYMENT.md](SETUP_DEPLOYMENT.md) para detalles completos.

---

## 🗄️ Base de Datos

**Tablas**:
- `users` - Usuarios (clientes y admin)
- `categories` - 5 secciones de tienda
- `products` - Productos con estadísticas
- `carts` - Carritos de compra
- `cart_items` - Items en carrito
- `orders` - Órdenes de compra
- `order_items` - Items en orden
- `payments` - Transacciones PayU
- `shipments` - Seguimiento de envíos
- `email_logs` - Registro de emails

Ver [backend/schema.sql](backend/schema.sql) para DDL completo.

---

## 📊 Estructura del Proyecto

```
lushsecret/
├── backend/
│   ├── controllers/        (Lógica de negocio - 6 archivos)
│   ├── routes/            (Endpoints API - 7 archivos)
│   ├── middleware/        (Auth, validación, CORS)
│   ├── services/          (Email, etc)
│   ├── server.js          (Express principal)
│   ├── db.js              (PostgreSQL)
│   ├── schema.sql         (BD schema)
│   └── package.json
│
├── frontend/
│   ├── app/               (Páginas Next.js)
│   ├── components/        (Componentes React)
│   ├── lib/               (Utilidades)
│   ├── package.json
│   └── next.config.js
│
├── docs/
│   ├── INDEX.md
│   ├── QUICK_START.md
│   ├── SETUP_DEPLOYMENT.md
│   ├── NEXT_STEPS.md
│   ├── ROADMAP.md
│   └── STATUS_REPORT.md
│
└── README.md              (Este archivo)
```

---

## 🎯 Fases de Desarrollo

### Fase 1: MVP (EN PROGRESO) ✅
- Backend: 100% completo
- Frontend: 0% (comenzando)
- Estimated: 2 semanas

### Fase 2: Mejoras (Post-MVP)
- Videos de productos
- Sistema de ofertas automáticas
- Reviews y comentarios
- Analytics avanzado
- Búsqueda avanzada

Ver [ROADMAP.md](ROADMAP.md) para detalles.

---

## 🚨 Troubleshooting

### Backend no conecta a BD
```bash
psql -U postgres -d lushsecret_db -c "SELECT NOW();"
# Si falla, revisar DATABASE_URL en .env
```

### Port 3001 en uso
```bash
# Cambiar en backend/.env
PORT=3002
```

### NextAuth error
```bash
# Regenerar secret
openssl rand -base64 32
# Copiar a NEXTAUTH_SECRET
```

Ver [SETUP_DEPLOYMENT.md](SETUP_DEPLOYMENT.md) para más soluciones.

---

## 📞 Soporte

- **Email**: info@lushsecret.co
- **Teléfono**: +57 3005951133
- **NIT**: 902022366-7

---

## 📄 Licencia

Privada - Lush Secret S.A.S

---

## 📌 Versión

**v1.0.0-beta** - Enero 29, 2026

---

## 🎓 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [PayU Developers](https://developers.payulatam.com)
- [SendGrid Docs](https://sendgrid.com/docs)

---

**¡Gracias por usar Lush Secret!** 🌸



## 🛠️ Stack Tecnológico

### Backend
- **Framework:** Express.js
- **Runtime:** Node.js
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT
- **Email:** Nodemailer
- **Almacenamiento:** AWS S3
- **Upload de archivos:** Multer

### Frontend
- **Framework:** Next.js 14+
- **UI Library:** React 18
- **Gestión de Estado:** Zustand
- **Estilos:** Tailwind CSS
- **HTTP Client:** Axios
- **Iconos:** React Icons

## 📁 Estructura del Proyecto

```
LushSecret/
├── backend/
│   ├── controllers/          # Lógica de negocio
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── paymentController.js
│   │   └── shippingController.js
│   ├── routes/              # Rutas API
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── shippingRoutes.js
│   ├── middleware/          # Autenticación y validaciones
│   │   └── auth.js
│   ├── services/            # Servicios externos
│   │   └── emailService.js
│   ├── db.js               # Conexión a BD
│   ├── migrate.js          # Scripts de migración
│   ├── server.js           # Servidor principal
│   └── package.json
├── frontend/
│   ├── app/                # Páginas y layouts
│   │   ├── admin/
│   │   │   └── orders/     # Panel de administrador
│   │   ├── orders/         # Mis pedidos (cliente)
│   │   ├── tracking/       # Rastreo público
│   │   └── layout.js
│   ├── components/         # Componentes React
│   ├── lib/
│   │   └── apiClient.js    # Cliente API
│   ├── store.js            # Estado global (Zustand)
│   └── package.json
└── .github/
    └── copilot-instructions.md
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Backend

1. **Navega a la carpeta backend:**
```bash
cd backend
npm install
```

2. **Configura las variables de entorno:**
```bash
cp .env.example .env
```

3. **Edita `.env` con tus credenciales:**
```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lushsecret

JWT_SECRET=tu_clave_super_secreta

AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=tu-bucket

WOMPI_API_KEY=tu_wompi_key
FRONTEND_URL=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_contraseña_app
ADMIN_EMAIL=admin@lushsecret.com
```

4. **Ejecuta las migraciones:**
```bash
npm run migrate
```

5. **Inicia el servidor:**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Frontend

1. **Navega a la carpeta frontend:**
```bash
cd frontend
npm install
```

2. **Configura las variables de entorno:**
```bash
# Crear archivo .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Inicia el servidor de desarrollo:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Categorías
- `GET /api/categories` - Listar todas
- `GET /api/categories/:slug` - Obtener por slug
- `POST /api/categories` - Crear (admin)

### Productos
- `GET /api/products` - Listar todos
- `GET /api/products/:id` - Obtener por ID
- `POST /api/products` - Crear (admin)
- `PUT /api/products/:id` - Actualizar (admin)
- `DELETE /api/products/:id` - Eliminar (admin)
- `POST /api/products/upload-media` - Subir fotos/videos (admin)

### Carrito
- `GET /api/cart/:userId` - Obtener carrito
- `POST /api/cart/add` - Agregar item
- `PUT /api/cart/:cartItemId` - Actualizar cantidad
- `DELETE /api/cart/:cartItemId` - Eliminar item
- `DELETE /api/cart/clear/:userId` - Vaciar carrito

### Pagos
- `POST /api/payments/wompi` - Crear pago Wompi
- `POST /api/payments/order` - Crear orden
- `PUT /api/payments/order-status` - Actualizar estado
- `GET /api/payments/orders/:userId` - Órdenes del usuario

### Envíos (Admin)
- `GET /api/shipping/admin/orders` - Listar órdenes
- `PUT /api/shipping/admin/order-status` - Actualizar estado
- `POST /api/shipping/admin/generate-tracking/:orderId` - Generar guía
- `PUT /api/shipping/admin/mark-delivered` - Marcar como entregado
- `GET /api/shipping/track/:trackingNumber` - Rastrear envío (público)

## 📧 Flujo de Emails

### 1. Cuando se confirma un pago:
- **Destinatario:** Admin
- **Contenido:** Detalles completos del pedido, productos y cliente

### 2. Cuando se crea la orden:
- **Destinatario:** Cliente
- **Contenido:** Confirmación de compra, resumen y estado inicial (Preparando)

### 3. Cuando se genera la guía de envío:
- **Destinatario:** Cliente
- **Contenido:** Número de guía, fecha de envío, botón para rastrear

### 4. Cuando se marca como entregado:
- **Destinatario:** Cliente
- **Contenido:** Confirmación de entrega, fecha y agradecimiento

## 🔄 Estados de Pedido

| Estado | Descripción | Acción Admin |
|--------|-------------|-------------|
| **Preparando** | El pedido está siendo preparado en el almacén | Generar Guía y Enviar |
| **Enviado** | El pedido está en camino | Marcar como Recibido |
| **Recibido** | El pedido ha sido entregado | Ninguna (final) |

## 🔐 Seguridad

- ✅ JWT para autenticación stateless
- ✅ Encriptación bcrypt para contraseñas
- ✅ CORS configurado
- ✅ Validación de entrada
- ✅ Variables de entorno protegidas
- ✅ Roles de usuario (cliente, admin)

## 📊 Base de Datos

### Tablas principales:
- `users` - Usuarios del sistema
- `categories` - Categorías de productos
- `products` - Productos con multimedia
- `cart_items` - Items del carrito
- `orders` - Órdenes principales
- `order_items` - Detalles de productos en órdenes

## 🔍 Rastreo de Envíos

### Página pública: `/tracking`
- Permite rastrear sin necesidad de login
- Ingresa número de guía
- Visualiza estado en tiempo real
- Timeline visual del envío

### Panel de cliente: `/orders`
- Histórico completo de compras
- Estado de cada pedido
- Número de guía y detalles
- Botón para rastrear

### Panel de admin: `/admin/orders`
- Todas las órdenes
- Generar guías
- Actualizar estado
- Enviar notificaciones

## 🎓 Uso del Panel Administrativo

1. **Inicia sesión** como admin
2. **Ve a `/admin/orders`** para ver todas las órdenes
3. **Para cada orden en estado "Preparando":**
   - Click en "🚚 Generar Guía y Enviar"
   - Se genera un número de guía único
   - Se envía email al cliente con el número
   - Estado cambia a "Enviado"
4. **Cuando se reciba:**
   - Click en "✅ Marcar como Recibido"
   - Se envía confirmación de entrega al cliente

## 📱 Páginas Principales

### Público
- `/` - Home
- `/tracking` - Rastrear envíos (sin login)

### Cliente
- `/orders` - Mis pedidos
- `/cart` - Carrito de compras

### Admin
- `/admin/orders` - Gestión de pedidos
- `/admin/products` - Gestión de productos
- `/admin/categories` - Gestión de categorías

## 🚀 Deployment

### Variables de entorno necesarias en producción:
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=tu_clave_muy_segura
AWS_ACCESS_KEY_ID=tu_key
AWS_SECRET_ACCESS_KEY=tu_secret
WOMPI_API_KEY=tu_key
SMTP_USER=tu_email
SMTP_PASSWORD=tu_contraseña
ADMIN_EMAIL=admin@email.com
FRONTEND_URL=https://tudominio.com
```

## 📝 Licencia

Proyecto privado - LushSecret © 2025

## 💬 Soporte

Para soporte técnico o reportar bugs, contacta al equipo de desarrollo.

---

**Última actualización:** Enero 2025
