const chai = require('chai')
const fs = require('fs')
const path = require('path')

const should = chai.should()
const expect = chai.expect
const assert = chai.assert
const transformer = require('../../../build/api/helpers/transform-legacy-xml-to-json').default

const mockXmlLocation = path.join(__dirname, '../../../src/api/mocks/example-xml.xml')
process.env.NODE_ENV = 'test'

describe('Helper hmac validation', () => {
  describe('Returns', _ => {
    it('True when the validation matches on sha256', _ => {
    })

    it('False when the validation does not match on sha256', _ => {
    })
  })
})
