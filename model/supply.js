const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  owner: { type: String, required: true },
});

const SupplyTable = mongoose.model('Supply', supplySchema);

class Supply {
  static async createSupply(name, quantity, category, owner) {
    const newSupply = SupplyTable.create({
      name, quantity, category, owner,
    });
    return newSupply;
  }

  static async getAllsupplies() {
    return SupplyTable.find({});
  }

  static async getAllRemainingSupplies() {
    // reverse the order of the supplies
    return SupplyTable.find({ quantity: { $gt: 0 } }).sort({ name: 1 });
  }

  static async getSupplyById(id) {
    return SupplyTable.findById(id);
  }

  static async changeSupplyQuantity(id, quantity) {
    const supply = await this.getSupplyById(id);
    if (supply) {
      supply.quantity = quantity;
      await supply.save();
    }
    return supply;
  }

  static async updateSupply(id, name, quantity, category) {
    const supply = await this.getSupplyById(id);
    if (supply) {
      supply.name = name;
      supply.quantity = quantity;
      supply.category = category;
      await supply.save();
    }
    return supply;
  }
}

module.exports = Supply;
