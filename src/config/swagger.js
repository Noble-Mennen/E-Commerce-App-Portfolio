// swagger.js — swagger-jsdoc configuration.
//
// Schemas and reusable responses are defined here in the `definition` object
// so they live in one place. Individual endpoint documentation lives in the
// route files as @swagger JSDoc comments, which swagger-jsdoc merges with
// this definition at startup.

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'REST API for an e-commerce application. Auth is session-based: log in via POST /api/auth/login to receive a session cookie, which is sent automatically on subsequent requests.',
    },
    servers: [{ url: '/api' }],
    components: {

      // --- Security scheme ---
      // The API uses express-session cookies. OpenAPI models this as an
      // apiKey in a cookie. Swagger UI cannot set the cookie for you —
      // use the /auth/login endpoint first, then the browser sends it automatically.
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },

      // --- Schemas ---
      schemas: {
        User: {
          type: 'object',
          properties: {
            id:         { type: 'integer', example: 1 },
            username:   { type: 'string',  example: 'johndoe' },
            email:      { type: 'string',  format: 'email', example: 'john@example.com' },
            created_at: { type: 'string',  format: 'date-time' },
          },
        },

        Product: {
          type: 'object',
          properties: {
            id:          { type: 'integer', example: 1 },
            name:        { type: 'string',  example: 'Wireless Headphones' },
            description: { type: 'string',  example: 'Noise-cancelling over-ear headphones', nullable: true },
            price:       { type: 'number',  format: 'float', example: 79.99 },
            stock:       { type: 'integer', example: 50 },
            created_at:  { type: 'string',  format: 'date-time' },
          },
        },

        // CartItem is the joined shape returned by GET /cart — includes product
        // details pulled from the products table so the client can render the cart
        // without a second request.
        CartItem: {
          type: 'object',
          properties: {
            id:           { type: 'integer', example: 1 },
            product_id:   { type: 'integer', example: 1 },
            quantity:     { type: 'integer', example: 2 },
            product_name: { type: 'string',  example: 'Wireless Headphones' },
            price:        { type: 'number',  format: 'float', example: 79.99 },
            stock:        { type: 'integer', example: 50 },
          },
        },

        Cart: {
          type: 'object',
          properties: {
            id:    { type: 'integer', example: 1 },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/CartItem' },
            },
          },
        },

        Order: {
          type: 'object',
          properties: {
            id:         { type: 'integer', example: 1 },
            user_id:    { type: 'integer', example: 1 },
            status:     { type: 'string',  example: 'paid' },
            total:      { type: 'number',  format: 'float', example: 159.98 },
            created_at: { type: 'string',  format: 'date-time' },
          },
        },

        OrderItem: {
          type: 'object',
          properties: {
            id:           { type: 'integer', example: 1 },
            order_id:     { type: 'integer', example: 1 },
            product_id:   { type: 'integer', example: 1, nullable: true },
            product_name: { type: 'string',  example: 'Wireless Headphones' },
            unit_price:   { type: 'number',  format: 'float', example: 79.99 },
            quantity:     { type: 'integer', example: 2 },
          },
        },

        // OrderWithItems extends Order with the items array — returned by
        // GET /orders/:id and POST /checkout.
        OrderWithItems: {
          allOf: [
            { $ref: '#/components/schemas/Order' },
            {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/OrderItem' },
                },
              },
            },
          ],
        },

        // The standard error envelope used by all error responses.
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Resource not found' },
              },
            },
          },
        },
      },

      // --- Reusable responses ---
      // Each error status code is defined once here and referenced by
      // $ref in route JSDoc blocks, keeping the endpoint docs concise.
      responses: {
        BadRequest: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Unauthorized: {
          description: 'Authentication required — not logged in',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Forbidden: {
          description: 'Access denied — logged in but not the owner of this resource',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Conflict: {
          description: 'Resource already exists (e.g. duplicate username or email)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);