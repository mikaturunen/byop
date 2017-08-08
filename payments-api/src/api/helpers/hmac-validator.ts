import * as crypto from 'crypto'

const hash = 'sha256'

/**
 * Validates the client calculated hmac.
 *
 * @param {string} clientHmac Hmac sent to us by the client.
 * @param {string} merchantSecret The shared secret merchant used to calculate the actual hmac.
 * @param {T} payload Content that was encrypted with the shared secret.
 * @returns {boolean} True when the client calculated hmac is the same as the server side calculated.
 */
const isHmacValid = <T>(clientHmac: string, merchantSecret: string, payload: T) => crypto
  .createHmac('sha256', merchantSecret)
  .update(new Buffer(JSON.stringify(payload)).toString('base64'))
  .digest('hex')
  .toUpperCase() === clientHmac

export default isHmacValid
