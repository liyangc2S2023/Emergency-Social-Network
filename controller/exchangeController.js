const Exchange = require('../model/exchange');
const config = require('../config');
const Supply = require('../model/supply');

class ExchangeController {
  static async createExchange(exchange) {
    return Exchange.createExchange(exchange);
  }

  static async getExchangesByUser(username) {
    return Exchange.getExchangesByUser(username);
  }

  static async cancelExchange(id) {
    return Exchange.changeExchangeStatus(id, config.exchangeStatus.CANCELLED);
  }

  static async rejectExchange(id) {
    return Exchange.changeExchangeStatus(id, config.exchangeStatus.REJECTED);
  }

  static async acceptExchange(id) {
    const exchange = await Exchange.getExchangesById(id);
    Supply.getSupplyById(exchange.supplyID).then((supply) => {
      if (supply) {
        supply.quantity -= exchange.quantityDeal;
        supply.save();
      }
    });
    return Exchange.changeExchangeStatus(id, config.exchangeStatus.ACCEPTED);
  }

  static async hasSufficientQuantity(id) {
    const exchange = await Exchange.getExchangesById(id);
    const supply = await Supply.getSupplyById(exchange.supplyID);
    return supply.quantity - exchange.quantityDeal;
  }
}

module.exports = ExchangeController;
