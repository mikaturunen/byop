const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../build/app')
const should = chai.should()
const crypto = require('crypto')
const expect = chai.expect

chai.use(chaiHttp)

process.env.NODE_ENV = 'test'

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
          response.body.should.have.property('message').eql('We have no idea what went wrong, we are truly sorry for this, please get in touch with our developers at `...`.')

          done()
        })
    })

    it('with a valid payment', done => {
      let body = {
        payment: {
          totalAmount: 1000,
          reference: 'string',
          stamp: 'string',
          items: [{
            reference: '12344',
            stamp: '11111111',
            amount: 1000,
            description: '',
            categoryCode: '12332',
            deliveryDate: '20170602',
          }],
          content: 1,
          language: 'FI',
          country: 'FIN',
          currency: 'EUR',
          message: '',
          customer: {
            firstName: 'Keijo',
            lastName: 'Romanof',
            email: 'matti@couch.io'
          },
          redirect: {
            return:  'http://demo1.checkout.fi/xml2.php?test=1',
            cancel:  'http://demo1.checkout.fi/xml2.php?test=2',
            reject:  'http://demo1.checkout.fi/xml2.php?test=3',
            delayed: 'http://demo1.checkout.fi/xml2.php?test=4'
          },
          address: {
            postalCode: '00100',
            streetAddress: 'Katutie 12',
            city: 'Helsinki',
            country: 'Finland'
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
        .post('/api/v1/overlay/375917/payment/open/single')
        .send(body)
        .end((error, response) => {
          response.status.should.eql(200)
          response.body.should.be.a('object')

          const payment = response.body
          expect(payment).to.have.property('merchant')
          expect(payment.merchant).to.have.property('id').to.equal('375917')

          done()
        })
    })
  })
})
