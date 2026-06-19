# E-Commerce App — Claude Context

This file is read automatically by Claude Code at the start of every session. Keep it up to date.

---

## Project overview

A Codecademy Full Stack Engineer portfolio project: a REST API with a React frontend for an e-commerce store called **ShopPort**.

Planning docs are the source of truth for architecture, schema, and endpoints:
- `README.md`
- `DATABASE.md`
- `API_PLAN.md`

---

## Stack

**Backend:** Node.js, Express 5, PostgreSQL (pg), express-session, Passport local strategy, bcrypt, dotenv, swagger-jsdoc, swagger-ui-express  
**Frontend:** React 18, Vite, React Router v6, CSS Modules, native fetch

---

## Architecture

```
routes → controllers → services → data
```

- `src/data/` — SQL only. No business logic, no req/res. Returns raw rows.
- `src/services/` — Business logic and validation. Throws errors with `.status` set. No SQL, no req/res.
- `src/controllers/` — HTTP only. Reads from req, calls service, sends response or calls next(err).
- `src/routes/` — Wires paths to controllers. Applies isAuthenticated middleware to protected routes.

Task 12 (checkout) exception: the data layer receives a `client` parameter for DB transactions instead of using the pool directly.

**Frontend:**
- `client/src/api/` — all fetch calls. Never call fetch directly in components.
- `client/src/context/` — AuthContext and CartContext are the only global state.
- `client/src/hooks/` — custom hooks (e.g. useTheme).
- `client/src/components/` — shared UI pieces.
- `client/src/pages/` — one file per route.

---

## How to run locally

**Terminal 1 — Backend:**
```
cd E-Commerce-App-Portfolio
npm run dev
```
Backend runs on `http://localhost:3000`.

**Terminal 2 — Frontend:**
```
cd E-Commerce-App-Portfolio\client
npm run dev
```
Frontend runs on `http://localhost:5173`. Vite proxies `/api/*` to the backend.

Open `http://localhost:5173` in the browser.

---

## Database

- PostgreSQL database: `ecommerce`
- Connection: `DATABASE_URL` in `.env` (gitignored)
- `.env.example` has the template

Tables: `users`, `products`, `carts`, `cart_items`, `orders`, `order_items`  
Schema matches `DATABASE.md` exactly.

The `products` table has an `image_url VARCHAR(500)` column (nullable) added in Task 16.  
10 seed products exist with real images served from `client/public/images/`.

---

## Completed tasks

### Tasks 1–3 — Planning
`README.md`, `DATABASE.md`, `API_PLAN.md` written.

### Task 4 — Server scaffold
Express app with layered structure. `src/app.js` configures middleware, session, Passport, mounts all routers. `src/server.js` is the entry point.

### Task 5 — Database
All six tables created. Schema matches `DATABASE.md`.

### Task 6 — Database connection
`src/db/pool.js` — pg Pool using `DATABASE_URL`.

### Task 7 — POST /api/auth/register
bcrypt password hash; creates user + empty cart in a single transaction.

### Task 8 — Auth endpoints
Passport LocalStrategy; serialize/deserialize; session cookie; `GET /api/auth/me`.

### Task 9 — Product CRUD
`GET /api/products`, `GET /api/products/:id` — public. POST/PUT/DELETE — auth required. Dynamic SET clause for partial updates.

### Task 10 — User account endpoints
`GET/PUT/DELETE /api/users/:id` — Self/Owner. Ownership check before DB call. bcrypt re-hash on password update. 409 on duplicate email.

### Task 11 — Cart endpoints
All Auth. User identity always from `req.user.id`. ON CONFLICT upsert.

### Task 12 — Checkout
Full DB transaction: validate stock, create order, snapshot items, decrement stock, clear cart.

### Task 13 — Order endpoints
`GET /api/orders`, `GET/PUT/DELETE /api/orders/:id` — Auth and Self/Owner.

### Task 14 — Swagger docs
All endpoints documented. Swagger UI at `/api-docs`.

### Task 15 — Frontend UI (base)
React frontend in `client/`. Pages: Home, ProductDetail, Cart, Checkout, Orders, OrderDetail, Login, Register, Account.

