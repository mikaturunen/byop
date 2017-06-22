
import { OpenPayment } from './shared-types'
import * as crypto from 'crypto'

import * as unirest from 'unirest'


export interface LegacyOpenPayment {
  VERSION: string
  STAMP: string
  AMOUNT: number
  REFERENCE: string
  MERCHANT: string
  RETURN: string
  CANCEL: string
  REJECT: string
  DELAYED: string
  DELIVERY_DATE: string
  MESSAGE: string
  LANGUAGE: string
  COUNTRY: string
  CURRENCY: string
  CONTENT: string
  ALGORITHM: string
  TYPE: string
  FIRSTNAME: string
  FAMILYNAME: string
  ADDRESS: string
  POSTCODE: string
  POSTOFFICE: string
  EMAIL: string
  DESCRIPTION: string
}

const VERSION = '0001'
const ALGORITHM = '1'
const xml = '10'
const TYPE = xml

const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'LegacyOpenPayment' })

const successCodes = [ 200 ]
const checkoutError = [ 200 ]

// TODO handle all the special cases that are actually considered errors even though they are HTTP 200 OK
const checkoutEmptyPostError = 'Yhtään tietoa ei siirtynyt POST:lla checkoutille'

/**
 * Attempts to open the payment wall and create a payment at the same time.
 *
 * @param {Object} payload Request POST body
 * @param {Object} headers Complete unirest headers. Defaults to empty headers.
 * @returns {Promise} Resolves to payment wall and rejects on HTTP error or HTTP 200 OK when it's CoF specific error.
 */
const openPaymentWall = (payload: any, headers?: any) => {
  headers = headers ? headers : {}

  log.info(`Opening payment wall.`)

  return new Promise((resolve: any, reject: any) => unirest
    .post('https://payment.checkout.fi')
    .headers(headers)
    .send(payload)
    .end((result: any) => {
      log.info('Received reply for payment api:', result.body)

      // First make sure we have handled the http error codes
      if (successCodes.indexOf(result.code) === -1) {
        // ERROR
        const message = 'Received http error'
        log.error(message)
        reject({ status: 502, message: message, raw: result.body })
      } else if (result.body === checkoutEmptyPostError) {
        // TODO handle the remaining  errors the payment wall can give inside a HTTP 200 OK-
        // HTTP status was okay but something was configured incorrectly or miscommunicated
        log.error('HTTP status was okay but something was configured incorrectly or miscommunicated:', result.code)
        reject({ status: 500, message: 'Misconfiguration', raw: result.body })
      } else {
        resolve(result.body)
      }
    }))
}

export const createLegacyOpenPayment = (merchantId: string, openPayment: OpenPayment): LegacyOpenPayment => {
  const item = openPayment.items[0]
  if (!item) {
    // we should never really hit this but IF we hit it..
    throw 'No item in place.'
  }

  const legacyOpenPayment = {
    VERSION,
    STAMP: openPayment.stamp,
    AMOUNT: openPayment.amount,
    REFERENCE: openPayment.reference,
    MERCHANT: merchantId,
    RETURN: openPayment.redirect.return,
    CANCEL: openPayment.redirect.cancel,
    REJECT: openPayment.redirect.reject,
    DELAYED: openPayment.redirect.delayed,
    DELIVERY_DATE: item.deliveryDate,
    MESSAGE: openPayment.message,
    LANGUAGE: openPayment.language,
    COUNTRY: openPayment.country,
    CURRENCY: openPayment.currency,
    CONTENT: openPayment.content,
    ALGORITHM,
    TYPE,
    FIRSTNAME: openPayment.customer.firstName,
    FAMILYNAME: openPayment.customer.lastName,
    ADDRESS: openPayment.address.streetAddress,
    POSTCODE: openPayment.address.postalCode,
    POSTOFFICE: openPayment.address.city,
    EMAIL: openPayment.customer.email,
    DESCRIPTION: item.description
  }

  // TODO potentially log anon object from this set?

  return legacyOpenPayment
}

export const sendLegacyPayment = (openPayment: LegacyOpenPayment) => {
  let values = Object.keys(openPayment).map(key => openPayment[key]).join('+')
  let properties = Object.keys(openPayment).map(key => key).join('+')
  return openPaymentWall(openPayment)
}
