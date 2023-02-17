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
        return User.nameRuleCheck(username, password) && User.usernameExists(username)
    }

    async confirmJoin(res,username,password){
        return User.confirmJoin(username, password)  
    }
}

const joinController=new JoinController()

module.exports=joinController
