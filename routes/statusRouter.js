const express = require('express');
const statusController = require('../controller/statusController');
const renderOnePage = require('./common/renderOnePage');

const router = express.Router();

// maybe we nolonger need this router as we turning into one page app
router.post('/', async (req, res) => {
  const { status } = req.body;
  await statusController.updateUserStatus(status.username, status.status);
  renderOnePage(req, res, 'status');
});

module.exports = router;
