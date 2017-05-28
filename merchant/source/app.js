const path = require('path')
const config = require('konfig')({ path: path.join(__dirname, 'config') })
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const unirest = require('unirest')
const R = require('ramda')
const crypto = require('crypto')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json())

const rest = (method, url, send) => new Promise((resolve, reject) => unirest[method](url)
  .headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  })
  .send(send)
  .end(response => {
    if ([400, 500, 502].indexOf(response.code) !== -1) {
      console.log('unirest error, ', url, ':', response.code, response.body)
      reject(response.body)
    } else {
      console.log('unirest result:', response.body)
      resolve(response.body)
    }
  }))

app.get('/', (req, res) => {
  rest('get', `${config.app.pspUrl}/${config.app.nonceApi}/${config.app.merchantId}`)
    .then(result => {
      const query = R.apply(
        (left, right) => `${left}+${right}`,
        [result.nonce, config.app.merchantId]
      )
      .toUpperCase()

      console.log('HMAC query:', query)
      console.log('key:', config.app.apiKey)

      const signature = crypto.createHmac('sha256', config.app.apiKey)
        .update(query)
        .digest('hex')

      return {
        nonce: result.nonce,
        hmac: signature
      }
    })
    .then(payload => rest('post', `${config.app.pspUrl}/${config.app.paymentsApi}/${config.app.merchantId}`, payload))
    .then(result => {
      console.log('RESULT', result)
      res.json(result)
    })
    .catch(error => {
      console.log('error:', error)
      res.status(502).send()
    })
})

app.listen(config.app.port, () => {
  console.log(`Merchant test shop runnig on port ${config.app.port}.`)
})
