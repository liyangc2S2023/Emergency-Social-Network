const express = require('express');
const loginLogoutController = require('../controller/loginLogoutController');
const router = express.Router();


router.post('/', async function (req, res) {
    var username = req.body.username.toLowerCase();
    // clear user states
    await loginLogoutController.logout(username)
    // clear cookie
    res.clearCookie('token')
    res.status(200)
    // render welcome
    res.render('welcome')
});

module.exports = router;