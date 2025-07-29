"use strict";
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const ProductMod = use("App/Models/Product");
const UserMaintenanceMod = use("App/Models/UserMaintenance");

class WooCommerceApiController {
  constructor() {
    this.WooCommerce = new WooCommerceRestApi({
      url: "https://srspeddler.com/novaliches/",
      consumerKey: "ck_2bd1a79961a0281b15a0dc4e3c97f01bb752ee44",
      consumerSecret: "cs_c65d873a1578b1f778dfa532a70ca01566c235d1",
      version: "wc/v3",
    });
  }

  async saveJsonData() {
    try {
      let pageRes = await ProductMod.getOnlineProducts();
      if (pageRes == "") return true;
      for (let i = 0; i < pageRes.length; i++) {
        let prodDetails;
        if (
          pageRes[i].by_barcode == "Y" ||
          pageRes[i].by_barcode == "Yes" ||
          pageRes[i].by_barcode == "yes" ||
          pageRes[i].by_barcode == "y"
        ) {
          prodDetails = await ProductMod.getStockPriceBarcode(
            pageRes[i].GlobalID,
            pageRes[i].Barcode
          );
        } else {
          prodDetails = await ProductMod.getStockPrice(
            pageRes[i].GlobalID,
            pageRes[i].Barcode
          );
        }
        if (prodDetails == "") continue;
        // let currentlySold = await ProductMod.getCurrentlySold(prodDetails.ProductID)
        // if(currentlySold == '') currentlySold = 0
        let itemPrice = 0;
        if (pageRes[i].grams != null) {
          itemPrice = (prodDetails.srp / 1000) * parseInt(pageRes[i].grams);
        } else {
          itemPrice = prodDetails.srp;
        }
        let stocks =
          parseFloat(prodDetails.SellingArea) < 0
            ? 0
            : parseFloat(prodDetails.SellingArea);
        // let percentage = itemPrice * 0.02;
        // itemPrice = parseInt(itemPrice)+parseInt(percentage)
        // // NEW METHOD FOR UPDATE OF STOCK AND PRICE
        let res = await ProductMod.saveJson(
          pageRes[i].ProductID,
          stocks,
          itemPrice
        );
        if (res) {
          console.log(i);
        }
        // // ./NEW METHOD FOR UPDATE OF STOCK AND PRICE
      }
      await this.updateStockPrice();
    } catch (error) {
      console.log(error);
    }
  }

  async updateStockPrice() {
    try {
      let i = 1;
      do {
        let products = await ProductMod.getJson();
        let ids = [];
        let data = [];
        for (const row of products) {
          data.push({
            id: row.ProductID,
            regular_price: row.regular_price,
            stock_quantity: row.stock_quantity,
            stock_status: row.stock_status,
          });
          ids.push(row.id);
        }

        let fData = {
          update: data,
        };

        let result = await this.WooCommerce.post("products/batch", fData);
        if (result.status == 200) {
          let res = await ProductMod.updateJsonStatus(ids);
          console.log(res);
        }
        i++;
      } while (i <= 50);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = WooCommerceApiController;
