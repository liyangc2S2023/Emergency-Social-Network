const express = require('express');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('new_user_create');
});
router.get('/', function (req, res) {
    res.render('welcome_rules');
});

module.exports = router;