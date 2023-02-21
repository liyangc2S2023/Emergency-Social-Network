const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();


router.get('/', async function (req, res) {
    var userList = await userController.getAll();
    res.render('mainPage', {pageView:"Directory", users:userList})
});

module.exports = router;