Key decisions:
- AuthContext calls `GET /api/auth/me` on mount to restore sessions across page refresh.
- CartContext watches `user` via useEffect to fetch/clear cart on login/logout.
- ProtectedRoute reads `loading` from AuthContext before redirecting.
- `apiFetch()` always sets `credentials: 'include'`; parses `{ error: { message } }` envelope.
- CSS Modules per component; Amazon-inspired palette (`#131921` header, `#ff9900` accent, `#f0f2f2` body).

### Task 16 — Frontend UI improvements (in progress)
Branch: `feat/frontend-improvements`

**Completed:**

**16a — Product images**
- Added `image_url VARCHAR(500)` column to `products` table (nullable).
- Threaded `image_url` through the full backend stack: `products.data.js` (ALLOWED_COLUMNS + createProduct INSERT), `products.service.js` (createProduct + updateProduct), `products.controller.js` (both handlers).
- Updated `cart.data.js` JOIN to include `p.image_url` so cart items carry the image.
- `ProductCard`, `ProductDetail`, and `Cart` render `<img>` when `image_url` is present; fall back to placeholder div otherwise.
- 10 real product photos stored in `client/public/images/` and wired up via DB `UPDATE`.

**16b — Light/Dark mode toggle**
- `client/src/hooks/useTheme.js` — manages `data-theme` attribute on `<html>`, persists preference to `localStorage`.
- `client/src/index.css` — all color tokens defined as CSS custom properties under `:root` (light) and `[data-theme="dark"]`. Includes `color-scheme` for native browser UI elements.
- Header toggle button calls `useTheme().toggle()`; label switches between "Dark" and "Light".
- All 11 CSS modules updated to use `var(--color-*)` tokens instead of hardcoded values.

**Still to do (Task 16):**
- Admin UI (add/edit/delete products from the browser)
- Toast/snackbar notifications for cart actions
- Mobile layout improvements
- Order cancellation button on Orders and OrderDetail pages
- Better empty states and loading skeletons
- Product category or price-range filter on the Home page

---

## Patterns and conventions

- **Error shape:** `{ error: { message: "..." } }` — always funnelled through `errorHandler.js`
- **Response shape:** wrap the resource — `{ user }`, `{ product }`, `{ order }`, `{ orders }`, etc.
- **Status codes:** 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict
- **Never** return `password_hash` in any response
- Self/Owner routes: compare `req.user.id` against the resource's `user_id` — return 403 (not 404) if they don't match
- DB transactions: acquire client with `pool.connect()`, use BEGIN/COMMIT/ROLLBACK, always `client.release()` in a finally block
- Cart/checkout user identity always comes from `req.user.id`, never from the URL
- Comments: explain WHY, not WHAT. Never reference task numbers in code comments.
- **Line endings:** Every new file must be converted to LF (no BOM) after creation using:
  ```powershell
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  $content = [System.IO.File]::ReadAllText("path/to/file")
  $lfContent = $content -replace "`r`n", "`n"
  [System.IO.File]::WriteAllText("path/to/file", $lfContent, $utf8NoBom)
  ```

---

## Branches

```
chore/database-setup
feat/authentication
feat/products-crud
feat/users-crud
feat/cart-crud
feat/checkout
feat/orders-crud
docs/swagger
feat/frontend
feat/frontend-improvements   ← active branch for Task 16 and beyond
main
```

---

## How to work

- Before doing any work in a session, give a full explanation of what you're doing, why, and why it's supposed to be that way — covering every file you plan to create and the key decisions behind it. Only write code after that explanation is complete.
- Before writing any files for a task, run `git branch` and `git status` to confirm you are on the correct branch with a clean working tree. If the branch is wrong, stop and flag it.
- Work one task at a time, stop and summarize after each, wait before moving on.
- Do not auto-commit — flag when it's a good commit point and provide a suggested title and description.
- Flag any deviations from the planning docs before making them.

---

## First task for next session

**Please run a code review of the `feat/frontend-improvements` branch before any new work begins.**

Compare it against `main` and check for:
1. Correctness — do the image and dark mode features work as described above?
2. Consistency — do all CSS modules use `var(--color-*)` tokens with no hardcoded colours left over?
3. Any regressions introduced in the backend files touched during Task 16a (products.data.js, products.service.js, products.controller.js, cart.data.js).
4. Anything that should be fixed before merging to main.