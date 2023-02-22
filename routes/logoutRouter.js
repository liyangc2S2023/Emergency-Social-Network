const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();
const pug = require('pug')

router.get('/', async function (req, res, next) {
    var username = req.username
    // clear user states
    await userController.logout(username)
    // clear cookie
    res.clearCookie('user_token')
    res.status(200)
    // render welcome
    res.redirect('/welcome')

    var userList = await userController.getAll();
    var userListHTML = pug.renderFile('./views/directory.pug', {users:userList})
    req.io.emit('userlistChange', userListHTML)
});

module.exports = router;
