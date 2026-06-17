// checkout.routes.js — Route for the checkout endpoint.
//
// Mounted at /api/checkout in app.js. Auth is required — the checkout
// flow reads the user's identity from the session (req.user.id), never
// from a URL parameter.

const { Router } = require('express');
const isAuthenticated      = require('../middleware/isAuthenticated');
const checkoutController   = require('../controllers/checkout.controller');

const router = Router();

router.post('/', isAuthenticated, checkoutController.checkout);

module.exports = router;
