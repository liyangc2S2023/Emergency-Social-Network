const User = require("../model/user")

class JoinController {
    async join(username, password) {
        // apply basic rule check when people hit join button.
        var { successflag, joinErr } = User.nameRuleCheck(username, password)
        var usernameExistsCheck = await User.usernameExists(username)
        // if username exist, check password.
        var loginflag = false;
        if (!usernameExistsCheck.successFlag) {
            var passwordMatch = await User.checkPassword(username, password)
            if (passwordMatch) {
                // if the provided password match the password in db for the username, then login
                loginflag = true;
                return { successflag, joinErr, loginflag };
            }
        }
        successflag = successflag && usernameExistsCheck.successFlag
        if (usernameExistsCheck.err) joinErr.push(usernameExistsCheck.err)
        return { successflag, joinErr, loginflag }
    }

    async confirmJoin(username, password, next) {
        await User.createUser(username, password)
        return await this.join(username, password)
        // return {
        //     successflag: successflag,
        //     token: await User.confirmJoin(username, password),
        //     err: joinErr
        // }
    }
}

const joinController = new JoinController()

module.exports = joinController
