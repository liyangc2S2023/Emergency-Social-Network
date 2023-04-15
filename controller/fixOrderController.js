const FixOrder = require('../model/fixOrder');
const User = require('../model/user');

class FixOrderController {
  static async createFixOrder(sender, comment, address, status) {
    // await User.updateCurrentStatus(username, status);
    return FixOrder.createFixOrder(sender, comment, address, status);
  }

  static async getFixOrderStatus(sender) {
    return FixOrder.getFixOrderStatus(sender);
  }

  static async updateFixOrderByElectrian(sender, helper, status) {
    return FixOrder.updateFixOrderByElectrian(sender, helper, status);
  }

  static async getUnfixOrders() {
    return FixOrder.getUnfixOrders();
  }

  static async changeRole(username, role) {
    return User.updateRole(username, role);
  }

  static async getUserRole(username) {
    return User.getUserRole(username);
  }
}

module.exports = FixOrderController;
