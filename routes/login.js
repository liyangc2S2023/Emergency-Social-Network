const e = require('express');
const express = require('express');
const { render } = require('pug');
const router = express.Router();
// required for database connection
require('../database');
// required for user model
const User = require('../models/user');
const Authentication = require('../model/authentication')
const Result=require('../model/result')
const jwt = require('jsonwebtoken')
const config = require('../config')

router.get('/', function (req, res) {
    res.render('login',{result:new Result(true,'',{prompt:0})});
});


router.post('/', function (req, res) {
    var password=req.body.password
    var username=req.body.username
    if(!Authentication.validatePassword(password)){
        res.status(400)
        res.render('login',{result: new Result(false,'password error',{prompt:1})})
    }
    else if(!Authentication.validateUsername(username)){
        res.status(400)
        res.render('login',{result: new Result(false,'username error',{prompt:2})})
    }
    else{
        // todo: verify with mongoose
        // const user = await User.findOne({username:username})
        // if(user){
        //     res.status(409)
        //     render('login',{result:new Result(false,'username conflict',{prompt:3})})
        // }
        var token=jwt.sign({
            time:Date(),
            username:username
        },
        config.JWT_KEY, {expiresIn:'1s'})
        res.status(200)
        res.cookie('user_token',token)
        // todo: render next page
        res.render('login',{result: new Result(false,'username error',{prompt:2})})
    }
});

module.exports = router;
