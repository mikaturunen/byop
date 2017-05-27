
// NOTE the seed file assumes you can connect to the knexfile.js defined connection and create the required connections
//      and after that switch database connection
let merchantLink

exports.seed = (knex, Promise) => knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
  // Create merchant_link table that essentially links a real life merchant into an arbitary key that we should use
  // everywhere when we discuss the merchant and its details so once we want to forget it, we just simply remove the key
  .then(_ => knex.raw(`
    DROP TABLE IF EXISTS merchant_link;
    CREATE TABLE merchant_Link (
      merchant_id integer PRIMARY KEY not null,
      merchant_key uuid default uuid_generate_v4(),
      created timestamp default NOW()
    );
  `))
  // Create merchant table with simple content for now
  .then(_ => knex.raw(`
    DROP TABLE IF EXISTS merchant;
    CREATE SEQUENCE IF NOT EXISTS merchant_id_sequence;
    CREATE TABLE IF NOT EXISTS merchant (
       merchant_id integer PRIMARY KEY not null default nextval('merchant_id_sequence'),
       name varchar(50) not null,
       created timestamp default NOW()
    );
  `))

  // We have now created all tables. Push in some seed data.

  .then(_ => knex.raw(`
    INSERT INTO merchant
    ("name", created)
    VALUES('Essential Machinery Oy', now());
  `))
  // NOTE: we know the first insert will result in 'id' of 1, hence values '1' ...
  .then(_ => knex.raw(`
    INSERT INTO merchant_link
    (merchant_id, merchant_key)
    VALUES(1, uuid_generate_v4());
  `))
  // collect the keys we want to use from it
  .then(_ => knex.raw('select * from merchant_link where merchant_id=1;'))
  .then(link => merchantLink = link.rows[0])
  .then(_ => )

  .catch(error => {
    console.log('Error running knex seed for development:', error)
    return error
  })
