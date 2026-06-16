# API Endpoint Plan

All endpoints are prefixed with `/api`. Responses are JSON. Auth uses a session cookie set at login; protected routes require an authenticated session.

**Auth column legend:** Public = no login needed · Auth = must be logged in · Self/Owner = must be the authenticated user acting on their own resource.

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a new user account |
| POST | `/api/auth/login` | Public | Log in, establish session |
| POST | `/api/auth/logout` | Auth | Destroy session |
| GET | `/api/auth/me` | Auth | Return the current logged-in user |

Registration hashes the password with bcrypt and creates the user's empty cart. Login uses Passport's local strategy.

## Products

Reading products is public (a storefront should be browsable). Creating, updating, and deleting are write operations — for this project they can require auth; an admin role is a reasonable later enhancement.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List products (consider pagination, search, category filter) |
| GET | `/api/products/:id` | Public | Get one product |
| POST | `/api/products` | Auth | Create a product |
| PUT | `/api/products/:id` | Auth | Update a product |
| DELETE | `/api/products/:id` | Auth | Delete a product |

## Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users/:id` | Self/Owner | Get a user account |
| PUT | `/api/users/:id` | Self/Owner | Update account (email, password, etc.) |
| DELETE | `/api/users/:id` | Self/Owner | Delete account |

A user should only be able to read or modify their own account. Never return `password_hash` in any response.

## Cart

The cart belongs to the logged-in user, so the user id comes from the session rather than the URL. Operations target the current user's cart.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | Auth | Get current user's cart with items |
| POST | `/api/cart/items` | Auth | Add a product to the cart (or increment quantity) |
| PUT | `/api/cart/items/:productId` | Auth | Update quantity of a cart item |
| DELETE | `/api/cart/items/:productId` | Auth | Remove an item from the cart |
| DELETE | `/api/cart` | Auth | Empty the cart |

## Checkout

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/checkout` | Auth | Convert the current cart into an order |

Checkout flow (wrap in a single DB transaction):
1. Load the current user's cart and its items. Reject if empty.
2. Optionally validate stock for each item.
3. Create an `orders` row with the computed total and status `pending`.
4. Copy each cart item into `order_items`, snapshotting `product_name` and `unit_price`.
5. Assume the charge succeeds — set status to `paid`. Still handle the failure path: on any error, roll back the transaction and return an appropriate error.
6. Clear the cart.
7. Return the created order.

## Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/orders` | Auth | List the current user's orders |
| GET | `/api/orders/:id` | Self/Owner | Get one order with its items |
| PUT | `/api/orders/:id` | Self/Owner | Update an order (e.g. status, cancel) |
| DELETE | `/api/orders/:id` | Self/Owner | Delete/cancel an order |

A user should only see their own orders.

## Conventions

- **Status codes:** 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Server Error.
- **Errors:** consistent JSON shape, e.g. `{ "error": { "message": "...", "details": [...] } }`. Funnel through the centralized error handler.
- **Validation:** validate and sanitize input before it reaches the data layer.
- **Auth failures:** 401 when not logged in, 403 when logged in but not permitted.
