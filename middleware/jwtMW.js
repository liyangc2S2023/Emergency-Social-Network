const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function (req, res, next) {
  const token = req.cookies.user_token
    || req.headers.authorization;
  if (!token) {
    next(createError(401, 'token required'));
  } else {
    try {
      const decoded = jwt.verify(token, config.JWT_KEY);
      req.username = decoded.username;
      next();
    } catch (err) {
      next(createError(401, `token invalid${err.toString()}`));
    }
  }
};
