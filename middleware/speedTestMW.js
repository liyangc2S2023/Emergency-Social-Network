const createHttpError = require('http-errors');
const SuspendFlag = require('../routes/common/suspendFlag');

module.exports = (req, res, next) => {
  if (SuspendFlag.getInstance().isSuspend
      && req.headers.testid !== SuspendFlag.getInstance().testID) {
    next(createHttpError(503, 'Website is temporarily suspended'));
  } else {
    next();
  }
};
