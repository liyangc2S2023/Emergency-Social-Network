const express = require('express');
const joinService = require('../service/joinService');
const Authentication = require('../model/authentication');
const Result = require('../model/result');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('join', {result: new Result(true,'abc',{prompt:0})});
});

router.post('/', async function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    if(!Authentication.validatePassword(password)){
        res.status(400)
        res.render('join', {result: new Result(false,'password error',{prompt:1})})
    }
    else if(!await Authentication.validateUsername(username)){
        res.status(400)
        res.render('join', {result: new Result(false,'username error',{prompt:2})})
    }
    else{
        await joinService.join(res,username,password,next)
    }

});

module.exports = router;
