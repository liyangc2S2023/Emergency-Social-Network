const User = require('../model/user');

class JoinController {
  static async join(username, password) {
    // apply basic rule check when people hit join button.
    const { successflag, joinErr } = User.nameRuleCheck(username, password);
    const usernameExistsCheck = await User.usernameExists(username);
    const flag = successflag && usernameExistsCheck.successFlag;
    if (usernameExistsCheck.err) joinErr.push(usernameExistsCheck.err);
    return { flag, joinErr };
  }

  async confirmJoin(username, password) {
    const { successflag, joinErr } = await this.join(username, password);
    await User.createUser(username, password);
    return { successflag, joinErr };
  }
}

// Singleton
const joinController = new JoinController();

module.exports = joinController;
