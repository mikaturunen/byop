
import { OpenPayment, ClientError, PaymentWall } from '../shared-types'
import { clientErrors, serverErrors } from '../errors'

import * as crypto from 'crypto'
import * as unirest from 'unirest'
import * as xml2js from 'xml2js'
import * as R from 'ramda'

export interface LegacyOpenPaymentSis {

}

// We make set of assumptions based on the knowledge of the wall behavior.
type TransformResolver = (result: PaymentWall) => void
type TransformRejector = (error: ClientError) => void

/**
 * Transforms the legacy XML response into a proper PaymentWall object.
 *
 * @param {string} xml Full XML result sent by the legacy API.
 * @returns {Promise} Resolves into PaymentWall object and in case of error, rejects into ClientError object.
 */
const transformLegacyXmlToPaymentWall = (xml: string) => new Promise((resolve: TransformResolver, reject: TransformRejector) => {
  log.info('Starting to parse XML')
  // NOTE: we are not going to type the result object at this point as it's messy XML.
  xml2js.parseString(xml, (error: string, result: any) => {
    if (error) {
      let clientError = serverErrors.legacy.error
      clientError.rawError = error

      log.error('Error in parsing the v1 payment wall XML:', clientError.rawError)
      reject(clientError)
    } else {
      // TODO parsing of raw json into a properly formatted PaymentWall object
      // resolve(null)
    }
  });
})

const VERSION = '0001'
const ALGORITHM = '3'
const xml = '10'
const DEVICE = xml
const TYPE = '0'

const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'api-v1-overlay-sis-payment' })

const successCodes = [ 200 ]
const checkoutError = [ 200 ]

// TODO handle all the special cases that are actually considered errors even though they are HTTP 200 OK
const checkoutEmptyPostError = 'Yhtään tietoa ei siirtynyt POST:lla checkoutille'

/**
 * Creates an open payment for shop-in-shop case.
 *
 * @param {LegacyOpenPaymentSis} payload Request POST body
 * @param {Object} headers Complete unirest headers. Defaults to empty headers.
 * @returns {Promise} Resolves to payment wall and rejects on HTTP error or HTTP 200 OK when it's CoF specific error.
 */
const openPaymentWall = (payload: LegacyOpenPaymentSis, headers?: {[key: string]: string}) => {
  headers = headers ? headers : {}

  log.info(`Opening sis payment wall.`)

  // TODO type the resolve and reject once you have figured out the actual xml parsing and handling into a pretty json
  return new Promise((resolve: any, reject: (error: ClientError) => void) => unirest
    .post('https://payment.checkout.fi')
    .headers(headers)
    .send(payload)
    .end((result: any) => {
      log.info(`Payment wall replied.. parsing reply`)
      // First make sure we have handled the http error codes
      if (successCodes.indexOf(result.code) === -1) {
        // ERROR
        let clientError = serverErrors.legacy.error
        clientError.rawError = result.body
        reject(clientError)
      } else if (result.body === checkoutEmptyPostError) {
        // TODO handle the remaining  errors the payment wall can give inside a HTTP 200 OK-
        // TODO start using proper ClientError objects
        // HTTP status was okay but something was configured incorrectly or miscommunicated
        log.error('HTTP status was 200 but something was configured incorrectly or miscommunicated into v1:', result.body, result.code)
        let clientError = clientErrors.legacy.overlay
        clientError.rawError = result.body
        reject(clientError)
      } else {
        console.log('result from xml', result.body)
        resolve(result.body)
      }
    }))
    .then((xml: string) => transformLegacyXmlToPaymentWall(xml))
}

/**
 * Transforms a valid json formatted payment object into a legacy format object that allows us to open the legacy payment wall.
 *
 * @param {string} merchantId ID of the Merchant, also known as 'mid'
 * @param {string} merchantSecret Shared secret for specific merchant.
 * @param {OpenPayment} openPayment The specific payment object.
 * @returns {LegacyOpenPaymentSis} Object that can be used together with Checkouts existing payment wall.
 */
export const createLegacyOpenPayment = (merchantId: string, merchantSecret: string, openPayment: OpenPayment): LegacyOpenPaymentSis => {
  const item = openPayment.items[0]
  if (!item) {
    // we should never really hit this but IF we hit it..
    throw 'No item in place.'
  }

  const legacyOpenPayment: LegacyOpenPaymentSis = {}

  if (process.env['NODE_ENV'] === 'test') {
    // console.log('values:', )
    // console.log('hmac:', legacyOpenPayment.MAC)
  }

  return legacyOpenPayment
}

/**
 * Attempts to run all the validations that we know are in place in the v1 API before we actually call it and give out sensible errors.
 *
 * @param {LegacyOpenPayment} payment Payment object
 * @returns {Promise} Resolves into a LegacyOpenPayment object and on validation errors rejects into set of errors that are client friendly
 */
export const v1SpecificValidations = (payment: LegacyOpenPaymentSis) => new Promise(
  // TODO fix reject any type
  (resolve: (payment: LegacyOpenPaymentSis) => void, reject: (error: ClientError) => void) => {
    const capturesValidationErrors: ClientError[] = []

    // TODO keep adding validations from the existing set

    if (capturesValidationErrors.length > 0) {
      let error = clientErrors.invalidPaymentProperties
      // attach all the legacy validation errors we found into the error object so the calling client knows exactly what's going on
      error.rawError = capturesValidationErrors
      reject(clientErrors.invalidPaymentProperties)
    } else {
      resolve(payment)
    }
  }
)

/**
 * Calls the existing legacy Checkout API for shop-in-shop payment.
 *
 * @param {LegacyOpenPaymentSis} openPayment Payment to use when creating the payment wall
 * @returns {Object} XML from the payment wall
 */
export const sendLegacyPayment = (openPayment: LegacyOpenPaymentSis) => {
  return openPaymentWall(openPayment)
}
