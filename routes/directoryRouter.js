const express = require('express');
const User = require('../model/user');
const router = express.Router();


router.get('/', async function (req, res) {
    var userList = User.getAll();
    res.render('directory', userList)
});

module.exports = router;