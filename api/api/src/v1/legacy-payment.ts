
import { OpenPayment, ClientError, PaymentWall } from '../shared-types'
import { clientErrors, serverErrors } from '../errors'

import * as crypto from 'crypto'
import * as unirest from 'unirest'
import * as xml2js from 'xml2js'
import * as R from 'ramda'

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
      log.info('XML parsing complete')
      // parse all the properties from the XML with quite a bit of assumptions on the behavior
      const merchant = R.head(result.trade.merchant || [{}])
      const payments = R.head(result.trade.payments || [{}])

      console.log(merchant)
      console.log(payments)

      // We just abuse Ramda for now to strip the arrays into a simple objects.
      const wall: PaymentWall = {
        payment: {
          id: R.head(result.trade.id || ['']),
          description: R.head(result.trade.description || ['']),
          status: R.head(result.trade.status || ['']),
          stamp: R.head(result.trade.stamp || ['']),
          version: R.head(result.trade.version || ['0001']),
          reference: R.head(result.trade.reference || ['']),
          language: R.head(result.trade.language || ['']),
          content: R.head(result.trade.content || ['']),
          deliveryDate: R.head(result.trade.deliveryDate || ['']),
          type: R.head(result.trade.type || ['0']),
          algorithm: R.head(result.trade.algorithm || ['']),
          paymentUrl: R.head(result.trade.paymentURL || ['']),
          customer: {
            firstName: R.head(result.trade.firstname || ['']),
            lastName: R.head(result.trade.lastname || ['']),
            email: R.head(result.trade.customerEmail || [''])
          },
          address: {
            streetAddress: R.head(result.trade.address || ['']),
            postalCode: R.head(result.trade.postcode || ['']),
            city: R.head(result.trade.postoffice || ['']),
            country: R.head(result.trade.country || [''])
          },
          redirect: {
            returnUrl: R.head(result.trade.returnURL || ['']),
            returnHmac: R.head(result.trade.returnMAC || ['']),
            cancelUrl:  R.head(result.trade.cancelURL || ['']),
            cancelHmac: R.head(result.trade.cancelMAC || ['']),
            rejectUrl: R.head(result.trade.rejectURL || ['']),
            // No rejectMAC present in XML?
            rejectMac: R.head(result.trade.rejectMAC || ['']),
            delayedUrl: R.head(result.trade.delayedURL || ['']),
            delayedMac: R.head(result.trade.delayedMAC || [''])
          }
        },
        merchant: {
          id: R.head(merchant.id || ['']),
          company: R.head(merchant.company || ['']),
          vatId: R.head(merchant.vatId || ['']),
          name: R.head(merchant.name || ['']),
          email: R.head(merchant.email || ['']),
          phone: R.head(merchant.helpdeskNumber || ['']),
        },
        buttons: []
      }

      console.log(JSON.stringify(wall, null, 2))
      resolve(wall)
    }
  });
})

const VERSION = '0001'
const ALGORITHM = '3'
const xml = '10'
const DEVICE = xml
const TYPE = '0'

const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'api-v1-overlay-payment' })

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
    STAMP: openPayment.stamp,
    AMOUNT: openPayment.totalAmount,
    REFERENCE: openPayment.reference,
    MESSAGE: openPayment.message,
    LANGUAGE: openPayment.language,
    MERCHANT: merchantId,
    RETURN: openPayment.redirect.return,
    CANCEL: openPayment.redirect.cancel,
    REJECT: openPayment.redirect.reject,
    DELAYED: openPayment.redirect.delayed,
    // TODO: decide on should it be item level in case of legacy payment of payment level..
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

const successCodes = [ 200 ]
const checkoutError = [ 200 ]

// TODO handle all the special cases that are actually considered errors even though they are HTTP 200 OK
const checkoutEmptyPostError = 'Yhtään tietoa ei siirtynyt POST:lla checkoutille'

/**
 * Creates an open payment.
 *
 * @param {LegacyOpenPayment} payload Request POST body
 * @param {Object} headers Complete unirest headers. Defaults to empty headers.
 * @returns {Promise} Resolves to payment wall and rejects on HTTP error or HTTP 200 OK when it's CoF specific error.
 */
const openPaymentWall = (payload: LegacyOpenPayment, headers?: {[key: string]: string}) => {
  headers = headers ? headers : {}

  log.info(`Opening payment wall.`)

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
    if (payment.AMOUNT <= 0.01) {
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