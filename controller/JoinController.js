const User = require("../model/user")

class JoinController{
 
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
