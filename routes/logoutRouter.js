const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();
const Result = require('../controller/common/result');
const jwt = require("jsonwebtoken");
const config = require('../config');
const { token } = require('morgan');

router.get('/', async function (req, res, next) {
    var username = req.username
    // clear user states
    await userController.logout(username)
    // clear cookie
    res.clearCookie('user_token')
    res.status(200)
    // render welcome
    return res.redirect('/welcome')
});

module.exports = router;