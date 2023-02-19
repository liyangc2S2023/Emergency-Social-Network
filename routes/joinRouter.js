const express = require('express');
const joinController = require('../controller/joinController');
const loginLogoutController = require('../controller/loginLogoutController');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('join');
});

router.post('/', async function (req, res, next) {
    var username = req.body.username.toLowerCase();
    var password = req.body.password.toLowerCase();
    var { successflag, joinErr, loginflag } = await joinController.join(username, password)

    // scene 1: username exists and user password verified
    // return 200 and render directory
    if (loginflag) {
        var { token, userList } = await loginLogoutController.login(username)
        res.cookie('user_token', token)
        res.status(200)
        res.render('directory', userList)
    } else {
        // scene 2: username and user password are valid to register
        if (successflag) {
            res.status(200)
            res.render('join', { joinComfirm: true, username: username, password: password })
        } else {
            // scene 3: username and user password are not valid to register
            res.status(400)
            res.render('join', { joinErr: joinErr })
        }
    }
});

router.post('/confirm', async function (req, res, next) {
    var username = req.body.username.toLowerCase();
    var password = req.body.password.toLowerCase();
    var confirmResult = await joinController.confirmJoin(username, password, next)
    if (confirmResult.successflag) {
        var { token, userList } = await loginLogoutController.login(username)
        res.status(200)
        res.cookie('user_token', token,{maxAge:24*60*60*1000})
        res.render('directory', userList);
    } else {
        res.status(400)
        res.render('join', { joinErr: confirmResult.err, username: username, password: password })
    }
});

module.exports = router;
