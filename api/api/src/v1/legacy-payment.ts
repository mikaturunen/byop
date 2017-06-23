
import { OpenPayment, ClientError } from '../shared-types'
import { clientErrors } from '../errors'

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
  DEVICE: string
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
  SECRET_KEY: string
  MAC?: string
}

const VERSION = '0001'
const ALGORITHM = '3'
const xml = '10'
const DEVICE = xml
const TYPE = '0'

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

/**
 * Transforms a valid json formatted payment object into a legacy format object that allows us to open the legacy payment wall.
 *
 * @param {string} merchantId ID of the Merchant, also known as 'mid'
 * @param {string} merchantSecret Shared secret for specific merchant.
 * @param {OpenPayment} openPayment The specific payment object.
 * @returns {LegacyOpenPayment} Object that can be used together with Checkouts existing payment wall.
 */
export const createLegacyOpenPayment = (merchantId: string, merchantSecret: string, openPayment: OpenPayment): LegacyOpenPayment => {
  const item = openPayment.items[0]
  if (!item) {
    // we should never really hit this but IF we hit it..
    throw 'No item in place.'
  }

  const legacyOpenPayment: LegacyOpenPayment = {
    VERSION,
    STAMP: item.stamp,
    AMOUNT: openPayment.amount,
    REFERENCE: item.reference,
    MESSAGE: openPayment.message,
    LANGUAGE: openPayment.language,
    MERCHANT: merchantId,
    RETURN: openPayment.redirect.return,
    CANCEL: openPayment.redirect.cancel,
    REJECT: openPayment.redirect.reject,
    DELAYED: openPayment.redirect.delayed,
    DELIVERY_DATE: item.deliveryDate,
    COUNTRY: openPayment.country,
    CURRENCY: openPayment.currency,
    DEVICE,
    CONTENT: openPayment.content,
    ALGORITHM,
    TYPE,
    FIRSTNAME: openPayment.customer.firstName,
    FAMILYNAME: openPayment.customer.lastName,
    ADDRESS: openPayment.address.streetAddress,
    POSTCODE: openPayment.address.postalCode,
    POSTOFFICE: openPayment.address.city,
    EMAIL: openPayment.customer.email,
    DESCRIPTION: item.description,
    SECRET_KEY: merchantSecret
  }

  let values = toValueString(legacyOpenPayment)
  // the old payment wall uses md5...
  legacyOpenPayment.MAC = crypto.createHash('md5')
    .update(values)
    .digest('hex')
    .toUpperCase()

  if (process.env['NODE_ENV'] === 'test') {
    console.log('values:', values)
    console.log('hmac:', legacyOpenPayment.MAC)
  }

  return legacyOpenPayment
}

/**
 * Attempts to run all the validations that we know are in place in the v1 API before we actually call it and give out sensible errors.
 *
 * @param {LegacyOpenPayment} payment Payment object
 * @returns {Promise} Resolves into a LegacyOpenPayment object and on validation errors rejects into set of errors that are client friendly
 */
export const v1SpecificValidations = (payment: LegacyOpenPayment) => new Promise(
  // TODO fix reject any type
  (resolve: (payment: LegacyOpenPayment) => void, reject: (error: ClientError) => void) => {
    const capturesValidationErrors: ClientError[] = []
    // one of the legacy quirks
    if (payment.AMOUNT <= 0) {
      capturesValidationErrors.push(clientErrors.legacy.amount)
    }

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
 * Converts the LegacyOpenPayment into a value string for md5 MAC calculation the old payment wall requires.
 *
 * @param {LegacyOpenPayment} payment Payment object
 * @returns {string} String concantenation of the mac calculation ready values of the payment object.
 */
const toValueString = (payment: LegacyOpenPayment) => {
  let valueString =  `${payment.VERSION}+${payment.STAMP}+${payment.AMOUNT}+${payment.REFERENCE}+${payment.MESSAGE}+`
      valueString += `${payment.LANGUAGE}+${payment.MERCHANT}+${payment.RETURN}+${payment.CANCEL}+${payment.REJECT}+`
      valueString += `${payment.DELAYED}+${payment.COUNTRY}+${payment.CURRENCY}+${payment.DEVICE}+${payment.CONTENT}+`
      valueString += `${payment.TYPE}+${payment.ALGORITHM}+${payment.DELIVERY_DATE}+${payment.FIRSTNAME}+${payment.FAMILYNAME}+`
      valueString += `${payment.ADDRESS}+${payment.POSTCODE}+${payment.POSTOFFICE}+${payment.SECRET_KEY}`

  return valueString
}

/**
 * Calls the existing legacy Checkout API.
 *
 * @param {LegacyOpenPayment} openPayment Payment to use when creating the payment wall
 * @returns {Object} XML from the payment wall
 */
export const sendLegacyPayment = (openPayment: LegacyOpenPayment) => {
  return openPaymentWall(openPayment)
}
