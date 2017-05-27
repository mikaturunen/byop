const path = require('path')
const config = require('konfig')({ path: path.join(__dirname, 'config') })
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())

app.listen(config.app.port, () => {
  console.log(`Merchant test shop runnig on port ${config.app.port}.`)
})
