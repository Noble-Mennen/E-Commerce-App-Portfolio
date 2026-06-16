// pool.js — PostgreSQL connection pool.
//
// A connection pool maintains a set of reusable database connections.
// Instead of opening and closing a new connection for every query (which is slow),
// the pool keeps connections open and hands them out to callers as needed.
//
// pg.Pool reads DATABASE_URL from process.env (set by dotenv in server.js).
// Every file in the data layer imports this single shared pool rather than
// creating its own connection.

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g. postgres://user:password@localhost:5432/ecommerce
});

module.exports = pool;
