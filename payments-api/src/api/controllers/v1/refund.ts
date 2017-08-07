
import { OpenPayment, ClientError, PaymentWall } from '../../../types'
import { clientErrors, serverErrors } from '../../helpers/errors'
import transformLegacyXmlToJson from '../../helpers/transform-legacy-xml-to-json'

import * as express from 'express'
import * as crypto from 'crypto'
import * as unirest from 'unirest'
import * as R from 'ramda'
import * as bunyan from 'bunyan'
import * as xml2js from 'xml2js'

const log = bunyan.createLogger({ name: 'v1-refund' })

interface Refund {
  stamp: string
  reference: string
  amount: number
  receiver: {
    email: string
  }
}

// TODO remove completely once we are done with tests, this is not required at all.
const SECRET = 'SAIPPUAKAUPPIAS'

const prepareRefund = (merchantId: string, merchantSecret: string, clientHmac: string, refund: Refund) => new Promise((
    resolve: (refund: any) => void,
    reject: (errro: any) => void
  ) => {

  const isValidHmac = (clientHmac: string, merchantSecret: string, payload: any) => {
    const calculatedHmac = crypto
      .createHmac('sha256', merchantSecret)
      .update(new Buffer(JSON.stringify(payload)).toString('base64'))
      .digest('hex')
      .toUpperCase()

    return clientHmac === calculatedHmac
  }

  if (!isValidHmac(clientHmac, merchantSecret, refund)) {
    // TODO start using same validation for all APIs that take in the property validators after the hmac as parameters
    log.warn(`Hmac validation for ${merchantId} failed in refund. Incorrect hmac was: ${clientHmac}.`)
    reject(clientErrors.hmac)
    return
  }

  resolve({
    merchantId,
    merchantSecret,
    clientHmac,
    refund
  })
})

const createLegacyRefund = (merchantId: string, merchantSecret: string, refund: Refund) => new Promise((
    resolve: (response: any) => void,
    reject: (Error: any) => void
  ) => {

  let rawXml = "<?xml version='1.0'?><checkout><identification><merchant>1234</merchant><stamp>123456</stamp></identification><message><refund><stamp>12345</stamp><reference>12345</reference><amount>1245</amount><receiver><email>email@osoi.te</email></receiver></refund></message></checkout>"

  xml2js.parseString(rawXml, (error: any, result: any) => {
    console.log('created XML:', result)
    const xml = "PD94bWwgdmVyc2lvbj0nMS4wJz8+PGNoZWNrb3V0PjxpZGVudGlmaWNhdGlvbj48bWVyY2hhbnQ+MTIzNDwvbWVyY2hhbnQ+PHN0YW1wPjEyMzQ1Njwvc3RhbXA+PC9pZGVudGlmaWNhdGlvbj48bWVzc2FnZT48cmVmdW5kPjxzdGFtcD4xMjM0NTwvc3RhbXA+PHJlZmVyZW5jZT4xMjM0NTwvcmVmZXJlbmNlPjxhbW91bnQ+MTI0NTwvYW1vdW50PjxyZWNlaXZlcj48ZW1haWw+ZW1haWxAb3NvaS50ZTwvZW1haWw+PC9yZWNlaXZlcj48L3JlZnVuZD48L21lc3NhZ2U+PC9jaGVja291dD4="
          //new Buffer(rawXml).toString('base64')
    const hmac = crypto
        .createHmac('sha256', merchantSecret)
        .update(xml)
        .digest('hex')
        .toUpperCase()

    const headers = {
      //'Content-Type': 'text/html'
    }
    const payload = {
      data: xml,
      mac: hmac
    }
    console.log(payload)

    log.info(`Calling legacy refund for merchantId ${merchantId}`)

    // TODO type the resolve and reject once you have figured out the actual xml parsing and handling into a pretty json
    unirest
      .post('https://rpcapi.checkout.fi/refund2')
      .headers(headers)
      .send(payload)
      .end((result: any) => {
        log.info(`Refund replied.. parsing reply`)

        console.log('result from xml', result.body)
        resolve(result)
      })
  })
})

/**
 * Express rest api handler for v1 refunds.
 *
 * @param {express.Request} request Express request
 * @param {express.Response} response Express response
 */
export const refundPayment = (request: express.Request, response: express.Response) => {
  log.info(`Start refund.. finding merchant`)

  const refund: Refund = request.body.payment
  const merchantId: string = request.body.merchantId
  const clientHmac: string = request.body.hmac
  // TODO: read secret from db for merchant
  const merchantSecret = SECRET

  log.info(`Found merchant for refund: ${merchantId}`)

  prepareRefund(merchantId, merchantSecret, clientHmac, refund)
    .then(paymentSet => createLegacyRefund(paymentSet.merchantId, paymentSet.merchantSecret, paymentSet.refund))
   // .then(payment => v1SpecificValidations(payment))
   // .then(payment => openPaymentWall(payment))
   // .then(paymentWallXml => transformLegacyXmlToJson(paymentWallXml))
    .then(result => {
      response.json(result)
      log.info(`End refund for merchant ${merchantId}`)
    })
    .catch((error: ClientError) => {
      if (!error.http || !error.code) {
        log.error(`Unhandled error in refund: `, error)
        // TODO list this error into an alarm list that the developers will follow and fix as these emerge
        response.status(502).json(serverErrors.general)
      } else {
        log.error(`Error in refund: `, error)
        response.status(error.http).json(error)
      }
    })
}
