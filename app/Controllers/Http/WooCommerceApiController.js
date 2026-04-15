"use strict";
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const ProductMod = use("App/Models/Product");
const UserMaintenanceMod = use("App/Models/UserMaintenance");

const BATCH_SIZE = 1000; // Adjust concurrency (recommended: 30–100)
const WC_CONCURRENCY = 2; // Number of WC parallel batches
const WC_BATCH_SIZE = 100; // WooCommerce max recommended is 100 items per batch
const MAX_RETRY = 5;

const moment = require("moment");

class WooCommerceApiController {
  constructor() {
    this.WooCommerce = new WooCommerceRestApi({
      url: "https://srspeddler.com/bagumbong/",
      consumerKey: "ck_985079854a3eb52c5d18a278c8ce6a9615c4c987",
      consumerSecret: "cs_3a4bd1faf5a2da5ff0f2a951932b922820a4b59f",
      version: "wc/v3",
    });
  }

  async saveJsonData() {
    try {
      const pageRes = await ProductMod.getOnlineProducts();
      if (!pageRes || pageRes.length === 0) return true;

      const chunks = await this.chunkArray(pageRes, BATCH_SIZE);

      for (const chunk of chunks) {
        const mapped = chunk.map(async (p) => {
          const byBarcode = ["y", "yes"].includes(
            String(p.by_barcode).toLowerCase(),
          );

          const prodDetails = byBarcode
            ? await ProductMod.getStockPriceBarcode(p.GlobalID, p.Barcode)
            : await ProductMod.getStockPrice(p.GlobalID, p.Barcode);

          if (!prodDetails) return null;

          const itemPrice = p.grams
            ? (prodDetails.srp / 1000) * parseInt(p.grams)
            : prodDetails.srp;

          const stocks = Math.max(0, parseFloat(prodDetails.SellingArea));

          return {
            ProductID: p.ProductID,
            regular_price: itemPrice,
            stock_quantity: stocks,
            stock_status: stocks <= 0 ? "outofstock" : "instock",
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          };
        });

        const results = await Promise.all(mapped);
        const filtered = results.filter(Boolean);

        if (filtered.length > 0) {
          await ProductMod.bulkSaveJson(filtered);
        }
        console.log(BATCH_SIZE);
      }

      await this.updateStockPrice();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * UPDATE STOCKS & PRICE → WooCommerce (BATCH, FAST)
   */
  async updateStockPrice() {
    try {
      const allProducts = await ProductMod.getAllPendingJson();
      if (!allProducts || allProducts.length === 0) return;

      const wcBatches = await this.chunkArray(allProducts, WC_BATCH_SIZE);
      console.log("Total WC Batches:", wcBatches.length);

      for (let i = 0; i < wcBatches.length; i += WC_CONCURRENCY) {
        const batchGroup = wcBatches.slice(i, i + WC_CONCURRENCY);

        await Promise.all(
          batchGroup.map(async (batch) => {
            let retries = 0;
            const ids = batch.map((r) => r.id);
            const wcData = batch.map((row) => ({
              id: row.ProductID,
              regular_price: row.regular_price,
              stock_quantity: row.stock_quantity,
              stock_status: row.stock_status,
            }));

            const payload = { update: wcData };

            while (true) {
              try {
                const result = await this.WooCommerce.post(
                  "products/batch",
                  payload,
                );

                if (result.status === 200) {
                  await ProductMod.updateJsonStatus(ids);
                  console.log(`Updated batch of ${ids.length}`);
                  break; // success → exit retry loop
                }
              } catch (err) {
                if (err.response && err.response.status === 503) {
                  retries++;

                  if (retries > MAX_RETRY) {
                    console.log("❌ 503 still happening. Skipping batch.", ids);
                    break;
                  }

                  const waitMs = 1000 * retries; // backoff
                  console.log(
                    `⚠️ 503 Service Unavailable. Retrying in ${waitMs}ms...`,
                  );
                  await this.sleep(waitMs);
                  continue;
                }

                console.log("❌ WC Error:", err.message || err);
                break;
              }
            }
          }),
        );
      }
    } catch (e) {
      console.log("UpdateStockPrice Error:", e);
    }
  }

  /**
   * Helper: Split array into chunks
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async chunkArray(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    );
  }

  // OLD CODE
  // async saveJsonData() {
  //   try {
  //     let pageRes = await ProductMod.getOnlineProducts();
  //     if (pageRes == "") return true;
  //     for (let i = 0; i < pageRes.length; i++) {
  //       let prodDetails;
  //       if (
  //         pageRes[i].by_barcode == "Y" ||
  //         pageRes[i].by_barcode == "Yes" ||
  //         pageRes[i].by_barcode == "yes" ||
  //         pageRes[i].by_barcode == "y"
  //       ) {
  //         prodDetails = await ProductMod.getStockPriceBarcode(
  //           pageRes[i].GlobalID,
  //           pageRes[i].Barcode
  //         );
  //       } else {
  //         prodDetails = await ProductMod.getStockPrice(
  //           pageRes[i].GlobalID,
  //           pageRes[i].Barcode
  //         );
  //       }
  //       if (prodDetails == "") continue;
  //       // let currentlySold = await ProductMod.getCurrentlySold(prodDetails.ProductID)
  //       // if(currentlySold == '') currentlySold = 0
  //       let itemPrice = 0;
  //       if (pageRes[i].grams != null) {
  //         itemPrice = (prodDetails.srp / 1000) * parseInt(pageRes[i].grams);
  //       } else {
  //         itemPrice = prodDetails.srp;
  //       }
  //       let stocks =
  //         parseFloat(prodDetails.SellingArea) < 0
  //           ? 0
  //           : parseFloat(prodDetails.SellingArea);
  //       // let percentage = itemPrice * 0.02;
  //       // itemPrice = parseInt(itemPrice)+parseInt(percentage)
  //       // // NEW METHOD FOR UPDATE OF STOCK AND PRICE
  //       let res = await ProductMod.saveJson(
  //         pageRes[i].ProductID,
  //         stocks,
  //         itemPrice
  //       );
  //       if (res) {
  //         console.log(i);
  //       }
  //       // // ./NEW METHOD FOR UPDATE OF STOCK AND PRICE
  //     }
  //     await this.updateStockPrice();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async updateStockPrice() {
  //   try {
  //     let i = 1;
  //     do {
  //       let products = await ProductMod.getJson();
  //       let ids = [];
  //       let data = [];
  //       for (const row of products) {
  //         data.push({
  //           id: row.ProductID,
  //           regular_price: row.regular_price,
  //           stock_quantity: row.stock_quantity,
  //           stock_status: row.stock_status,
  //         });
  //         ids.push(row.id);
  //       }

  //       let fData = {
  //         update: data,
  //       };

  //       let result = await this.WooCommerce.post("products/batch", fData);
  //       if (result.status == 200) {
  //         let res = await ProductMod.updateJsonStatus(ids);
  //         console.log(res);
  //       }
  //       i++;
  //     } while (i <= 50);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
}

module.exports = WooCommerceApiController;
