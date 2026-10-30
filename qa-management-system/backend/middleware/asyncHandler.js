// Express 4 doesn't catch rejected promises from async route handlers on its own —
// an unhandled rejection here would just hang the request instead of returning a 500.
// Wrap every controller function in routes/*.js with this.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
