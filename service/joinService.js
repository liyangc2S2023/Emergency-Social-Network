const User = require("../model/user")
const jwt = require('jsonwebtoken')
const config = require('../config')
const Authentication = require("./authentication")
const Result=require('../model/result')
const { validateUsername } = require("./authentication")
var bannedName = require('../public/username_exclude.json').name

class JoinService{
    
    /**
     * todo: should not be plain text
     * validate password
     * @param {string} password 
     * @returns if length of password < 4, retrun false
     *          else return false
     */
    static validatePassword(password, joinErr){
        if(!password || password.length<4) {
            joinErr.push("Password must be at least 4 characters long.")
            return false
        }
        return true
    }

    static validateUsername(username, joinErr){
        if(!username || username.length<3) { 
            joinErr.push("Username must be at least 3 characters long.")
            return false
        }
        username=username.toLowerCase()
        // banned name
        if(bannedName.indexOf(username)!=-1) {
            joinErr.push("Current username is banned.")
            return false
        }
        return true
    }

    static nameRuleCheck(username, password) {
        var joinErr = []
        var successflag = true
        successflag = this.validatePassword(password, joinErr) && successflag 
        successflag = this.validateUsername(username, joinErr) && successflag 

        return {successflag, joinErr}
    }

    
    join(username, password) {
        // apply basic rule check when people hit join button.
        return JoinService.nameRuleCheck(username, password)
    }

    async confirmJoin(res,username,password){
        // apply full (with DB check) checks when people comfirm join
        var {successflag, joinErr} = JoinService.nameRuleCheck(username, password)

        if (successflag) {
            // will try to store/read in DB if basic check passed.
            successflag = successflag && await Authentication.validateUsername(username)

            if (!successflag) {
                joinErr.push("Username Already Exists.")
            } else {
                var token=jwt.sign({
                    time:Date(),
                    username:username
                },config.JWT_KEY, {expiresIn:'1d'})
                // todo: learn more about promise
                await User.create({"username":username,"password":Authentication.encrypt(password)})
                res.cookie('user_token',token)
            }
        }
        return {successflag,joinErr}   
    }
}

const joinService=new JoinService()

module.exports=joinService
