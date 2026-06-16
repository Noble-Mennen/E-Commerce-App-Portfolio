// server.js — Entry point for the application.
// Responsibilities:
//   1. Load environment variables from .env before anything else runs.
//   2. Verify the database is reachable before accepting HTTP traffic.
//   3. Start the HTTP server on the configured port.
//
// Why separate from app.js?
//   app.js builds and exports the Express app (middleware, routes, etc.).
//   server.js is the only place that actually binds a port and starts listening.
//   Keeping them separate makes it easier to test app.js without starting a real server.

require('dotenv').config(); // reads .env and adds each variable to process.env
const app = require('./app');
const pool = require('./db/pool');

const PORT = process.env.PORT || 3000; // fall back to 3000 if PORT is not set in .env

// Test the database connection before starting the server.
// pool.query('SELECT 1') is the simplest possible query — it just checks that
// the pool can reach the database. If it fails, there's no point starting the
// HTTP server, so we log the error and exit with a non-zero code (signals failure).
pool.query('SELECT 1')
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1); // exit code 1 = abnormal termination (0 would mean success)
  });
