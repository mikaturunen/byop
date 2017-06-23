import { ClientError } from './shared-types'

// using some constants to get some standard groove into the api
const paymentId = '1'
const v1 = '1'
const v2 = '2'

export const clientErrors = {
  legacy: {
    amount: <ClientError>{
      http: 400,
      code: `${v1}${paymentId}001`,
      message: 'Amount if not allowed to be 0 or less.'
    },
  },
  hmac: <ClientError>{
    http: 400,
    code: `${v2}${paymentId}001`,
    message: 'Incorrectly calculated HMAC.'
  },
  missingPaymentProperties: <ClientError>{
    http: 400,
    code: `${v2}${paymentId}002`,
    message: 'Missing properties from payment body.'
  },
  invalidPaymentProperties: <ClientError>{
    http: 400,
    code: `${v2}${paymentId}003`,
    message: 'Invalid body parameters, failed property validation.'
  }
}

export const serverErrors = {
}
