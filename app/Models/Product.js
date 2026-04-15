"use strict";

const moment = require("moment");

const Model = use("Model");
const Db = use("Database");

class Product extends Model {
  async getOnlineProducts() {
    try {
      return await Db.select("*")
        .from("online_shop_products")
        .orderBy("ProductID", "asc");
    } catch (error) {
      console.log(error);
    }
  }

  async getStockPriceBarcode(globalid, barcode) {
    try {
      const row = await Db.connection("my179")
        .select(
          "A.ProductID",
          "A.srp",
          "A.qty",
          "A.LastDateModified",
          "B.SellingArea",
          "A.Description",
        )
        .joinRaw(
          "FROM POS_Products A INNER JOIN Products B on A.ProductID = B.ProductID",
        )
        .where("B.globalid", globalid)
        .andWhere("A.Barcode", barcode)
        .andWhere("A.PriceModeCode", "R");

      return row[0] || "";
    } catch (error) {
      console.log(error);
    }
  }

  async getStockPrice(globalid, barcode) {
    try {
      const row = await Db.connection("my179")
        .select(
          "A.ProductID",
          "A.srp",
          "A.qty",
          "A.LastDateModified",
          "B.SellingArea",
          "B.Description",
        )
        .joinRaw(
          "FROM POS_Products A INNER JOIN Products B on A.ProductID = B.ProductID",
        )
        .where("B.globalid", globalid)
        .andWhere("A.Barcode", barcode)
        .andWhere("A.PriceModeCode", "R");

      return row[0] || "";
    } catch (error) {
      console.log(error);
    }
  }

  // NEW fast bulk insert
  async bulkSaveJson(items) {
    const trx = await Db.beginTransaction();
    try {
      const productIds = items.map((i) => i.ProductID);

      // 🔥 DELETE old records where status = 1 for same products
      await trx("peddler_updater")
        .whereIn("ProductID", productIds)
        .andWhere("status", 1)
        .delete();

      await trx.insert(items).into("peddler_updater");
      await trx.commit();
      return true;
    } catch (e) {
      console.log(e);
      await trx.rollback();
      return false;
    }
  }

  async getAllPendingJson() {
    try {
      return await Db.select("*").from("peddler_updater").where("status", 0);
    } catch (error) {
      console.log(error);
    }
  }

  async updateJsonStatus(ids) {
    const trx = await Db.beginTransaction();
    try {
      const result = await trx("peddler_updater")
        .whereIn("id", ids)
        .update("status", 1);

      await trx.commit();
      return result;
    } catch (e) {
      console.log(e);
      await trx.rollback();
      return false;
    }
  }

  async deleteOldProcessed() {
    try {
      return await Db("peddler_updater")
        .andWhere("updated_at", "<", moment().subtract(1, "hour").toDate())
        .delete();
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new Product();
