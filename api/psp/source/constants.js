module.exports = {
  error: {
    http: {
      responseCodeClientStatus: 400,
      responseCodeServerStatus: 502
    },
    api: {
      unrecognized: 1000,
      clientHmac: 2000,
      clientNonce: 2001
    }
  },
  common: {
    secondsInDay: 86400
  }
}
