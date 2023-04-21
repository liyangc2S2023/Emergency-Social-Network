const Supply = require('../model/supply');

class SupplyController {
  static async createSupply(name, quantity, category, owner) {
    return Supply.createSupply(name, quantity, category, owner);
  }

  static async getAllRemainingSupplies() {
    return Supply.getAllRemainingSupplies();
  }

  // static async getAllSupplies() {
  //   return Supply.getAllSupplies();
  // }

  static async getSupplyById(id) {
    return Supply.getSupplyById(id);
  }

  static async updateSupply(id, name, quantity, category) {
    return Supply.updateSupply(id, name, quantity, category);
  }
}

module.exports = SupplyController;
