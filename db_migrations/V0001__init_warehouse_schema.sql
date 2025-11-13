CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  unit VARCHAR(50) NOT NULL,
  weight DECIMAL(10, 2),
  dimensions VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contractors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouse_zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  zone_type VARCHAR(100),
  capacity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouse_cells (
  id SERIAL PRIMARY KEY,
  zone_id INTEGER REFERENCES warehouse_zones(id),
  cell_code VARCHAR(50) UNIQUE NOT NULL,
  row_number INTEGER,
  rack_number INTEGER,
  level_number INTEGER,
  status VARCHAR(50) DEFAULT 'available',
  max_weight DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  cell_id INTEGER REFERENCES warehouse_cells(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  request_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  contractor_id INTEGER REFERENCES contractors(id),
  operator_id INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request_items (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES requests(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  cell_id INTEGER REFERENCES warehouse_cells(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  total_amount DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2)
);

INSERT INTO users (email, password_hash, full_name, role) VALUES 
('admin@skladpro.ru', 'hash123', 'Администратор', 'operator'),
('client@example.com', 'hash456', 'Тестовый клиент', 'client')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categories (name, parent_id) VALUES 
('Электроника', NULL),
('Бытовая техника', NULL),
('Продукты питания', NULL);

INSERT INTO warehouse_zones (name, zone_type, capacity) VALUES 
('Зона А - Приемка', 'receiving', 1000),
('Зона Б - Хранение', 'storage', 5000),
('Зона В - Отгрузка', 'shipping', 800);

INSERT INTO products (sku, name, category_id, unit) VALUES 
('SKU001', 'Ноутбук Dell XPS', 1, 'шт'),
('SKU002', 'Холодильник LG', 2, 'шт'),
('SKU003', 'Кофе Lavazza', 3, 'кг');