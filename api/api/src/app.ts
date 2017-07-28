
process.on('uncaughtException', (error: any) => {
  console.log('Unhandled exception at: ', error)
  process.exit(-1)
})

// TODO once confirmed that it works as intended, drop in quick types for this.
//const swaggerMiddleware: any = require('swagger-express-mw')

import * as swaggerMiddleware from 'swagger-express-mw'
import * as express from 'express'
import * as bunyan from 'bunyan'
import * as bodyParser from 'body-parser'

const config = {
  appRoot: __dirname // required config
};

const port = process.env['SERVER_PORT'] ? process.env['SERVER_PORT'] : 3002
const log = bunyan.createLogger({ name: 'api' })
const app = express()

app.use(bodyParser.json())
// - who tought this was a good idea? REALLY? If this is not disabled, we are opening additional attack windows.
app.disable('x-powered-by')

// app.post('/api/v1/overlay/:merchantId/payment/open/single', v1SinglePaymentHandler)
// app.post('/api/v1/overlay/:merchantId/payment/open/sis', v1ShopInShopPaymentHandler)

// app.post('/api/v2/:merchantId/payment/open/single', v2SinglePaymentHandler)

// TODO proper types once the SwaggerExpress has types (above)
swaggerMiddleware.create(config, (error: Error, swaggerExpress: any) => {
  if (error) {
    throw error
  }

  // install middleware
  swaggerExpress.register(app)
  app.listen(port, _ => log.info(`API overlay listening on port ${port}!`))
})

// This is only used so we can actually require the whole express.js structure in test frameworks for testing purposes
module.exports = app
