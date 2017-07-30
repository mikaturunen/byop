const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../build/app')
const should = chai.should()
const crypto = require('crypto')

chai.use(chaiHttp)

process.env.NODE_ENV = 'test'

describe('Legacy payment refund wrapper', () => {
  describe('POST /api/v1/overlay/:merchantId/payment/refund', _ => {
    it('with open payment', done => {
      const payment = {
      }

      chai
        .request(server)
        .post('/api/v1/overlay/375917payment/refund')
        .send(payment)
        .end((error, response) => {
          // TODO fix the test to be a proper test once we start implementing refund, currently this will fail as it's
          //      not implemented and the test is not reasonable. It's just here to remind that it's not implemented.
          response.status.should.eql(502)
          response.body.should.be.a('object')
          response.body.should.have.property('code').eql('xxxx')
          response.body.should.have.property('message').eql('TODO: come up with generic error for worst case')
          done()
        })
    })
  })
})
