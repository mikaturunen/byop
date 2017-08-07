
import { OpenPayment, ClientError, PaymentWall } from '../../../types'
import { clientErrors, serverErrors } from '../../helpers/errors'
import transformLegacyXmlToJson from '../../helpers/transform-legacy-xml-to-json'

import * as express from 'express'
import * as crypto from 'crypto'
import * as unirest from 'unirest'
import * as R from 'ramda'
import * as bunyan from 'bunyan'
import * as xml2js from 'xml2js'

const log = bunyan.createLogger({ name: 'v1-poll' })

interface Poll {
  stamp: string
  reference: string
  amount: number
  currency: string
}

// TODO remove completely once we are done with tests, this is not required at all.
const SECRET = 'SAIPPUAKAUPPIAS'

const toValueString = (
    poll: Poll,
    merchantId: string
  ) => `0001+${poll.stamp}+${poll.reference}+${merchantId}+${poll.amount}+${poll.currency}+1+1`

const preparePoll = (merchantId: string, merchantSecret: string, clientHmac: string, poll: Poll) => new Promise((
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

  if (!isValidHmac(clientHmac, merchantSecret, poll)) {
    // TODO start using same validation for all APIs that take in the property validators after the hmac as parameters
    log.warn(`Hmac validation for ${merchantId} failed in poll. Incorrect hmac was: ${clientHmac}.`)
    reject(clientErrors.hmac)
    return
  }

  resolve({
    merchantId,
    merchantSecret,
    clientHmac,
    poll
  })
})

const createLegacyPoll = (merchantId: string, merchantSecret: string, poll: Poll) => new Promise((
    resolve: (response: any) => void,
    reject: (Error: any) => void
  ) => {

  const legacyPoll = {
    VERSION: '0001',
    STAMP: poll.stamp,
    REFERENCE: poll.reference,
    MERCHANT: merchantId,
    AMOUNT: poll.amount,
    CURRENCY: poll.currency,
    FORMAT: 1,
    ALGORITHM: 1,
    MAC: ''
  }
  const values = `${toValueString(poll, merchantId)}+${merchantSecret}`
  // the old poll layer wall uses md5... what the hell. This is unbelievable.
  legacyPoll.MAC = crypto.createHash('md5')
    .update(values)
    .digest('hex')
    .toUpperCase()

  console.log(Object.keys(legacyPoll).map(key => `${key}=${legacyPoll[key]}`))
  console.log(values)

  unirest
    .post('https://rpcapi.checkout.fi/poll')
    .headers({})
    .send(legacyPoll)
    .end((result: any) => {
      log.info(`Poll replied.. parsing reply`)
      // First make sure we have handled the http error codes
        console.log('result from xml', result.statusCode)
        console.log('result from xml', result.body)
        resolve(result.body)
    })
})

/**
 *
 *
 * @param {express.Request} request Express request
 * @param {express.Response} response Express response
 */
export const pollPayment = (request: express.Request, response: express.Response) => {
  log.info(`Start poll.. finding merchant`)

  const poll: Poll = request.body.poll
  const merchantId: string = request.body.merchantId
  const clientHmac: string = request.body.hmac
  // TODO: read secret from db for merchant
  const merchantSecret = SECRET

  log.info(`Found merchant for poll: ${merchantId}`)

  preparePoll(merchantId, merchantSecret, clientHmac, poll)
    .then(paymentSet => createLegacyPoll(paymentSet.merchantId, paymentSet.merchantSecret, paymentSet.poll))
   // .then(payment => v1SpecificValidations(payment))
   // .then(payment => openPaymentWall(payment))
   // .then(paymentWallXml => transformLegacyXmlToJson(paymentWallXml))
    .then(result => {
      response.json(result)
      log.info(`End poll for merchant ${merchantId}`)
    })
    .catch((error: ClientError) => {
      if (!error.http || !error.code) {
        log.error(`Unhandled error in poll: `, error)
        // TODO list this error into an alarm list that the developers will follow and fix as these emerge
        response.status(502).json(serverErrors.general)
      } else {
        log.error(`Error in poll: `, error)
        response.status(error.http).json(error)
      }
    })
}
