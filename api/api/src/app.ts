
process.on('uncaughtException', (error: any) => {
     console.log('Unhandled Rejection at: ', error)
})

import * as express from 'express'
import * as bunyan from 'bunyan'
import * as bodyParser from 'body-parser'
import * as crypto from 'crypto'
import { OpenPayment } from './shared-types'
import { createLegacyOpenPayment, sendLegacyPayment } from './legacy-payment'

const port = process.env['SERVER_PORT'] ? process.env['SERVER_PORT'] : 3002
const log = bunyan.createLogger({
  name: 'api-test'
})
const app = express()

// TODO lift these into a separate shared file among all the APIs and internal functionality
const clientErrors = {
  hmac: {
    http: 400,
    code: '0001',
    message: 'Incorrectly calculated HMAC.'
  },
  invalidBody: {
    http: 400,
    code: '0002',
    message: 'Invalid body parameters'
  }
}

const SECRET = 'SAIPPUKAUPPIAS'

const serverErrors = {
}

app.use(bodyParser.json())

const isValidHmac = (clientHmac: string, merchantSecret: string, payload: any) => {
  const calculatedHmac = crypto
    .createHmac('sha256', merchantSecret)
    .update(payload)
    .digest('hex')
    .toUpperCase()

  return clientHmac === calculatedHmac
}

const isValidSinglePayment = (openPayment: OpenPayment) => {
  const isValid = true

  // TODO use proper validator and make it a middleware

  return openPayment.reference && openPayment.stamp && openPayment.amount
}

let idIncrement = 0

// Otherwise express will be dookey and advertise itself to the attackers in response headers
// - who tought this was a good idea? REALLY?
app.disable('x-powered-by')

app.get('/api/v1/overlay/:merchantId/payment/open/single', (request: express.Request, response: express.Response) => {
  const merchantId = request.params.merchantId
  const openPayment: OpenPayment = request.body.payment
  const clientHmac = request.body.hmac

  // TODO: read secret from db for merchant
  const merchantSecret = SECRET

  log.info(`start /api/v1/overlay/${merchantId}/payment/open/single`)

  // 1. validate hmac
  if (!isValidHmac(clientHmac, merchantSecret, openPayment)) {
    log.warn(`Hmac validation for ${merchantId} failed. Incorrect hmac was: ${clientHmac}.`)
    response.status(clientErrors.hmac.http).json(clientErrors.hmac)
    return
  }

  // 2. validate properties
  if (!isValidSinglePayment(openPayment)) {
    // TODO list all elements that were invalid. Do not list the first one that is invalid, go through them all and list all invalid ones to make integration easier
    log.warn(`Body validation for ${merchantId} failed. Incorrect body was: ...`)
    response.status(clientErrors.invalidBody.http).json(clientErrors.invalidBody)
    return
  }

  log.info(`transform to legacy open payment`)

  sendLegacyPayment(createLegacyOpenPayment(merchantId, openPayment))
  .then((result: any) => {
    console.log(result)

    response.json(result)
  })
  .catch((error: any) => {
    console.log('error', error)

  })

  log.info(`end /api/v1/overlay/${merchantId}/payment/open/single, OK`)
})

app.post('/api/v2/:merchantId/payment/open/single', (request: express.Request, response: express.Response) => {
  const merchantId = request.params.merchantId
  log.info(`start /api/v2/${merchantId}/payment/open/single`)

  const clientPayload: OpenPayment = request.body.payment
  const clientHmac = request.body.hmac

  // TODO: read secret from db for merchant
  const merchantSecret = SECRET

  // 1. validate hmac
  if (!isValidHmac(clientHmac, merchantSecret, clientPayload)) {
    log.warn(`Hmac validation for ${merchantId} failed. Incorrect hmac was: ${clientHmac}.`)
    response.status(clientErrors.hmac.http).json(clientErrors.hmac)
    return
  }

  // 2. validate properties
  if (!isValidSinglePayment(clientPayload)) {
    // TODO list all elements that were invalid. Do not list the first one that is invalid, go through them all and list all invalid ones to make integration easier
    log.warn(`Body validation for ${merchantId} failed. Incorrect body was: ${clientPayload}.`)
    response.status(clientErrors.invalidBody.http).json(clientErrors.invalidBody)
    return
  }

  // 3. execute requested content
  // TODO open payment into database
  response.json({
    // todo open payment information
  })

  log.info(`end /api/v2/${merchantId}/payment/open/single, OK`)
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
