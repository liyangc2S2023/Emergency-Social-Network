const express = require('express');
const joinService = require('../service/joinService');
const Authentication = require('../service/authentication');
const Result = require('../model/result');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('join');
});

router.post('/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    var {successflag, joinErr} = joinService.join(username,password)
    if (successflag) {
        res.status(200)
        res.render('join', {joinComfirm:true,username:username,password:password})
    } else {
        res.status(400)
        res.render('join', {joinErr:joinErr})
    }

});

router.post('/confirm', async function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var {successflag,userToken, joinErr} = await joinService.confirmJoin(res,username,password,next)
    console.log(successflag, joinErr)
    if (successflag) {
        res.status(200)
        res.cookie('user_token',userToken)
        res.render('welcomeRules');
    } else {
        res.status(400)
        res.render('join', {joinErr:joinErr,username:username,password:password})
    }
});

module.exports = router;
