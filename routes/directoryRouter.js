const express = require('express');

const router = express.Router();
const renderOnePage = require('./common/renderOnePage');

router.get('/', async (req, res) => renderOnePage(req, res, 'Directory'));

module.exports = router;
