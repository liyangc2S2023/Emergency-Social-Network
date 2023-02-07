const User = require("../model/user")
const jwt = require('jsonwebtoken')
const config = require('../config')
const Authentication = require("./authentication")
const Result=require('../model/result')

class JoinService{
    async join(res,username,password){
        if(!Authentication.validatePassword(password)){
            res.status(400)
            res.render('join', {result: new Result(false,'password error',{prompt:1})})
        }
        else if(!await Authentication.validateUsername(username)){
            res.status(400)
            res.render('join', {result: new Result(false,'username error',{prompt:2})})
        }
        else{
            var token=jwt.sign({
                time:Date(),
                username:username
            },config.JWT_KEY, {expiresIn:'1d'})
            // todo: learn more about promise
            await User.create({"username":username,"password":Authentication.encrypt(password)})
            res.status(200)
            res.cookie('user_token',token)
            res.render('welcomeRules');
        }
    }
}

const joinService=new JoinService()

module.exports=joinService
