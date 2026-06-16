-- schema.sql
-- Defines the database structure for the e-commerce API.
-- Run once against an empty database: psql -U postgres -d ecommerce -f src/db/schema.sql
--
-- Table creation order matters — a table must exist before it can be referenced
-- as a foreign key. Dependency order: users, products → carts, orders → cart_items, order_items.
--
-- ON DELETE behavior:
--   CASCADE   — deleting a parent row also deletes its children (e.g. deleting a user deletes their cart)
--   SET NULL  — deleting a parent sets the foreign key to NULL instead (used on order_items.product_id
--               so historical orders survive product deletions)


-- Users
-- Stores account credentials. password_hash holds a bcrypt hash — never plain text.
-- Each user gets one cart (created at registration) and can have many orders.
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Products
-- The store catalogue. price uses NUMERIC (not FLOAT) to avoid floating-point rounding errors with money.
-- stock tracks available inventory; CHECK constraints prevent negative prices or stock counts.
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Carts
-- Each user has exactly one active cart (enforced by UNIQUE on user_id).
-- Cart items are stored separately in cart_items. Deleting a user cascades to their cart.
CREATE TABLE carts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Cart Items
-- One row per product in a cart. UNIQUE (cart_id, product_id) prevents duplicate product rows —
-- adding the same product again should increment quantity, not insert a second row.
-- Deletes cascade from both the parent cart and the product.
CREATE TABLE cart_items (
  id         SERIAL PRIMARY KEY,
  cart_id    INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  UNIQUE (cart_id, product_id)
);


-- Orders
-- Created at checkout from the contents of a cart. total is computed and stored at
-- checkout time so it doesn't change if product prices change later.
-- status tracks the order lifecycle: pending → paid → shipped → cancelled.
CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     VARCHAR(20) NOT NULL DEFAULT 'pending',
  total      NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Order Items
-- A snapshot of what was in the cart at checkout. product_name and unit_price are copied
-- from the product at purchase time so historical orders are unaffected by future price changes.
-- product_id is nullable (SET NULL) so deleting a product doesn't erase order history.
CREATE TABLE order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  unit_price   NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity     INTEGER NOT NULL CHECK (quantity > 0)
);
