const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const swaggerUi  = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

require('./config/passport');

const authRouter = require('./routes/auth.routes');
const usersRouter = require('./routes/users.routes');
const productsRouter = require('./routes/products.routes');
const cartRouter = require('./routes/cart.routes');
const checkoutRouter = require('./routes/checkout.routes');
const ordersRouter = require('./routes/orders.routes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Allow the frontend origin to send credentialed requests (session cookies).
// CLIENT_ORIGIN is set in the Render dashboard for production; in local dev the
// Vite proxy makes everything same-origin so CORS is not exercised at all.
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // Cookies sent cross-origin (frontend on a different Render subdomain) require
    // SameSite=None + Secure. Locally the Vite proxy makes requests same-origin so
    // 'strict' is fine and avoids needing HTTPS in dev.
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/orders', ordersRouter);

// Swagger UI — served outside /api so it doesn't go through the API routers.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

module.exports = app;
