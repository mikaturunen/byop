import * as React from 'react'


interface PaymentProviderFormProps {
  providerJson: any
}

class PaymentProviderForm extends React.Component<PaymentProviderFormProps, void> {
  constructor() {
    super()

    this.postToProvider = this.postToProvider.bind(this)
  }

  postToProvider(event: any) {
    //event.preventDefault()
    // Access the first item of the tupple to get the actual children from here.
    let body = ''
    this.props.providerJson.children[0].map((children: any, index: number) => {
      const divider = index === 0 ? '' : '&'
      body += `${divider}${encodeURIComponent(children.name)}=${encodeURIComponent(children.value)}`
    })

    const headers = new Headers()
    headers.append('Content-Type', 'application/x-www-form-urlencoded')
    headers.append('Content-length', body.length.toString())

    const method = 'POST'
    const mode = 'cors'
    const request = {
      method,
      headers,
      mode,
      body
    }

    window.fetch(this.props.providerJson.properties.action, request)
      .then((result: any) => console.log('RESULT:', result))
      .catch((error: any) => console.log('ERROR:', error))
  }

  render() {
    return <form key={this.props.providerJson.name}
                 method={this.props.providerJson.properties.method}
                 action={this.props.providerJson.properties.action} >

      <input type={this.props.providerJson.children[1].children[0].type}
             src={this.props.providerJson.children[1].children[0].src}
             onClick={this.postToProvider} />

    </form>
  }
}



export interface PaymentProperties {

}

class Payments extends React.Component<PaymentProperties, void> {

