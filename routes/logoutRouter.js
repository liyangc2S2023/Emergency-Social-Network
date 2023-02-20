const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();


router.post('/', async function (req, res) {
    var username = req.body.username.toLowerCase();
    // clear user states
    await userController.logout(username)
    // clear cookie
    res.clearCookie('user_token')
    res.status(200)
    // render welcome
    res.redirect('/welcome')
});

module.exports = router;