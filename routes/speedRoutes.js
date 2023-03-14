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

router.get('/', async (req, res) => res.send(Result.success(await speedRecordController.get())));

router.post('/', async (req, res, next) => {
  if(typeof req.body.duration !== 'number' || typeof req.body.interval !== 'number'){
    next(createError(400,"duration and interval should be number"))
  }
  else{
    // start test
    await speedRecordController.startTest(req, req.body.duration * 1000, req.body.interval);
    // response the result when test finish
    const responseInterval = setInterval(async () => {
      if (!SuspendFlag.getInstance().isSuspend) {
        // method1 sync:  wait until test finish
        clearInterval(responseInterval);
        // todo: give right response
        res.send(Result.success({
          exitStatus: SuspendFlag.getInstance().exitStatus,
          postPerformance: SuspendFlag.getInstance().postPerformance,
          getPerformance: SuspendFlag.getInstance().getPerformance,
        }));
        // todo: method 2 async: use socket send to client
        // req.io.emit("test finish",result)
      }
    }, 1000);
    // method 2:
    // res.send("start speed test")
  }

});

router.delete('/', async (req, res, next) => {
  if (SuspendFlag.getInstance().isSuspend) {
    // stop speed test
    await speedRecordController.stopTest(2);
    res.send(new Result(200, 'stop success'));
  } else {
    next(createError(400, 'normal pages are not suspended'));
  }
});

module.exports = router;
