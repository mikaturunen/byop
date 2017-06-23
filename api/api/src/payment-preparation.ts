import * as bunyan from 'bunyan'
import * as crypto from 'crypto'

import { OpenPayment, PaymentSet, ClientError } from './shared-types'
import { clientErrors, serverErrors } from './errors'
import { validateProperties } from './property-validators'

const log = bunyan.createLogger({ name: 'api-payment-preparation' })

/**
 * Is the given client hmac same as the server side computed hmac
 *
 * @param {string} clientHmac Client calculated HMAC
 * @param {string} merchantSecret Merchants shared secret
 * @param {any} payload Any REST apy BODY payload object.
 * @returns {boolean} True when hmac is valid.
 */
const isValidHmac = (clientHmac: string, merchantSecret: string, payload: any) => {
  const calculatedHmac = crypto
    .createHmac('sha256', merchantSecret)
    .update(new Buffer(JSON.stringify(payload)).toString('base64'))
    .digest('hex')
    .toUpperCase()

  return clientHmac === calculatedHmac
}

/**
 * Is the given client hmac same as the server side computed hmac
 *
 * @param {string} merchantId Merchant id, also knows as mid.
 * @param {string} merchantSecret Merchants shared secret
 * @param {string} clientHmac Client calculated HMAC.
 * @param {OpenPayment} payment Payment object that is for validation
 * @returns {Promise} Resolves following objcet { merchantId, merchantSecret, clientHmac, payment } when the OpenPayment is valid. Otherise rejects with exact error codes that are client compatible.
 */
export const preparePayment = (merchantId: string, merchantSecret: string, clientHmac: string, payment: OpenPayment) => {
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

    // 2. validate properties -- first check are we missing any properties
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

    // 2. validate properties -- check are the properties valid
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
