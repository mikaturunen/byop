import * as express from 'express'
import * as bunyan from 'bunyan'
import { OpenPayment, PaymentSet, ClientError } from '../shared-types'
import { createLegacyOpenPayment, sendLegacyPayment, v1SpecificValidations } from './legacy-sis-payment'
import { clientErrors, serverErrors } from '../errors'
import { preparePayment } from '../payment-preparation'

const log = bunyan.createLogger({ name: 'api-v1-overlay-sis' })

// TODO remove completel once we are done with tests, this is not required at all.
const SECRET = 'SAIPPUAKAUPPIAS'

/**
 * Express rest api handler for v1 shop-in-shop payments. Wraps the payment into a much more convenient format that is more user friendly to use.
 * Follows exactly the same object schema as the v2. Just transformed into v1 and most of the content is ignored if it's not present in v1.
 *
 * @param {express.Request} request Express request
 * @param {express.Response} response Express response
 */
export const v1ShopInShopPaymentHandler = (request: express.Request, response: express.Response) => {
  const merchantId = request.params.merchantId
  const openPayment: OpenPayment = request.body.payment
  const clientHmac = request.body.hmac
  // TODO: read secret from db for merchant
  const merchantSecret = SECRET
  log.info(`start /api/v1/overlay/${merchantId}/payment/open/sis`)

  preparePayment(merchantId, merchantSecret, clientHmac, openPayment)
    .then(paymentSet => createLegacyOpenPayment(paymentSet.merchantId, paymentSet.merchantSecret, paymentSet.payment))
    .then(payment => v1SpecificValidations(payment))
    .then(payment => sendLegacyPayment(payment))
    .then(paymentWall => {
      response.json(paymentWall)
      log.info(`end /api/v1/overlay/${merchantId}/payment/open/sis, OK`)
    })
    .catch((error: ClientError) => {
      if (!error.http || !error.code) {
        log.error(`Unhandled error: `, error)
        // TODO list this error into an alarm list that the developers will follow and fix as these emerge
        response.status(502).json(serverErrors.general)
      } else {
        log.error(`Error: `, error)
        response.status(error.http).json(error)
      }
    })
}
