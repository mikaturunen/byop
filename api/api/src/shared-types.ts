export interface ClientError {
  http: number
  code: number
  message: string
  rawError?: Object
}

// TODO lift interface into a shared location so that's its easy to take and use elsewhere too
export interface MerchantCustomer {
  firstName: string
  lastName: string
  email: string
}

export interface PaymentItem {
  reference: string
  stamp: string
  amount: string
  description: string
  categoryCode: string
  deliveryDate: string
}

export interface PaymentControl {

}

export interface RedirectControl {
  return: string
  delayed: string
  cancel: string
  reject: string
}

export interface DeliveryAddress {
  postalCode: string
  city: string
  country: string
  streetAddress: string
}

// TODO lift interface into a shared location so that's its easy to take and use elsewhere too
export interface OpenPayment {
  amount: number
  currency: string
  reference: string
  stamp: string
  items: PaymentItem[]
  content: string
  country: string
  language: string
  message: string
  customer: MerchantCustomer
  redirect: RedirectControl
  address: DeliveryAddress
}
