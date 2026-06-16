# Database Design

PostgreSQL schema for the e-commerce API. The design tracks users, products, each user's active cart, and completed orders. An order is a snapshot of a cart at checkout time.

## Entities and relationships

- A **user** has one active **cart** and many **orders**.
- A **product** can appear in many carts and many orders.
- A **cart** has many **cart_items** (one row per product in the cart).
- An **order** has many **order_items** (a frozen snapshot of what was purchased).

```
users (1) ──── (1) carts
carts (1) ──── (many) cart_items ──── (many→1) products
users (1) ──── (many) orders
orders (1) ──── (many) order_items ──── (many→1) products
```

## Why orders snapshot the data

Cart items reference live products, so the cart always reflects current prices and availability. Order items, by contrast, copy the price and product name at the moment of checkout. If a product's price changes later, the historical order should not change with it. This is a common real-world modeling decision worth being able to explain.

## Tables

### users

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| username | VARCHAR UNIQUE NOT NULL | login identifier |
| email | VARCHAR UNIQUE NOT NULL | |
| password_hash | VARCHAR NOT NULL | bcrypt hash, never plain text |
| created_at | TIMESTAMPTZ DEFAULT now() | |

### products

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR NOT NULL | |
| description | TEXT | |
| price | NUMERIC(10,2) NOT NULL | use NUMERIC, not float, for money |
| stock | INTEGER NOT NULL DEFAULT 0 | |
| created_at | TIMESTAMPTZ DEFAULT now() | |

### carts

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK → users(id) UNIQUE NOT NULL | one active cart per user |
| created_at | TIMESTAMPTZ DEFAULT now() | |

### cart_items

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| cart_id | INTEGER FK → carts(id) NOT NULL | |
| product_id | INTEGER FK → products(id) NOT NULL | |
| quantity | INTEGER NOT NULL CHECK (quantity > 0) | |
| | | UNIQUE (cart_id, product_id) — one row per product per cart |

### orders

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK → users(id) NOT NULL | |
| status | VARCHAR NOT NULL DEFAULT 'pending' | e.g. pending, paid, shipped, cancelled |
| total | NUMERIC(10,2) NOT NULL | computed at checkout |
| created_at | TIMESTAMPTZ DEFAULT now() | |

### order_items

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| order_id | INTEGER FK → orders(id) NOT NULL | |
| product_id | INTEGER FK → products(id) | nullable so deleting a product doesn't erase history |
| product_name | VARCHAR NOT NULL | snapshot |
| unit_price | NUMERIC(10,2) NOT NULL | snapshot of price at purchase |
| quantity | INTEGER NOT NULL CHECK (quantity > 0) | |

## Starter DDL

This is a starting point — refine constraints and indexes as you implement. ON DELETE behavior is chosen to protect order history while keeping carts clean.

```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE carts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
  id         SERIAL PRIMARY KEY,
  cart_id    INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     VARCHAR(20) NOT NULL DEFAULT 'pending',
  total      NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  unit_price   NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity     INTEGER NOT NULL CHECK (quantity > 0)
);
```
