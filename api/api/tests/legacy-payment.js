const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../build/app')
const should = chai.should()
const crypto = require('crypto')

chai.use(chaiHttp)

describe('Legacy payment wrapper', () => {
  describe('POST /api/v1/overlay/:merchantId/payment/open/single', _ => {
    it('with empty payment', done => {
      const payment = {
      }

      chai
        .request(server)
        .post('/api/v1/overlay/12345678/payment/open/single')
        .send(payment)
        .end((error, response) => {
          response.status.should.eql(502)
          response.body.should.be.a('object')
          response.body.should.have.property('code').eql('xxxx')
          response.body.should.have.property('message').eql('TODO: come up with generic error for worst case')
          done()
        })
    })

    it('with a valid payment', done => {
      let body = {
        payment: {
          amount: 100,
          reference: 'string',
          stamp: 'string',
          items: [{
            reference: 'string',
            stamp: 'string',
            amount: 100,
            description: 'string',
            categoryCode: '12332',
            deliveryDate: '20171231',
          }],
          content: 0,
          language: 'FIN',
          country: 'FI',
          currency: 'EUR',
          message: 'Testing, testing',
          customer: {
            firstName: 'Matti',
            lastName: 'Selfie',
            email: 'matti@couch.io'
          },
          redirect: {

          },
          address: {

          }
        },
        hmac: 'NOT CALCULATED'
      }

      body.hmac = crypto
       .createHmac('sha256', 'SAIPPUAKAUPPIAS')
       .update(new Buffer(JSON.stringify(body.payment)).toString('base64'))
       .digest('hex')
       .toUpperCase()

      chai
        .request(server)
        .post('/api/v1/overlay/12345678/payment/open/single')
        .send(body)
        .end((error, response) => {
          response.status.should.eql(200)
          response.body.should.be.a('object')
          response.body.should.have.property('code').eql('200')
          done()
        })
    })
  })
})
