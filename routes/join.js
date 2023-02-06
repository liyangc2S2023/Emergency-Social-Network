const express = require('express');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('join_community');
});
router.post('/', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log(username);
    res.render('new_user_create');
});

module.exports = router;