const createHttpError = require('http-errors');
const SuspendFlag = require('../routes/common/suspendFlag');

module.exports = (req, res, next) => {
  if (SuspendFlag.getInstance().isSuspend
      && req.headers.testid !== SuspendFlag.getInstance().testID
      // for test only
      && req.headers.testid !== 'cradmin-1678588926922') {
    next(createHttpError(503, 'Website is temporarily suspended'));
  } else {
    next();
  }
};
