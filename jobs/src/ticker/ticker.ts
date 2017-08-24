import * as R from 'ramda'

export interface Tick {
  amount: number
  toMerchantId: number
}

export interface Payment {
  merchant: Merchant
  pspFee: Tick
  sisFee: Tick
  income: Tick
}

type MerchantTypes = "RESELLER" | "RESELLER-SLAVE" | "SIS" | "SIS-SLAVE" | "NORMAL"

export interface Merchant {
  id: number
  type: "RESELLER" | "RESELLER-SLAVE" | "SIS" | "SIS-SLAVE" | "NORMAL"
  parent: number
}

export interface Report {
  merchantId: number
  totalIncome: number
  totalFees: number
  rows: ReportRow[]
}

export interface ReportRow {
  income: number
  fee: number
}

const getReport = (reports: MerchantReports, merchantId: number) => {
  if (!reports[merchantId]) {
    reports[merchantId] = {
      merchantId: merchantId,
      totalIncome: 0,
      totalFees: 0,
      rows: []
    }
  }

  return reports[merchantId]
}

type MerchantReports = { [merchantId: string]: Report }


export const handler = (event: LambdaEventInput, context: LambdaEventContext) => {
  console.log(`Original input ${event.merchantPayments}`)
  const merchantPayments: Payment[] = event.merchantPayments

  // You will probably have to use a map instead of this due to the linter rules
  const reports: MerchantReports = {}

  merchantPayments.forEach(payment => {
    // merchantReport is the merchant who the sale was targetted to by the customer
    const merchantReport = getReport(reports, payment.merchant.id)

    switch(payment.merchant.type) {
      case "NORMAL":
        {
          console.log('Creating report rows for merchant')
          // Split to psp and the normal merchant whos shop just received a purchase
          // MERCHANT
          merchantReport.totalIncome += payment.income.amount
          merchantReport.totalFees += payment.pspFee.amount
          merchantReport.rows.push({ income: payment.income.amount, fee: payment.pspFee.amount })

          // PSP
          const pspReport = getReport(reports, payment.pspFee.toMerchantId)
          pspReport.totalIncome += payment.pspFee.amount
          // No fees, so we skip fee addition for psp
          pspReport.rows.push({ income: payment.pspFee.amount, fee: 0 })
        }
        break;

      case "SIS-SLAVE":
        {
          console.log('Creating report rows for sis-slave merchant')
          // Split to psp and sis-slave and sis-master.
          // Psp will cause fee + sis-master will cause fee on the income for sis-slave
          // 1. PSP will take income first (fee for sis-slave)
          // 2. Sis-master then (fee-for sis-slave)
          // 3. and finally income for the sis-slave (income for sis-slave)

          // SIS-SLAVE MERCHANT
          merchantReport.totalIncome += payment.income.amount
          merchantReport.totalFees += payment.pspFee.amount
          merchantReport.totalFees += payment.pspFee.amount + payment.sisFee.amount
          merchantReport.rows.push({
            income: payment.income.amount,
            fee: payment.pspFee.amount + payment.sisFee.amount
          })

           // PSP
          const pspReport = getReport(reports, payment.pspFee.toMerchantId)
          pspReport.totalIncome += payment.pspFee.amount
          // No fees, so we skip fee addition for psp
          pspReport.rows.push({ income: payment.pspFee.amount, fee: 0 })

          // SIS-MASTER
          const sisMasterReport = getReport(reports, payment.sisFee.toMerchantId)
          sisMasterReport.totalIncome += payment.sisFee.amount
          sisMasterReport.totalFees += payment.pspFee.amount
          // need to create fee row entry for report that the sis understand what they paid for.
          // for sis-slave the entry reads as psp fee + sis-master control element fee and for
          // sis-master it only reads as psp fee
          sisMasterReport.rows.push({ income: payment.sisFee.amount, fee: payment.pspFee.amount })
        }
        break;

      case "RESELLER-SLAVE":
        console.log('Creating report rows for reseller-slave, resellers merchants')
        break;

      case "RESELLER":
        console.log('There should be no direct splits done for RESELLER by payment methods - something has gone horribly wrong!')
        throw `Merchant type broken: ${payment.merchant.type}`
      case "SIS":
        console.log('There should be no direct splits done for SIS by payment methods - something has gone horribly wrong!')
        throw `Merchant type broken: ${payment.merchant.type}`
      default:
        throw `Merchant type broken: ${payment.merchant.type}`
    }
  })

  console.log(JSON.stringify(reports, null, 2))

  debugRowLogs(reports)
  context.done(null, 'Hello World2')
}

const debugRowLogs = (reports: MerchantReports) => {
  Object.keys(reports).forEach(merchantId => {
    // GO FUCK YOURSELF; I want pretty debugs
    console.log(``)
    console.log(``)
    const feePad = "              "
    console.log(`Report for Merchant ${merchantId} - type: ...`)
    console.log(`-----------------`)

    console.log(`INCOME   |   FEE`)
    reports[merchantId].rows.forEach((row: ReportRow, index: number) => {
      const feeLength = row.fee.toString().length
      let rowDebug = feePad.substring(0, feePad.length - feeLength) + row.fee.toString()
      rowDebug = row.income.toString() + rowDebug.substring(rowDebug.length - (rowDebug.length - row.income.toString().length))
      console.log(`${rowDebug}`)
    })

    console.log(`-----------------`)
    let totals = feePad
      .substring(0, feePad.length - reports[merchantId].totalFees.toString().length) + reports[merchantId].totalFees.toString()
    totals = reports[merchantId].totalIncome + totals.substring(totals.length - (totals.length - reports[merchantId].totalIncome.toString().length))
    console.log(`${totals}   TOTALS`)
  })
}

export interface LambdaEventInput {
  readonly merchantPayments: Payment[]
}

export interface LambdaEventContext {
  done: (error: any, success: string) => void
}


