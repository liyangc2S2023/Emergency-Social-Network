const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
  requester: { type: String, required: true },
  dealer: { type: String, required: true },
  supplyReq: { type: String, required: true },
  supplyDeal: { type: String, required: true },
  quantityReq: { type: Number, required: true },
  quantityDeal: { type: Number, required: true },
  supplyID: { type: String, required: true },
  categoryReq: { type: String },
  categoryDeal: { type: String },
  status: { type: String, required: true, default: 'pending' },
  date: { type: Date, default: Date.now, required: true },
});

const ExchangeTable = mongoose.model('Exchange', exchangeSchema);

class Exchange {
  static async createExchange(exchange) {
    const newExchange = ExchangeTable.create(exchange);
    return newExchange;
  }

  static async getExchangesByUser(username) {
    return ExchangeTable.find({ $or: [{ requester: username }, { dealer: username }] });
  }

  // static async getExchangesByStatus(status) {
  //   return ExchangeTable.find({ status });
  // }

  static async getExchangesById(id) {
    return ExchangeTable.findById(id);
  }

  // change status of exchange
  static async changeExchangeStatus(id, status) {
    const exchange = await ExchangeTable.findById(id);
    if (exchange) {
      exchange.status = status;
      await exchange.save();
    }
    return exchange;
  }
}

module.exports = Exchange;
