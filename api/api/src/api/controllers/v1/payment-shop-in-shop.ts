
import { OpenPayment, ClientError, PaymentWall } from '../shared-types'
import { clientErrors, serverErrors } from '../errors'

import * as crypto from 'crypto'
import * as unirest from 'unirest'
import * as xml2js from 'xml2js'
import * as R from 'ramda'

export interface LegacyOpenPaymentSis {

}

const VERSION = '0002'
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
 * @param {OpenPayment} payment The specific payment object.
 * @returns {string} The XML string that needs to be sent to the legacy SiS payment wall
 */
export const createLegacyOpenPayment = (merchantId: string, merchantSecret: string, payment: OpenPayment): string => {
  // TODO Clean up this string crap into a simple xml lib as soon as it's tested to work properly

  let createPaymentXml = `
    <?xml version="1.0"?>
    <checkout xmlns="http://checkout.fi/request">
      <request type="aggregator" test="false">
        <aggregator>${merchantId}</aggregator>
        <version>${VERSION}</version>
        <stamp>${payment.stamp}</stamp>
        <reference>${payment.reference}</reference>
        <description></description>
        <device>${DEVICE}</device>
        <content>${payment.content}</content>
        <type>${TYPE}</type>
        <algorithm>${ALGORITHM}</algorithm>
        <currency>${payment.currency}</currency>
        <token>false</token>
        <commit>true</commit>
        <items>
        `

  payment.items.forEach(item => {
    // TODO item level control element, name it to something that makes more sense.

    createPaymentXml = createPaymentXml + `
          <item>
            <code>${item.categoryCode}</code>
            <stamp>${item.stamp}</stamp>
            <description>${item.description}</description>
            <price currency="${payment.currency}" vat="${item.vatPercentage}">${item.amount}</price>
            <merchant>${item.merchant.id}</merchant>
            <control></control>
            <reference>${item.reference}</reference>
          </item>
          `
  })

  createPaymentXml = createPaymentXml + `
          <amount currency="${payment.currency}">${payment.totalAmount}</amount>
          `

  createPaymentXml = createPaymentXml + `
        </items>
        <buyer>
          <company vatid=""></company>
          <firstname></firstname>
          <familyname></familyname>
          <address><![CDATA[ ]]></address>
          <postalcode></postalcode>
          <postaloffice></postaloffice>
          <country></country>
          <email></email>
          <gsm></gsm>
          <language></language>
        </buyer>
        <delivery>
          <date></date>
          <company vatid=""></company>
          <firstname></firstname>
          <familyname></familyname>
          <address><![CDATA[ ]]></address>
          <postalcode></postalcode>
          <postaloffice></postaloffice>
          <country></country>
          <email></email>
          <gsm></gsm>
          <language></language>
        </delivery>
        <control type="default">
          <return>${payment.redirect.return}</return>
          <reject>${payment.redirect.reject}</reject>
          <cancel>${payment.redirect.cancel}</cancel>
          <delayed>${payment.redirect.delayed}</delayed>
        </control>
      </request>
    </checkout>
  `
  return createPaymentXml
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
