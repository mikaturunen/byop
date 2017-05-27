const path = require('path')
const config = require('konfig')({ path: path.join(__dirname, 'config') })
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const nonce = require('./nonce')()
const ioc = require('./ioc')
const payments = require('./resources/payments')

// TODO move into shared constants
const secondsInDay = 86400
const responseCodeServerErrorStatus = 502

ioc.init()
  .then(_ => app.listen(config.app.port, () => {
    app.use(bodyParser.json())

    // inject the ioc into the services so the api calls can trust that everything is setup properly in the background
    payments.init(ioc)
    payments.post.forEach(p => app.post(p.url, p.callback))
    payments.get.forEach(p => app.get(p.url, p.callback))

    // TODO move into its own file
    /**
     * Generates server side nonce and stores it to be used later.
     * @param {Express.Request} request
     * @param {Express.Response} response
     **/
    app.get('/nonce/:merchantId', (request, response) => {
      const generatedNonce = nonce()
      const merchantId = request.params.merchantId
      console.log(`generated nonce ${generatedNonce} for client ${merchantId}.`)

      ioc.get()['redis'].set(merchantId, generatedNonce, 'EX', secondsInDay, (error, result) => {
        console.log(`redis reply for 'set' ${result},${error}`)
        if (error) {
          console.log(`Error writing in Redis`)
          response.status(responseCodeServerErrorStatus)
        } else {
          response.json({ nonce: generatedNonce })
        }
      })
    })

    console.log(`PSP API listening on port ${config.app.port}.`)
  }))
  .catch(error => {
    // error in inversion of control setup
    console.log('Application will shutdown:', error)
  })
