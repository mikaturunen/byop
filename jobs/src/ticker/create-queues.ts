
export interface LambdaEventInputPayment {
  payments: {
    id: number
    amount: number
    merchantId: number
    income: number
    forMerchant: number
    status: "PAID" | "OPEN" | "CLOSED" | "CANCELLED" | "TIMEOUT"
    paymentMethod: string
    contract: {
      id: number
      // I'm lazy for now..
      costs: any[]
    }
  }[]
}

export interface LambdaEventContext {
  done: (error: any, success: string) => void
}

const consume = async (event: LambdaEventInputPayment, context: LambdaEventContext) => {
  // TODO write query that actually queries the database for this information, now we receive it as an event.
  // without the db query, we're going to do a bit of magic to collect unique merchant ids from the payload and turn them into list of merchant specific payments
  const uniqueMerchandIds = [
    ...new Set(
      event.payments.map(payment => payment.merchantId)
    )
  ]

  // TODO this will have to be a write to db or something else completely, maybe just send messages to aws queue to be handled?
  uniqueMerchandIds.forEach(async id => {

  })

  context.done(null, 'Ticker queue built. Ticker can start now.')
}

export const handler = (event: LambdaEventInputPayment, context: LambdaEventContext) => consume(event, context)

