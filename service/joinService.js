const User = require("../model/user")

class JoinService{
 
    join(username, password) {
        // apply basic rule check when people hit join button.
        return User.nameRuleCheck(username, password)
    }

    async confirmJoin(res,username,password){
        return User.confirmJoin(username, password)  
    }
}

const joinService=new JoinService()

module.exports=joinService
