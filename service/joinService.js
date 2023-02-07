const User = require("../model/user")
const jwt = require('jsonwebtoken')
const config = require('../config')
const authentication = require("../model/authentication")

class JoinService{
    async join(res,username,password){
        var token=jwt.sign({
            time:Date(),
            username:username
        },config.JWT_KEY, {expiresIn:'1d'})
        // todo: learn more about promise
        await User.create({"username":username,"password":authentication.encrypt(password)})
        res.status(200)
        res.cookie('user_token',token)
        res.render('rules');
    }
}

const joinService=new JoinService()

module.exports=joinService
