const express = require('express');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('welcome');
});

router.get('/', async function (req, res) {
    res.render('join_community');
});


module.exports = router;