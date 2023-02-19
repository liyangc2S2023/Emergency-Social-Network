const express = require('express');
const joinController = require('../controller/joinController');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('join');
});

router.post('/', async function (req, res, next) {
    var username = req.body.username.toLowerCase();
    var password = req.body.password.toLowerCase();
    var {successflag, joinErr} = await joinController.join(username,password)

    // scene 1: user pass not fit rule
    if (successflag) {
        res.status(200)
        res.render('join', {joinComfirm:true,username:username,password:password})
    } else {
        res.status(400)
        res.render('join', {joinErr:joinErr})
    }
    // scene 2: user pass correct
    // return 200 render directory

    // scene 3: user pass mismatch
    // return 400 still render join

    // scene 4: create new user
    // return 200 to join confirm

});

router.post('/confirm', async function (req, res, next) {
    var username = req.body.username.toLowerCase();
    var password = req.body.password.toLowerCase();
    var confirmResult = await joinController.confirmJoin(username,password,next)
    if (confirmResult.successflag) {
        res.status(200)
        res.cookie('user_token',confirmResult.token)
        res.render('welcomeRules');
    } else {
        res.status(400)
        res.render('join', {joinErr:confirmResult.err,username:username,password:password})
    }
});

module.exports = router;
