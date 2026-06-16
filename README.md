# E-Commerce REST API

A backend REST API for an e-commerce application, built with Express, Node.js, and PostgreSQL. Supports user registration and login, product management, shopping carts, checkout, and orders. The API is documented with Swagger.

This is a Codecademy Full Stack Engineer portfolio project. A future project will build a client on top of this API.

## Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (accessed via `pg`)
- **Auth:** `express-session` with cookies, Passport local strategy, password hashing with `bcrypt`
- **Validation:** to be decided during implementation (e.g. `express-validator`)
- **Docs:** Swagger (`swagger-ui-express` + `swagger-jsdoc`)
- **Dev:** `nodemon`, `dotenv`

## Architecture

A layered structure keeps routing, business logic, and data access separate (SOLID — single responsibility per layer):

```
src/
  app.js              # Express app config (middleware, session, routes mount)
  server.js           # Entry point — starts the HTTP server
  db/
    pool.js           # PostgreSQL connection pool
    schema.sql        # Table definitions
    seed.sql          # Optional seed data for local dev
  config/
    passport.js       # Passport local strategy + serialize/deserialize
    swagger.js        # Swagger config
  middleware/
    isAuthenticated.js # Route guard
    errorHandler.js    # Centralized error handling
  routes/
    auth.routes.js
    users.routes.js
    products.routes.js
    cart.routes.js
    orders.routes.js
  controllers/        # Request/response handling per resource
  services/           # Business logic, talks to the data layer
  data/               # SQL queries per resource (data access layer)
.env                  # Secrets and config (gitignored)
.env.example          # Template showing required env vars
.gitignore
package.json
```

You can collapse controllers/services/data into fewer layers if it feels heavy for the scope — but keeping data access out of route handlers is worth doing.

## Local setup

1. Install dependencies: `npm install`
2. Create the database: `createdb ecommerce` (or via `psql`)
3. Run the schema: `psql -d ecommerce -f src/db/schema.sql`
4. Copy `.env.example` to `.env` and fill in values
5. Start dev server: `npm run dev`

## Environment variables

See `.env.example`. At minimum:

- `PORT`
- `DATABASE_URL` (or individual `PG*` vars)
- `SESSION_SECRET`

## API documentation

Once running, Swagger UI is served at `/api-docs`.

## Project task tracker

- [ ] Plan the database (see `DATABASE.md`)
- [ ] Plan API endpoints (see `API_PLAN.md`)
- [ ] Set up Express server
- [ ] Set up version control (Git init, first commit)
- [ ] Create PostgreSQL database and tables
- [ ] Connect the app and database
- [ ] Set up user registration
- [ ] Set up local login (sessions)
- [ ] Set up product endpoints (CRUD)
- [ ] Set up user endpoints (CRUD)
- [ ] Set up cart endpoint (CRUD)
- [ ] Set up checkout endpoint
- [ ] Set up order endpoints (CRUD)
- [ ] Document the API with Swagger

## Notes

- Checkout assumes all charges succeed (no real payment processing yet), but still includes error handling for failure cases.
- Passwords are never stored in plain text — hash with bcrypt on registration, compare on login.
