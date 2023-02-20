const User = require("../model/user")

class JoinController {
    async join(username, password) {
        // apply basic rule check when people hit join button.
        var { successflag, joinErr } = User.nameRuleCheck(username, password)
        var usernameExistsCheck = await User.usernameExists(username)
        successflag = successflag && usernameExistsCheck.successFlag
        if (usernameExistsCheck.err) joinErr.push(usernameExistsCheck.err)
        return { successflag, joinErr }
    }

    async confirmJoin(username, password) {
        await User.createUser(username, password)
        return await this.join(username, password)
    }
}

const joinController = new JoinController()

module.exports = joinController
