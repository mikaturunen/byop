
process.on('uncaughtException', (error: any) => {
     console.log('Unhandled Rejection at: ', error)
})

import * as express from 'express'
import * as bunyan from 'bunyan'
import * as bodyParser from 'body-parser'
import * as crypto from 'crypto'
import { OpenPayment, PaymentSet, ClientError } from './shared-types'
import { createLegacyOpenPayment, sendLegacyPayment } from './legacy-payment'
import { validateProperties } from './property-validators'

const port = process.env['SERVER_PORT'] ? process.env['SERVER_PORT'] : 3002
const log = bunyan.createLogger({ name: 'api' })
const app = express()

// TODO lift these into a separate shared file among all the APIs and internal functionality
const clientErrors = {
  hmac: {
    http: 400,
    code: '0001',
    message: 'Incorrectly calculated HMAC.'
  },
  missingPaymentProperties: {
    http: 400,
    code: '0002',
    message: 'Missing properties from payment body.'
  },
  invalidPaymentProperties: {
    http: 400,
    code: '0003',
    message: 'Invalid body parameters, failed property validation.'
  }
}

const SECRET = 'SAIPPUAKAUPPIAS'

const serverErrors = {
}

app.use(bodyParser.json())

const isValidHmac = (clientHmac: string, merchantSecret: string, payload: any) => {
  const calculatedHmac = crypto
    .createHmac('sha256', merchantSecret)
    .update(new Buffer(JSON.stringify(payload)).toString('base64'))
    .digest('hex')
    .toUpperCase()

  return clientHmac === calculatedHmac
}

const preparePayment = (merchantId: string, merchantSecret: string, clientHmac: string, payment: OpenPayment) => {
  // TODO once the idea is tested, remove any types
  return new Promise((resolve: (payment: PaymentSet) => void, reject: any) => {
    // 1. validate hmac
    log.info(`Checking payment hmac (mid: ${merchantId}, ref: ${payment.reference}, stamp: ${payment.stamp}, amount: ${payment.amount})`)

    if (!isValidHmac(clientHmac, merchantSecret, payment)) {
      log.warn(`Hmac validation for ${merchantId} failed. Incorrect hmac was: ${clientHmac}.`)
      reject(clientErrors.hmac)
      return
    }

    log.info(`Payment hmac OK (mid: ${merchantId}, ref: ${payment.reference}, stamp: ${payment.stamp}, amount: ${payment.amount})`)

    // 2. validate properties
    log.info(`Checking payment property validation (mid: ${merchantId}, ref: ${payment.reference}, stamp: ${payment.stamp}, amount: ${payment.amount})`)

    const paymentInfo = validateProperties(payment)
    if (paymentInfo.missingProperties.length > 0) {
      log.warn(`Body validation for ${merchantId} failed. Missing the following properties from payment: ${paymentInfo.missingProperties}`)
      let error: ClientError = clientErrors.missingPaymentProperties
      error.rawError = {
        missingProperties: paymentInfo.missingProperties
      }
      reject(error)
      return
    }

    if (paymentInfo.invalidProperties.length > 0) {
      log.warn(`Body validation for ${merchantId} failed. The following properties from payment are invalid: ${paymentInfo.invalidProperties}`)
      let error: ClientError = clientErrors.invalidPaymentProperties
      error.rawError = {
        inavaliProperties: paymentInfo.invalidProperties
      }
      reject(error)
      return
    }

    log.info(`Checking payment property validation OK (mid: ${merchantId}, ref: ${payment.reference}, stamp: ${payment.stamp}, amount: ${payment.amount})`)

    resolve({
      merchantId,
      merchantSecret,
      clientHmac,
      payment
    })
  })
}

// Otherwise express will be dookey and advertise itself to the attackers in response headers
// - who tought this was a good idea? REALLY?
app.disable('x-powered-by')

app.post('/api/v1/overlay/:merchantId/payment/open/single', (request: express.Request, response: express.Response) => {
  const merchantId = request.params.merchantId
  const openPayment: OpenPayment = request.body.payment
  const clientHmac = request.body.hmac
  // TODO: read secret from db for merchant
  const merchantSecret = SECRET
  log.info(`start /api/v1/overlay/${merchantId}/payment/open/single`)

  preparePayment(merchantId, merchantSecret, clientHmac, openPayment)
    .then(paymentSet => createLegacyOpenPayment(paymentSet.merchantId, paymentSet.payment))
    .then(payment => sendLegacyPayment(payment))
    .then((result: any) => {
      log.info(`Result from legacy payment wall`, result)
      response.json(result)

      log.info(`end /api/v1/overlay/${merchantId}/payment/open/single, OK`)
    })
    .catch((error: any) => {
      if (!error.http || !error.code) {
        log.error(`Unhandled error: `, error)
        response.status(502).json({ code: 'xxxx', message: 'TODO: come up with generic error for worst case' })
      } else {
        log.error(`Error: `, error)
        response.status(error.http).json(error)
      }
    })
})

app.post('/api/v2/:merchantId/payment/open/single', (request: express.Request, response: express.Response) => {
  const merchantId = request.params.merchantId
  const openPayment: OpenPayment = request.body.payment
  const clientHmac = request.body.hmac
  // TODO: read secret from db for merchant
  const merchantSecret = SECRET
  console.log(merchantId, openPayment, clientHmac)

  log.info(`start /api/v2/${merchantId}/payment/open/single, OK`)

  preparePayment(merchantId, merchantSecret, clientHmac, openPayment)
    .then((result: any) => {
      // TODO actually open the payment..
      log.info(`Payment OK`, result)
      response.json(result)

      log.info(`end /api/v2/${merchantId}/payment/open/single, OK`)
    })
    .catch((error: any) => {
      if (!error.http || !error.code) {
        log.error(`Unhandled error: `, error)
        response.status(502).json({ code: 'xxxx', message: 'TODO: come up with generic error for worst case' })
      } else {
        log.error(`Error: `, error)
        response.status(error.http).json(error)
      }
    })
})

app.post('/api/v2/:merchantId/reporting', (request: express.Request, response: express.Response) => {
  response.json({})
})

app.post('/api/v2/:merchantId/payment/status', (request: express.Request, response: express.Response) => {
  response.json({})
})

app.post('/api/v2/:merchantId/payment/refund', (request: express.Request, response: express.Response) => {
  response.json({})
})

app.post('/api/v2/:merchantId/payment/open/sis', (request: express.Request, response: express.Response) => {
  response.json({})
})

app.listen(port, () => console.log(`API overlay listening on port ${port}!`))

// This is only used so we can actually require the whole express.js structure in test frameworks for testing purposes
module.exports = app
