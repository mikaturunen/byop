const knex = require('knex')
const redis = require('redis')
const path = require('path')
const config = require('konfig')({ path: path.join(__dirname, 'config') })

const inversionOfControlContainer = {}

module.exports = {
  /**
   * Returns the internal inversion of control that was setup in the beginning. Assumes the init is called
   */
  get: _ => inversionOfControlContainer,

  /**
   * Attempts to initialize the whole inversion of control container with the handlers attached inside.
   * @returns {Promise} Resolves on success when all handlers are present and rejects on error with first handler that failed.
   */
  init: () => new Promise((resolve, reject) => {
    // TODO move these setups into their own files asap when they grow out of hand, for now leave em here out of sight
    // FIXME: update all the uesrs and information for postgres to be something else than the defaults
    const database = knex({
      client: 'pg',
      debug: process.env.NODE_ENV !== 'production',
      connection: {
        host: config.app.postgresHost,
        port: config.app.postgresPort,
        user: config.app.postgresUser,
        password: config.app.postgresPassword,
        database: config.app.postgresDatabase
      },
      pool: {
        min: config.app.postgresPoolMin,
        max: config.app.postgresPoolMax,
      }
    })
    .on('connection-error', error => {
      console.log('Error establishing Postgres connection with knex:', error)
      reject(error)
    })

    // TODO this is icky.. wtf handle better
    inversionOfControlContainer['database'] = database
    resolve()
  })
  .then(_ => new Promise((resolve, reject) => {
      // FIXME: password and login for redis
      const redisClient = redis.createClient({
        host: config.app.redist_host,
        port: config.app.redist_port
      })

      redisClient.on('error', error => {
        console.log(`Error in Redis connection ${error}`)
        reject(error)
      })

      redisClient.on('ready', _ => {
        resolve()
        inversionOfControlContainer['redis'] = redisClient
      })
    })
  )
}
