const express = require('express');
const renderOnePage = require('./common/renderOnePage');
const emergencyRecordController = require('../controller/emergencyRecordController');

const router = express.Router();

router.get('/', async (req, res) => renderOnePage(req, res, 'Map'));

router.get('/initStatus', async (req, res) => {
  emergencyRecordController.getInitStatus(req.username).then((result) => {
    res.send(result);
  });
});

module.exports = router;
