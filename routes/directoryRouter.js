const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();
const pug = require('pug')

router.get('/', async function (req, res) {
    var userList = await userController.getAll();
    res.render('mainPage', {pageView:"Directory", users:userList})

    var userListHTML = pug.renderFile('./views/directory.pug', {users:userList})
    req.io.emit('userlistChange', userListHTML)
});

module.exports = router;
