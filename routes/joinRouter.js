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
    successflag, joinErr = joinService.join(username,password)
    console.log("backend result ->")
    console.log(successflag, joinErr)
    if (successflag) {
        res.status(200)
        res.render('join', {joinComfirm:true})
    } else {
        res.status(400)
        res.render('join', {joinErr:joinErr})
    }

});

router.post('/comfirm', async function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    await joinService.comfirmJoin(res,username,password,next)

});

module.exports = router;
