const express = require('express');
const statusController = require('../controller/statusController');
const renderOnePage = require('./common/renderOnePage');

const router = express.Router();

// router.post('/', async (req, res) => {
//   const { status } = req.body;
//   await statusController.updateUserStatus(status.username, status.status);
//   renderOnePage();
// });

module.exports = router;
