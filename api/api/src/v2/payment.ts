import * as express from 'express'
import * as bunyan from 'bunyan'
import { OpenPayment, PaymentSet, ClientError } from '../shared-types'
import { clientErrors, serverErrors } from '../errors'
import { preparePayment } from '../payment-preparation'

const log = bunyan.createLogger({ name: 'api-v2' })

// TODO remove completel once we are done with tests, this is not required at all.
const SECRET = 'SAIPPUAKAUPPIAS'

export const v2SinglePaymentHandler = (request: express.Request, response: express.Response) => {
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
}
