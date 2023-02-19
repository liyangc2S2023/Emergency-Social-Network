const express = require('express');
const router = express.Router();


router.get('/', async function (req, res) {
    res.render('directory')
});

module.exports = router;