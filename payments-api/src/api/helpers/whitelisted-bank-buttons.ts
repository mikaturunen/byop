
// Whitelisted bank buttons and the properties we dig out of them from the XML when we convert them into a usable JSON

const sph = [
  '$',
  'sph-account',
  'sph-merchant',
  'sph-order',
  'sph-request-id',
  'sph-amount',
  'sph-currency',
  'sph-timestamp',
  'sph-success-url',
  'sph-failure-url',
  'sph-cancel-url',
  'sph-sub-merchant-id',
  'signature'
]
// Mobilepay seems to be completely similar with the 'sph' once with the difference of language
const mobilepayUnique = [
  'language'
]

const op = [
  '$',
  'VALUUTTALAJI',
  'VIITE',
  'MAKSUTUNNUS',
  'action_id',
  'MYYJA',
  'SUMMA',
  'VIESTI',
  'TARKISTE',
  'PALUU-LINKKI',
  'VERSIO',
  'TARKISTE-VERSIO',
  'VAHVISTUS',
  'PERUUTUS-LINKKI'
]


const buttons = {
  solinor1: sph,
  solinor2: sph,
  solinor3: sph,
  mobilepay: sph.concat(mobilepayUnique),
  osuuspankki: op
}

export default buttons
