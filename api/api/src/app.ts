
process.on('uncaughtException', (error: any) => {
  console.log('Unhandled exception at: ', error)
  process.exit(-1)
})

import * as express from 'express'
import * as bunyan from 'bunyan'
import * as bodyParser from 'body-parser'

import { v1SinglePaymentHandler } from './v1/payment'
import { v1ShopInShopPaymentHandler } from './v1/sis-payment'
import { v2SinglePaymentHandler } from './v2/payment'

const port = process.env['SERVER_PORT'] ? process.env['SERVER_PORT'] : 3002
const log = bunyan.createLogger({ name: 'api' })
const app = express()

app.use(bodyParser.json())
// - who tought this was a good idea? REALLY? If this is not disabled, we are opening additional attack windows.
app.disable('x-powered-by')

app.post('/api/v1/overlay/:merchantId/payment/open/single', v1SinglePaymentHandler)
app.post('/api/v1/overlay/:merchantId/payment/open/sis', v1ShopInShopPaymentHandler)

app.post('/api/v2/:merchantId/payment/open/single', v2SinglePaymentHandler)

app.listen(port, _ => log.info(`API overlay listening on port ${port}!`))

// This is only used so we can actually require the whole express.js structure in test frameworks for testing purposes
module.exports = app
