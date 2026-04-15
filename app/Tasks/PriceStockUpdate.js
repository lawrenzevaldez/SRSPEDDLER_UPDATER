"use strict";

const WooCommerceApiController = require("../Controllers/Http/WooCommerceApiController");

const Task = use("Task");

class PriceStockUpdate extends Task {
  static get schedule() {
    return "*/30 * * * *";
  }

  async handle() {
    try {
      console.log("START UPDATING");

      let Controller = new WooCommerceApiController();
      const ProductMod = use("App/Models/Product");

      await ProductMod.deleteOldRecords();
      await Controller.saveJsonData();
      console.log("---END---");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = PriceStockUpdate;
