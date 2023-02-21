const express = require('express');
const joinController = require('../controller/joinController');
const userController = require('../controller/userController');
const User = require('../model/user');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('join');
});

router.post('/', async function (req, res, next) {
    var username = req.body.username.toLowerCase()
    var password = req.body.password.toLowerCase()
    // scene 1: username exists and user password verified
    // return 200 and render directory
    var loginFlag = await userController.verifyUser(username, password)
    if (loginFlag) {
        var token = await userController.login(username)
        res.cookie('user_token', token, {maxAge:24*60*60*1000})
        res.status(200)
        res.redirect('/directory')
        return
    }

    // if not login, then join community
    // scene 2: username and user password are valid to register
    // scene 3: username and user password are not valid to register
    var { successflag, joinErr } = await joinController.join(username, password)
    if (successflag) {
        res.status(200)
        res.render('join', { joinComfirm: true, username: username, password: password })
    } else {
        res.status(400)
        res.render('join', { joinErr: joinErr })
    }

});

router.post('/confirm', async function (req, res, next) {
    var username = req.body.username.toLowerCase()
    var password = req.body.password.toLowerCase()
    var loginFlag = await userController.verifyUser(username, password)
    if (loginFlag) {
        var token = await userController.login(username)
        res.cookie('user_token', token, {maxAge:24*60*60*1000})
        res.status(200)
        res.redirect('/directory')
        return
    }
    var confirmResult = await joinController.confirmJoin(username, password, next)
    if (confirmResult.successflag) {
        var token = await userController.login(username)
        res.status(200)
        res.cookie('user_token', token, {maxAge:24*60*60*1000})
        res.render('welcomeRules');
    } else {
        res.status(400)
        res.render('join', { joinErr: confirmResult.err, username: username, password: password })
    }
});

module.exports = router;
