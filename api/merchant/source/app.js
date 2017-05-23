const path = require('path')
const config = require('konfig')({ path: path.join(__dirname, 'config') })

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const knex = require('knex')

app.use(bodyParser.json())

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


/**
 * Fetches Merchant key to use in communication.
 * @param {Express.Request} request
 * @param {Express.Response} response
 **/
app.get('/merchant/:merchantId', (request, response) => {
  const merchant_id = request.params.merchantId
  database
      .select()
      .from('merchant_link')
      .where({
        merchant_id
      })
    .then(result => {
      response.json(result)
    })
    .catch(error => {
      console.log('error:', error)

      // TODO extract the common codes and statuses into a shared file that can be easily used everywhere instead of retyping them and inventing the wheel again
      response.status(502).json({
        code: 1000,
        message: 'Error in database connection'
      })
    })
})

app.listen(config.app.port, () => {
  console.log(`Merchant API listening on port ${config.app.port}!`)
})
