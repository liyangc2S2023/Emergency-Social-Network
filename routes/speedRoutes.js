const express = require('express');
const createError = require('http-errors');
// const config = require('../config');

const router = express.Router();
const speedRecordController = require('../controller/speedController');
const Result = require('./common/result');
const SuspendFlag = require('./common/suspendFlag');

// authenticate user role, can only visited by admin
router.use(async (req, res, next) => {
  // will be enabled in iteration 5
  // const role = req.role
  // if(role != config.USER_ROLE.ADMIN){
  //     next(createError(401, `${req.username} is not authorized to speed test`));
  // }
  // else{
  next();
  // }
});

router.post('/', async (req, res, next) => {
    // start test
    await speedRecordController.startTest(req.body.testID);
    // response the result when test finish
    res.send(Result.success());
});

router.delete('/', async (req, res, next) => {
  if (SuspendFlag.getInstance().isSuspend) {
    // stop speed test
    await speedRecordController.stopTest();
    res.send(new Result(200, 'stop success'));
  } else {
    next(createError(400, 'normal pages are not suspended'));
  }
});

module.exports = router;
