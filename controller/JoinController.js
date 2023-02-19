const User = require("../model/user")

class JoinController{

    async login(username, password) {
        //...
        var {successflag, joinErr} = User.nameRuleCheck(username, password)
        if (!successflag) {
            return {successflag, joinErr}
        }

        // check name exist
        var {successflag, userObject} = User.usernameExists(username)

        // user not exist
        if (!successflag) {
            // join function
        } else {
            // verify user password
        }

        return {successflag, userObject}

    }
 
    async join(username, password) {
        // apply basic rule check when people hit join button.
        var {successflag, joinErr} = User.nameRuleCheck(username, password)
        var usernameExistsCheck = await User.usernameExists(username)
        successflag = successflag && usernameExistsCheck.successFlag
        if(usernameExistsCheck.err) joinErr.push(usernameExistsCheck.err)
        return {successflag, joinErr}
    }

    async confirmJoin(username, password,next){
        var {successflag, joinErr} = await this.join(username,password)
        return {successflag:successflag, 
                token:await User.confirmJoin(username, password),
                err: joinErr}
    }
}

const joinController=new JoinController()

module.exports=joinController
