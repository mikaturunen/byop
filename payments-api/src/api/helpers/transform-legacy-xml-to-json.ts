import * as xml2js from 'xml2js'
import { OpenPayment, ClientError, PaymentWall } from '../../shared-types'
import { clientErrors, serverErrors } from '../../errors'
import * as bunyan from 'bunyan'
import * as R from 'ramda'

const log = bunyan.createLogger({ name: 'transformLegacyXmlToPaymentWall' })

/**
 * Transforms the legacy XML response into a proper PaymentWall object.
 *
 * @param {string} xml Full XML result sent by the legacy API.
 * @returns {Promise} Resolves into PaymentWall object and in case of error, rejects into ClientError object.
 */
const transformLegacyXmlToPaymentWall = (xml: string) => new Promise(
  (
    resolve: (result: PaymentWall) => void,
    reject: (error: ClientError) => void
  ) => {

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
          // TODO sort better default than just stupidly puking 0001
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
          delivery: {
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

export default transformLegacyXmlToPaymentWall
