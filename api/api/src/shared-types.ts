export interface ClientError {
  http: number
  code: string
  message: string
  rawError?: Object
}

// TODO lift interface into a shared location so that's its easy to take and use elsewhere too
export interface MerchantCustomer {
  firstName: string
  lastName: string
  email: string
}

export interface PaymentSet {
  merchantId: string
  merchantSecret: string
  clientHmac: string
  payment: OpenPayment
}

export interface PaymentItem {
  reference: string
  stamp: string
  amount: string
  merchant: Merchant
  description: string
  categoryCode: string
  deliveryDate: string
  vatPercentage: number
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

export interface Merchant {
  id: string
  name: string
  email: string
  address: DeliveryAddress
  vatId: string
}

// TODO lift interface into a shared location so that's its easy to take and use elsewhere too
export interface OpenPayment {
  totalAmount: number
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

export interface PaymentButton {
  url: string
  icon: string
  name: string
  group: string
}

export interface PhButton extends PaymentButton {
  'sph-order': string
  'sph-merchant': string
  'sph-amount': string
  'sph-failure-url': string
  'sph-timestamp': string
  'sph-currency': string
  'sph-cancel-url': string
  'sph-account': string
  'sph-request-id': string
  'sph-success-url': string
  'signature': string
}

// Notice the completely different property format, this is due to the banks wanting them to be in these names on
// the actual html form and we just comply to it by providing the names readily available
export interface BankButton extends PaymentButton {
  NET_VERSION: string
  NET_SELLER_ID: string
  NET_CUR: string
  NET_REJECT: string
  NET_CONFIRM: string
  NET_CANCEL: string
  NET_DATE: string
  NET_REF: string
  NET_MSG: string
  NET_MAC: string
  NET_STAMP: string
  NET_RETURN: string
  NET_ALG: string
}

export interface PaymentWall {
  // TODO after first round of figuring out the XML to JSON, type these
  payment: any
  merchant: any
  buttons: Array<any>
}
