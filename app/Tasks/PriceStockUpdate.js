'use strict'

const WooCommerceApiController = require("../Controllers/Http/WooCommerceApiController")

const Task = use('Task')

class PriceStockUpdate extends Task {
  static get schedule () {
    return '0 0 */2 * * *'
  }

  async handle () {
    // try {
    //   console.log("START UPDATING")
    //   let Controller = new WooCommerceApiController
    //   await Controller.updatePrice()
    //   console.log("---END---")
    // } catch(e) {
    //   console.log(e)
    // }
  }
}

module.exports = PriceStockUpdate
