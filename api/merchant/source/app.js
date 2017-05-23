const path = require('path')
const config = require('konfig')({ path: path.join(__dirname, 'config') })

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const redis = require('redis')

app.use(bodyParser.json())

/**
 * Fetches Merchant.
 * @param {Express.Request} request
 * @param {Express.Response} response
 **/
app.get('/merchant/:merchantId', (request, response) => {

})

/**
 * Fetches Merchant key to use in communication.
 * @param {Express.Request} request
 * @param {Express.Response} response
 **/
app.get('/merchant/:merchantId', (request, response) => {

})

app.listen(config.app.port, () => {
  console.log(`Merchant API listening on port ${config.app.port}!`)
})