  render() {
    const payment = {
      "payment": {
          "id": "60971035",
          "description": "",
          "status": "1",
          "stamp": "string",
          "version": "0001",
          "reference": "string",
          "language": "FI",
          "content": "1",
          "deliveryDate": "20170602",
          "type": "0",
          "algorithm": "3",
          "paymentUrl": "https://payment.checkout.fi/p/60971035/8F8286B2-B8BBEC19-F44D1067-12E0D9A0",
          "customer": {
              "firstName": "Keijo",
              "lastName": "",
              "email": "matti@couch.io"
          },
          "delivery": {
              "streetAddress": "Katutie 12",
              "postalCode": "00100",
              "city": "Helsinki",
              "country": "FIN"
          },
          "redirect": {
              "returnUrl": "http://demo1.checkout.fi/xml2.php?test=1",
              "returnHmac": "",
              "cancelUrl": "http://demo1.checkout.fi/xml2.php?test=2",
              "cancelHmac": "10832A0EC615B5B151A8011C3AA48B9C52EAEEBACCB6B5B723D88AD25079B40B",
              "rejectUrl": "http://demo1.checkout.fi/xml2.php?test=3",
              "rejectMac": "",
              "delayedUrl": "http://demo1.checkout.fi/xml2.php?test=4",
              "delayedMac": "3807252AEF596ABC6EBFF28786C1746B5B577A32244B446B491EB39914401E7D"
          }
      },
      "merchant": {
          "id": "375917",
          "company": "Testi Oy",
          "vatId": "123456-7",
          "name": "Markkinointinimi",
          "email": "testi@checkout.fi",
          "phone": "012-345 678"
      },
      "buttons": {
          "amount": "1000",
          "stamp": "string",
          "id": "61436069",
          "list": [{
                  "htmlElement": "form",
                  "name": "MobilePay",
                  "group": "mobile",
                  "properties": {
                      "method": "post",
                      "action": "https://v1-hub-staging.sph-test-solinor.com/form/view/mobilepay"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "sph-account",
                              "value": "test"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-merchant",
                              "value": "test_merchantId"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-order",
                              "value": "CO61436069"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-request-id",
                              "value": "e8719263-48a9-440a-996f-8d165062cdd1"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-amount",
                              "value": "1000"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-currency",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-timestamp",
                              "value": "2017-08-06T14:50:57Z"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-success-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirmer?solinorMethod=mobilepay"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-failure-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel?solinorMethod=mobilepay"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-cancel-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/back?solinorMethod=mobilepay"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-sub-merchant-id",
                              "value": "375917"
                          },
                          {
                              "type": "hidden",
                              "name": "language",
                              "value": "FI"
                          },
                          {
                              "type": "hidden",
                              "name": "signature",
                              "value": "SPH1 testKey 1b3b7135a0709c96c805d61acc3754fa09aaf8268362fdbd20fec4cd65d43e6c"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi/static/img/mobilepay_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Osuuspankki",
                  "group": "bank",
                  "properties": {
                      "method": "post",
                      "action": "https://kultaraha.op.fi/cgi-bin/krcgi"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "VALUUTTALAJI",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "VIITE",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "MAKSUTUNNUS",
                              "value": "60971035"
                          },
                          {
                              "type": "hidden",
                              "name": "action_id",
                              "value": "701"
                          },
                          {
                              "type": "hidden",
                              "name": "MYYJA",
                              "value": "Esittelymyyja"
                          },
                          {
                              "type": "hidden",
                              "name": "SUMMA",
                              "value": "10.00"
                          },
                          {
                              "type": "hidden",
                              "name": "VIESTI",
                              "value": "Testi Henkilö"
                          },
                          {
                              "type": "hidden",
                              "name": "TARKISTE",
                              "value": "96308DD08F7677BC09C1A2682AF45648"
                          },
                          {
                              "type": "hidden",
                              "name": "PALUU-LINKKI",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirm"
                          },
                          {
                              "type": "hidden",
                              "name": "VERSIO",
                              "value": "1"
                          },
                          {
                              "type": "hidden",
                              "name": "TARKISTE-VERSIO",
                              "value": "1"
                          },
                          {
                              "type": "hidden",
                              "name": "VAHVISTUS",
                              "value": "K"
                          },
                          {
                              "type": "hidden",
                              "name": "PERUUTUS-LINKKI",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/op_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Nordea",
                  "group": "bank",
                  "properties": {
                      "method": "post",
                      "action": "https://epmt.nordea.fi/cgi-bin/SOLOPM01"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "SOLOPMT_VERSION",
                              "value": "0003"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_RCV_ID",
                              "value": "12345678"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_CUR",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_LANGUAGE",
                              "value": "1"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_RCV_ACCOUNT",
                              "value": ""
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_REJECT",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/reject"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_CONFIRM",
                              "value": "YES"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_CANCEL",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_RCV_NAME",
                              "value": "Checkout Oy"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_DATE",
                              "value": "EXPRESS"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_AMOUNT",
                              "value": "10.00"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_REF",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_MSG",
                              "value": "Testi Henkilö"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_MAC",
                              "value": "6530072DB567CC1336BB22C077819A88"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_STAMP",
                              "value": "60971035"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_RETURN",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirm"
                          },
                          {
                              "type": "hidden",
                              "name": "SOLOPMT_KEYVERS",
                              "value": "0001"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/nordea_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Danske Bank",
                  "group": "bank",
                  "properties": {
                      "method": "post",
                      "action": "https://verkkopankki.danskebank.fi/SP/vemaha/VemahaApp"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "SUMMA",
                              "value": "10.00"
                          },
                          {
                              "type": "hidden",
                              "name": "VIITE",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "KNRO",
                              "value": "000000000000"
                          },
                          {
                              "type": "hidden",
                              "name": "VALUUTTA",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "VERSIO",
                              "value": "3"
                          },
                          {
                              "type": "hidden",
                              "name": "OKURL",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirm?ORDER=60971035&ORDERMAC=A0A026092E822058D08377D805F7E132"
                          },
                          {
                              "type": "hidden",
                              "name": "VIRHEURL",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel"
                          },
                          {
                              "type": "hidden",
                              "name": "TARKISTE",
                              "value": "363ac17e16e651b420c40f25b83486beeb7002ccf308b9f8ab736b4b09c51125"
                          },
                          {
                              "type": "hidden",
                              "name": "ERAPAIVA",
                              "value": "06.08.2017"
                          },
                          {
                              "type": "hidden",
                              "name": "ALG",
                              "value": "03"
                          },
                          {
                              "type": "hidden",
                              "name": "lng",
                              "value": "1"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/danskebank_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Handelsbanken",
                  "group": "bank",
                  "properties": {
                      "method": "post",
                      "action": "https://verkkomaksu.inetpankki.samlink.fi/vm/SHBlogin.html"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "NET_VERSION",
                              "value": "002"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_SELLER_ID",
                              "value": "0000000000"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CUR",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_REJECT",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/reject"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CONFIRM",
                              "value": "YES"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CANCEL",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_DATE",
                              "value": "EXPRESS"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_AMOUNT",
                              "value": "10,00"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_REF",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_MSG",
                              "value": "Testi Henkilö"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_MAC",
                              "value": "63C4E0034DA7CA6CFA3A1ABC5597B3A4"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_STAMP",
                              "value": "60971035"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_RETURN",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirm"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/handelsbanken_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "POP-Pankki",
                  "group": "other",
                  "properties": {
                      "method": "post",
                      "action": "https://verkkomaksu.poppankki.fi/vm/login.html"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "NET_VERSION",
                              "value": "003"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_SELLER_ID",
                              "value": "0000000000"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CUR",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_REJECT",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/reject"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CONFIRM",
                              "value": "YES"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CANCEL",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_DATE",
                              "value": "EXPRESS"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_AMOUNT",
                              "value": "10,00"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_REF",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_MSG",
                              "value": "Testi Henkilö"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_MAC",
                              "value": "762D793CD0C3798555FBD456C207184247B29207A3B1D76CDDF08C39E2C4B771"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_STAMP",
                              "value": "60971035"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_RETURN",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirm"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_ALG",
                              "value": "03"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi/static/img/poppankki_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Aktia",
                  "group": "bank",
                  "properties": {
                      "method": "post",
                      "action": "https://auth.aktia.fi/vmtest"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "NET_VERSION",
                              "value": "010"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_SELLER_ID",
                              "value": "1111111111111"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CUR",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_REJECT",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/reject"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CONFIRM",
                              "value": "YES"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CANCEL",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_DATE",
                              "value": "EXPRESS"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_AMOUNT",
                              "value": "10,00"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_REF",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_MSG",
                              "value": "Testi Henkilö"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_MAC",
                              "value": "6D812DC7DD39936E58350327DB347B4B736B5B6247D5C90A6A38D1B3E2394B2D"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_STAMP",
                              "value": "60971035"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_RETURN",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirm"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_KEYVERS",
                              "value": "0003"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_ALG",
                              "value": "03"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi/static/img/aktia_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Säästöpankki",
                  "group": "bank",
                  "properties": {
                      "method": "post",
                      "action": "https://verkkomaksu.saastopankki.fi/vm/login.html"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "NET_VERSION",
                              "value": "003"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_SELLER_ID",
                              "value": "0021966066003"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CUR",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_REJECT",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/reject"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CONFIRM",
                              "value": "YES"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CANCEL",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_DATE",
                              "value": "EXPRESS"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_AMOUNT",
                              "value": "10,00"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_REF",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_MSG",
                              "value": "Testi Henkilö"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_MAC",
                              "value": "A86557B6AD94EEA33B1A467F6F741D9246CB2DA12740967D439F4BE9F0C06DE2"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_STAMP",
                              "value": "60971035"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_RETURN",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirm"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_ALG",
                              "value": "03"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi/static/img/saastopankki_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "SP/OmaSp",
                  "group": "bank",
                  "properties": {
                      "method": "post",
                      "action": "https://verkkomaksu.omasp.fi/vm/login.html"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "NET_VERSION",
                              "value": "003"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_SELLER_ID",
                              "value": "0000000000"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CUR",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_REJECT",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/reject"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CONFIRM",
                              "value": "YES"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_CANCEL",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_DATE",
                              "value": "EXPRESS"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_AMOUNT",
                              "value": "10,00"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_REF",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_MSG",
                              "value": "Testi Henkilö"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_MAC",
                              "value": "762D793CD0C3798555FBD456C207184247B29207A3B1D76CDDF08C39E2C4B771"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_STAMP",
                              "value": "60971035"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_RETURN",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirm"
                          },
                          {
                              "type": "hidden",
                              "name": "NET_ALG",
                              "value": "03"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/omasp_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "S-Pankki",
                  "group": "bank",
                  "properties": {
                      "method": "post",
                      "action": "https://online.s-pankki.fi/service/paybutton"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "AAB_VERSION",
                              "value": "0002"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_STAMP",
                              "value": "60971035"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_RCV_ID",
                              "value": "SPANKKIESHOPID"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_RCV_ACCOUNT",
                              "value": "393900-01002369"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_RCV_NAME",
                              "value": "CHECKOUT FINLAND OY"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_LANGUAGE",
                              "value": "1"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_AMOUNT",
                              "value": "10,00"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_REF",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_DATE",
                              "value": "EXPRESS"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_MSG",
                              "value": "Testi Henkilö"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_RETURN",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirm"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_CANCEL",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_REJECT",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/reject"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_MAC",
                              "value": "615996181736D47209F2F3A523781233"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_CONFIRM",
                              "value": "YES"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_KEYVERS",
                              "value": "0001"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_CUR",
                              "value": "EUR"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/s-pankki_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Ålandsbanken",
                  "group": "bank",
                  "properties": {
                      "method": "post",
                      "action": "https://online.alandsbanken.fi/aab/ebank/auth/initLogin.do?BV_UseBVCookie=no"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "AAB_VERSION",
                              "value": "0002"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_STAMP",
                              "value": "60971035"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_RCV_ID",
                              "value": "AABESHOPID"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_RCV_ACCOUNT",
                              "value": "660100-1130855"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_RCV_NAME",
                              "value": "Checkout"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_LANGUAGE",
                              "value": "1"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_AMOUNT",
                              "value": "10,00"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_REF",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_DATE",
                              "value": "EXPRESS"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_MSG",
                              "value": "Testi Henkilö"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_RETURN",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirm"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_CANCEL",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_REJECT",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/reject"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_MAC",
                              "value": "2ED8189045FD8953A581E62C56CC2185"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_CONFIRM",
                              "value": "YES"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_KEYVERS",
                              "value": "0001"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_CUR",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "AAB_ALG",
                              "value": ""
                          },
                          {
                              "type": "hidden",
                              "name": "BV_UseBVCookie",
                              "value": "no"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/alandsbanken_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Visa",
                  "group": "card",
                  "properties": {
                      "method": "post",
                      "action": "https://v1-hub-staging.sph-test-solinor.com//form/view/pay_with_card"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "sph-order",
                              "value": "CO61436069"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-merchant",
                              "value": "test_merchantId"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-amount",
                              "value": "1000"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-failure-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel?solinorMethod=cc"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-timestamp",
                              "value": "2017-08-06T14:50:57Z"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-currency",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-cancel-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/back?solinorMethod=cc"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-account",
                              "value": "test"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-request-id",
                              "value": "ef3e5902-ebf2-4448-8901-0a819700f5ef"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-success-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirmer?solinorMethod=cc"
                          },
                          {
                              "type": "hidden",
                              "name": "signature",
                              "value": "SPH1 testKey fe5522c262c976f8e22bb8a99814a555e750ce6a14b21385fefc9ce5777914f1"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/visa_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Visa Electron",
                  "group": "card",
                  "properties": {
                      "method": "post",
                      "action": "https://v1-hub-staging.sph-test-solinor.com//form/view/pay_with_card"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "sph-order",
                              "value": "CO61436069"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-merchant",
                              "value": "test_merchantId"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-amount",
                              "value": "1000"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-failure-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel?solinorMethod=cc"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-timestamp",
                              "value": "2017-08-06T14:50:57Z"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-currency",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-cancel-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/back?solinorMethod=cc"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-account",
                              "value": "test"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-request-id",
                              "value": "ef3e5902-ebf2-4448-8901-0a819700f5ef"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-success-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirmer?solinorMethod=cc"
                          },
                          {
                              "type": "hidden",
                              "name": "signature",
                              "value": "SPH1 testKey fe5522c262c976f8e22bb8a99814a555e750ce6a14b21385fefc9ce5777914f1"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/visae.gif"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Mastercard",
                  "group": "card",
                  "properties": {
                      "method": "post",
                      "action": "https://v1-hub-staging.sph-test-solinor.com//form/view/pay_with_card"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "sph-order",
                              "value": "CO61436069"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-merchant",
                              "value": "test_merchantId"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-amount",
                              "value": "1000"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-failure-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/cancel?solinorMethod=cc"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-timestamp",
                              "value": "2017-08-06T14:50:57Z"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-currency",
                              "value": "EUR"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-cancel-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/back?solinorMethod=cc"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-account",
                              "value": "test"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-request-id",
                              "value": "ef3e5902-ebf2-4448-8901-0a819700f5ef"
                          },
                          {
                              "type": "hidden",
                              "name": "sph-success-url",
                              "value": "https://payment.checkout.fi/b9zvC5z4W8/fi/confirmer?solinorMethod=cc"
                          },
                          {
                              "type": "hidden",
                              "name": "signature",
                              "value": "SPH1 testKey fe5522c262c976f8e22bb8a99814a555e750ce6a14b21385fefc9ce5777914f1"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/mastercard_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Euroloan",
                  "group": "loaner",
                  "properties": {
                      "method": "post",
                      "action": "https://payment.checkout.fi/b9zvC5z4W8/fi/euroloan"
                  },
                  "children": [
                      [],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi/static/img/euroloan_140x75.png"
                          }]
                      }
                  ]
              },
              {
                  "htmlElement": "form",
                  "name": "Tilisiirto",
                  "group": "other",
                  "properties": {
                      "method": "post",
                      "action": "https://payment.checkout.fi/b9zvC5z4W8/fi/tilisiirto"
                  },
                  "children": [
                      [{
                              "type": "hidden",
                              "name": "bank",
                              "value": "Nordea"
                          },
                          {
                              "type": "hidden",
                              "name": "iban",
                              "value": "FI66 1732 3000 0094 95"
                          },
                          {
                              "type": "hidden",
                              "name": "bic",
                              "value": "NDEAFIHH"
                          },
                          {
                              "type": "hidden",
                              "name": "reference",
                              "value": "614360699"
                          },
                          {
                              "type": "hidden",
                              "name": "amount",
                              "value": "1000"
                          },
                          {
                              "type": "hidden",
                              "name": "receiver",
                              "value": "Checkout Finland Oy"
                          }
                      ],
                      {
                          "htmlElement": "span",
                          "children": [{
                              "type": "image",
                              "src": "https://payment.checkout.fi//static/img/tilisiirto.gif"
                          }]
                      }
                  ]
              }
          ]
      }
    }

    return (
      <div>
        {payment.buttons.list.map((buttonHtml: any) => {
          return <PaymentProviderForm key={buttonHtml.name} providerJson={buttonHtml} />
        })}
      </div>
     )
  }
}

export default Payments
