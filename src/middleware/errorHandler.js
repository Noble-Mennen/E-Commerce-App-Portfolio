// Express recognizes a 4-argument function as an error handler.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.status ? err.message : 'Internal Server Error';
  res.status(status).json({ error: { message } });
}

module.exports = errorHandler;
