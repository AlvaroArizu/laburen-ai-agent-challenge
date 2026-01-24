-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL,
  tipo_prenda TEXT,
  talla TEXT,
  color TEXT,
  categoria TEXT,
  disponible INTEGER NOT NULL DEFAULT 1
);

-- PRICE TIERS (extra, suma puntos)
CREATE TABLE IF NOT EXISTS product_price_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  min_qty INTEGER NOT NULL,
  price INTEGER NOT NULL,
  UNIQUE(product_id, min_qty),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

-- CARTS (1 por conversación)
CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  qty INTEGER NOT NULL CHECK(qty > 0),
  UNIQUE(cart_id, product_id),
  FOREIGN KEY(cart_id) REFERENCES carts(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS request_logs (
  id TEXT PRIMARY KEY,
  ts TEXT NOT NULL,
  source TEXT NOT NULL,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  tool TEXT,
  conversation_id TEXT,
  ok INTEGER NOT NULL,
  status INTEGER,
  duration_ms INTEGER NOT NULL,
  error_code TEXT,
  input_preview TEXT,
  output_preview TEXT
);

CREATE INDEX IF NOT EXISTS idx_request_logs_ts ON request_logs(ts);
CREATE INDEX IF NOT EXISTS idx_request_logs_source ON request_logs(source);
CREATE INDEX IF NOT EXISTS idx_request_logs_conv ON request_logs(conversation_id);
