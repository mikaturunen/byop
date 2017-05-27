
const crypto = require('crypto')
const path = require('path')
const config = require('konfig')({ path: path.join(__dirname, '..', 'config') })

// TODO replace mock --- 3eb7ce3e-3be2-11e7-a919-92ebcb67fe33
const mockWall = require('../mock/buttons.json')

// will be injected by initialization
let ioc;

const responseCodeClientErrorStatus = 400
const responseCodeServerErrorStatus = 502
const errorUnrecognized = 1000
const errorClientHmac = 2000
const errorClientNonce = 2001

/**
 * Generates the JSON of the payment buttons that are active for the given merchant. Checks validity with nonce.
 * Creates open payment into the system that is then matured later on into either cancelled or accepted payment.
 * @param {Express.Request} request
 * @param {Express.Response} response
 **/
const paymentWallForMerchant = (request, response) => {
  const nonce = request.body.nonce
  const merchantId = request.params.merchantId
  const clientHmac = request.body.hmac

  // TODO get merchant key from key tables and log entries of the merchant only with the key so it's easy to remove from the system when required
  console.log(`${merchantId} started /payment/:merchantId`)

  new Promise((resolve, reject) => ioc['redis'].get(merchantId, (error, result) => {
    console.log(`${merchantId} attempting to find nonce.`)

    // finding if the merchant generated a nonce to be used
    if (error) {
      console.log(`${merchantId} nonce was not found due to redis error. ${error}`)
      // this is server side error
      // TODO log error into proper location
      reject({ responseStatusCode: responseCodeServerErrorStatus, code: errorClientHmac, message: 'Error finding merchant generated nonce' })
    } else if (!result) {
      console.log(`${merchantId} nonce was not present for provided merchantId - not created by merchant.`)
      // this is commonly a client side error
      // TODO log warning and if this keeps repeating with the same merchantId, turn it into a error and report it
      reject({ responseStatusCode: responseCodeClientErrorStatus, code: errorClientHmac, message: 'Error finding merchant generated nonce' })
    } else {
      console.log(`${merchantId} nonce found.`)
      resolve(result)
    }
  }))
  .then(redisResponse => new Promise((resolve, reject) => {
    console.log(`${merchantId} attempting to validate HMAC.`)

    // validating the hmac after nonce was found
    const query = '' + nonce + '+' + merchantId + ''.toUpperCase()
    // TODO use merchant shared secret
    const signature = crypto.createHmac('sha256', config.app.secret_key)
      .update(query)
      .digest('hex')

    if (signature === clientHmac) {
      console.log(`${merchantId} HMAC OK.`)
      // the calculated signatures match, both one calculated by us and one by the client
      resolve()
    } else {
      console.log(`HMAC did not match. Client sent: '${clientHmac}', system calculated: '${signature}'.`)
      reject({ responseStatusCode: responseCodeClientErrorStatus, code: errorClientHmac, message: 'HMAC calculated incorrectly.' })
    }
  }))
  .then(_ => {
    console.log(`${merchantId} attempting to create open payment.`)
    // hmac was OK and now we can create the open payment and send the payment buttons to the customer
    // TODO create open payment
    const paymentId  = 10
    console.log(`${merchantId} payment(${paymentId}) OK`)
    response.json(mockWall)
  })
  .catch(error => {
    // general error handler for the chain
    console.log(`${merchantId} failed to create open payment through /payment/:merchantId. ${error}`)

    if (error.code && error.message && error.responseStatusCode) {
      response.status(error.responseStatusCode).json({ code: error.code, message: error.message })
    } else {
      response.status(responseCodeServerErrorStatus).json({ code: errorUnrecognized, message: 'Unrecognized server error.' })
    }
  })
}

module.exports = {
  post: [{
    url: '/payment/:merchantId',
    callback: paymentWallForMerchant
  }],

  get: [],

  init: (inversionOfControl) => ioc = inversionOfControl.get()
}
