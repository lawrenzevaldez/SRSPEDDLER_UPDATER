'use strict'

const moment = require("moment")

const Model = use('Model')
const Db = use('Database')

class Product extends Model {
    async getOnlineProducts() {
        try {
            let row = await Db.select('*')
                        .from('online_shop_products')
                        // .whereIn('ProductID', ['85381', '85377', '85374', '85372'])
                        // .where('ProductID', '=', 62559)
                        .orderBy('ProductID', 'asc')
                        // .where('concessionaire', 1)
            await Db.close()
            return (row.length == 0) ? '' : row
        } catch(error) {
            console.log(error)
        }
    }

    async getStockPriceBarcode(barcode, globalid) {
        try {
            let row = await Db.connection('my179')
                        .select('A.ProductID', 'A.srp', 'A.qty', 'A.LastDateModified', 'B.SellingArea', 'A.Description')
                        .joinRaw('FROM POS_Products A INNER JOIN Products B on A.ProductID = B.ProductID')
                        .where('B.globalid', globalid)
                        .andWhere('A.Barcode', barcode)
                        .andWhere('A.PriceModeCode', 'R')
                        // .groupBy('A.srp', 'A.qty', 'A.LastDateModified', 'B.SellingArea', 'B.Description')
                        // .orderBy('A.LastDateModified', 'desc')
                        // .andWhere('UOM', 'PC')
            await Db.close()
            return (row.length == 0) ? '' : row[0]
        } catch(error) {
            console.log(error)
        }
    }

    async getStockPrice(globalid, barcode) {
        try {
            let row = await Db.connection('my179')
                        .select('A.ProductID', 'A.srp', 'A.qty', 'A.LastDateModified', 'B.SellingArea', 'B.Description')
                        .joinRaw('FROM POS_Products A INNER JOIN Products B on A.ProductID = B.ProductID')
                        .where('B.globalid', globalid)
                        .andWhere('A.Barcode', barcode)
                        .andWhere('A.PriceModeCode', 'R')
                        // .groupBy('A.ProductID', 'A.srp', 'A.qty', 'A.LastDateModified', 'B.SellingArea', 'B.Description')
                        // .orderBy('A.LastDateModified', 'desc')
                        // .andWhere('UOM', 'PC')
            await Db.close()
            return (row.length == 0) ? '' : row[0]
        } catch(error) {
            console.log(error)
        }
    }

    async saveJson(ProductID, stocks, itemPrice) {
        const trx = await Db.beginTransaction()
        try {
            let stock_status
            (stocks <= 0) ? stock_status = 'outofstock' : stock_status = 'instock'
  
            const data = {
                ProductID: ProductID,
                regular_price: itemPrice,
                stock_quantity: stocks,
                stock_status: stock_status
            }

            await trx.insert(data).into('peddler_updater')
            await trx.commit()

            return true
        } catch(e) {
            console.log(e)
            await trx.rollback()
            return false
        }
    }

    async getJson() {
        try {
            let row = await Db.select('*')
                        .from('peddler_updater')
                        .where('status', 0)
                        .orderBy('ProductID', 'asc')
                        .limit(100)
            await Db.close()
            return (row.length == 0) ? '' : row
        } catch(error) {
            console.log(error)
        }
    }

    async updateJsonStatus(ids) {
        const trx = await Db.beginTransaction()
        try {
            let result = await trx.table('peddler_updater').whereIn('id', ids).update('status', 1)

            await trx.commit()
            return result
        } catch(e) {
            console.log(e)
            await trx.rollback()
            return false
        }
    }
    
}

module.exports = new Product
