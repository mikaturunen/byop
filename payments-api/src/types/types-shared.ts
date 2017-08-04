// Types that are yet to find their real home :)

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
  delivery: DeliveryAddress
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
  delivery: DeliveryAddress
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
  county: string
}

export interface Merchant {
  id: string
  name: string
  email: string
  vatId: string
}

// TODO this type heavily depends on the XML format and validation we are performing, make sure it's typed as strictly as possible as we learn more of the XML
export interface PaymentWall {
  // TODO after first round of figuring out the XML to JSON, type these
  payment: any
  merchant: any
  buttons: {
    stamp: any
    id: any
    amount: any

    list: Array<any>
  }
}

