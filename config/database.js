'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Connection
  |--------------------------------------------------------------------------
  |
  | Connection defines the default connection settings to be used while
  | interacting with SQL databases.
  |
  */
  connection: Env.get('DB_CONNECTION', 'sqlite'),

  /*
  |--------------------------------------------------------------------------
  | Sqlite
  |--------------------------------------------------------------------------
  |
  | Sqlite is a flat file database and can be good choice under development
  | environment.
  |
  | npm i --save sqlite3
  |
  */
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: Helpers.databasePath(`${Env.get('DB_DATABASE', 'development')}.sqlite`)
    },
    useNullAsDefault: true
  },

  /*
  |--------------------------------------------------------------------------
  | MySQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for MySQL database.
  |
  | npm i --save mysql
  |
  */
 mysql: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    },
    debug: Env.get('DB_91_DEBUG', false)
  },
  new_datacenter: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    }
  },

  /*
  |--------------------------------------------------------------------------
  | PostgreSQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for PostgreSQL database.
  |
  | npm i --save pg
  |
  */
  pg: {
    client: 'pg',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    }
  },

  mssql: {
    client: 'mssql',
    connection: {
      host: Env.get('MSDB_HOST', 'localhost'),
      user: Env.get('MSDB_USER', 'root'),
      password: Env.get('MSDB_PASSWORD', ''),
      database: Env.get('MSDB_DATABASE', 'adonis')
    },
    debug: Env.get(false)
  },
  srspos: {
    client: 'mssql',
    connection: {
      host: Env.get('MSDB_HOST', 'localhost'),
      user: Env.get('MSDB_USER', 'root'),
      password: Env.get('MSDB_PASSWORD', ''),
      database: Env.get('MSDB_DATABASE', 'adonis')
    },
    debug: Env.get(false)
  },
  my179: {
    client: 'mysql',
    connection: {
      host: Env.get('MYDB_HOST', 'localhost'),
      port: Env.get('MYDB_PORT', ''),
      user: Env.get('MYDB_USER', 'root'),
      password: Env.get('MYDB_PASSWORD', ''),
      database: Env.get('MYDB_DATABASE', 'adonis')
    },
    debug: Env.get('DB_91_DEBUG', false)
  },
  srssulit: {
    client: 'mysql',
    connection: {
      host: Env.get('MYSQL_ONLINE_HOST', 'localhost'),
      port: Env.get('MYSQL_ONLINE_PORT', ''),
      user: Env.get('MYSQL_ONLINE_USER', 'root'),
      password: Env.get('MYSQL_ONLINE_PASSWORD', ''),
      database: Env.get('MYSQL_ONLINE_DATABASE', 'adonis')
    },
    debug: Env.get('DB_91_DEBUG', false)
  },
}
