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
