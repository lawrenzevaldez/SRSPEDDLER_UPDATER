'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Db = use('Database')

class UserMaintenance extends Model {
    async audit_trail(user_id, full_name, page, message) {

        let data = {
            user_id: user_id,
            full_name: full_name,
            page: page, 
            message: message,
            date_modified: Db.fn.now()
        }

        await Db.connection('new_datacenter').insert(data).into('online_shop_products_auto_update')
        await Db.close()
        
    }
}

module.exports = new UserMaintenance
