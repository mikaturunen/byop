import { ClientError } from './shared-types'

export const clientErrors = {
  hmac: <ClientError>{
    http: 400,
    code: '0001',
    message: 'Incorrectly calculated HMAC.'
  },
  missingPaymentProperties: <ClientError>{
    http: 400,
    code: '0002',
    message: 'Missing properties from payment body.'
  },
  invalidPaymentProperties: <ClientError>{
    http: 400,
    code: '0003',
    message: 'Invalid body parameters, failed property validation.'
  }
}

export const serverErrors = {
}
