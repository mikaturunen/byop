const path = require('path')
const config = require('konfig')({ path: path.join(__dirname, 'config') })

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const crypto = require('crypto')
const redis = require('redis')
const nonce = require('./nonce')()

const redisClient = redis.createClient({
  host: config.app.redist_host,
  port: config.app.redist_port
})
const secondsInDay = 86400

// TODO replace mock --- 3eb7ce3e-3be2-11e7-a919-92ebcb67fe33
const mockWall = require('./mock/buttons.json')

redisClient.on("error", error => {
  console.log(`Error in Redis connection ${error}`)
})

app.use(bodyParser.json())

app.get('/nonce', (request, response) => {
  const generatedNonce = nonce()
  console.log(`generated nonce ${generatedNonce} for client.`)

  redisClient.set(generatedNonce, generatedNonce, 'EX', secondsInDay, (error, result) => {
    console.log(`redis reply for 'set' ${result},${error}`)
    if (error) {
      console.log(`Error writing in Redis`)
      response.status(502)
    } else {
      response.json({ nonce: generatedNonce })
    }
  })
})

app.post('/', (request, response) => {
  console.log(request.body.nonce)

  new Promise((resolve, reject) => redisClient.get(request.body.nonce, (error, result) => {
    console.log(`redis reply for 'get ${result},${error}`)

    if (error) {
      reject(error)
    } else {
      resolve(result)
    }
  }))
  .then(redisResponse => {
    console.log(redisResponse)

    query = "key=value";

    signature = crypto.createHmac('sha256', config.app.secret_key)
      .update(query)
      .digest('hex');

    console.log("Hello World! " + signature)

    response.json(mockWall)
  })
  .catch(error => {
    console.log(`Error: ${error}`)
    response.status(502)
  })
})

app.listen(config.app.port, () => {
  console.log(`Example app listening on port ${config.app.port}!`)
})
