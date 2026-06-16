// swagger.js — Swagger/OpenAPI documentation configuration.
//
// swagger-jsdoc generates an OpenAPI spec from JSDoc comments written in the route files.
// The spec is then served as an interactive UI by swagger-ui-express (wired up in task 14).
//
// openapi: '3.0.0' — the version of the OpenAPI specification we're following.
// info           — metadata shown at the top of the Swagger UI page.
// servers        — the base URL; routes are documented relative to this.
// apis           — file paths that swagger-jsdoc scans for JSDoc comments.

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'REST API for an e-commerce application',
    },
    servers: [{ url: '/api' }], // all endpoints are prefixed with /api
  },
  apis: ['./src/routes/*.js'], // scan all route files for @swagger JSDoc comments
};

// swaggerJsdoc() reads the route files and builds the OpenAPI spec object.
// This is exported and passed to swagger-ui-express in task 14.
module.exports = swaggerJsdoc(options);
