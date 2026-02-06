-- Lush Secret Database Schema
-- MVP Version 1.0

-- Enum for user roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT', 'GUEST');

-- Enum for order status
CREATE TYPE order_status AS ENUM ('PENDING', 'PAYMENT_CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- Enum for shipment status
CREATE TYPE shipment_status AS ENUM ('PREPARING', 'SHIPPED', 'DELIVERED');

-- Enum for payment status
CREATE TYPE payment_status AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED');

-- ============= USERS TABLE =============
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(20),
  role user_role DEFAULT 'CLIENT',
  oauth_provider VARCHAR(50), -- 'google', 'facebook', etc
  oauth_id VARCHAR(255),
  passwordless_token VARCHAR(255), -- Para código de 6 dígitos
  passwordless_expires_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_oauth UNIQUE (oauth_provider, oauth_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

-- ============= CATEGORIES TABLE =============
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ============= PRODUCTS TABLE =============
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0, -- Cantidad vendida
  main_image_url VARCHAR(500),
  created_by_admin_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_admin_id) REFERENCES users(id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);

-- ============= USERS TABLE (Direcciones de envío) =============
CREATE TABLE user_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  city VARCHAR(255),
  state VARCHAR(255),
  postal_code VARCHAR(20),
  street_address TEXT,
  apartment_number VARCHAR(50),
  notes TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);

-- ============= CARTS TABLE =============
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_cart UNIQUE (user_id)
);

CREATE INDEX idx_carts_user ON carts(user_id);

-- ============= CART_ITEMS TABLE =============
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- ============= ORDERS TABLE =============
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  status order_status DEFAULT 'PENDING',
  payment_method VARCHAR(50), -- 'PSE', 'NEQUI', 'CREDIT_CARD'
  shipping_address_id INTEGER,
  reference_number VARCHAR(255) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shipping_address_id) REFERENCES user_addresses(id)
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_reference ON orders(reference_number);

-- ============= ORDER_ITEMS TABLE =============
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name VARCHAR(255), -- Snapshot del nombre
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============= PAYMENTS TABLE =============
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'COP',
  status payment_status DEFAULT 'PENDING',
  transaction_id VARCHAR(255),
  payu_response JSONB, -- Guardar respuesta completa de PayU
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT unique_order_payment UNIQUE (order_id)
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============= SHIPMENTS TABLE =============
CREATE TABLE shipments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  guide_number VARCHAR(255) UNIQUE,
  carrier VARCHAR(100), -- '4-72', 'SERVIENTREGA', etc
  status shipment_status DEFAULT 'PREPARING',
  estimated_delivery_date DATE,
  tracking_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT unique_order_shipment UNIQUE (order_id)
);

CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_guide ON shipments(guide_number);
CREATE INDEX idx_shipments_status ON shipments(status);

-- ============= EMAIL LOGS TABLE =============
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  email_to VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  type VARCHAR(100), -- 'WELCOME', 'PAYMENT_CONFIRMED', 'SHIPMENT_UPDATE', etc
  order_id INTEGER,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50), -- 'SENT', 'FAILED', 'BOUNCED'
  error_message TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX idx_email_logs_user ON email_logs(user_id);
CREATE INDEX idx_email_logs_order ON email_logs(order_id);
CREATE INDEX idx_email_logs_sent ON email_logs(sent_at);

-- ============= PRODUCT_SIZES TABLE (Tallas de productos) =============
CREATE TABLE product_sizes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  size VARCHAR(50) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT unique_product_size UNIQUE (product_id, size)
);

CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);

-- ============= Initial Categories =============
INSERT INTO categories (name, slug, description) VALUES
('Línea Íntima', 'linea-intima', 'Prendas íntimas cómodas y elegantes'),
('Smart Pleasure', 'smart-pleasure', 'Dispositivos inteligentes para placer'),
('Lub & Care', 'lub-care', 'Lubricantes y productos de cuidado'),
('Power Up', 'power-up', 'Productos con potencia y rendimiento'),
('Zona Fetish', 'zona-fetish', 'Accesorios para exploración fetichista');

-- ============= Create default admin user (password will be set via API) =============
-- Email: admin@lushsecret.co
-- Password: Para ser generada por el admin en primer login
INSERT INTO users (email, name, role, is_verified) VALUES
('admin@lushsecret.co', 'Admin LushSecret', 'ADMIN', TRUE);

-- ============= Create triggers for updated_at =============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_sizes_updated_at BEFORE UPDATE ON product_sizes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
