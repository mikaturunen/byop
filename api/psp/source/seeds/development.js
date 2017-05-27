
// NOTE the seed file assumes you can connect to the knexfile.js defined connection and create the required connections
//      and after that switch database connection
let merchantLink

exports.seed = (knex, Promise) => knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
  // Create function that will return us a fairly random string of given length
  // USE: select random_string(NUMBER), for example: `select random_string(200)`
  .then(_ => knex.raw(`
    create or replace function random_string(length integer) returns text as
    $$
    declare
      chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}';
      result text := '';
      i integer := 0;
    begin
      if length < 0 then
        raise exception 'Given length cannot be less than 0';
      end if;
      for i in 1..length loop
        result := result || chars[1+random()*(array_length(chars, 1)-1)];
      end loop;
      return result;
    end;
    $$ language plpgsql;
  `))
  // Create merchant_link table that essentially links a real life merchant into an arbitary key that we should use
  // everywhere when we discuss the merchant and its details so once we want to forget it, we just simply remove the key
  .then(_ => knex.raw(`
    DROP TABLE IF EXISTS merchant_link;
    CREATE TABLE merchant_Link (
      merchant_id integer PRIMARY KEY not null,
      api_id uuid default uuid_generate_v4(),
      created timestamp default NOW()
    );
  `))
  // Create merchant table with simple content for now
  .then(_ => knex.raw(`
    DROP TABLE IF EXISTS merchant;
    DROP SEQUENCE IF EXISTS merchant_id_sequence;
    CREATE SEQUENCE merchant_id_sequence;
    CREATE TABLE IF NOT EXISTS merchant (
       id integer PRIMARY KEY not null default nextval('merchant_id_sequence'),
       name varchar(50) not null,
       api_key varchar(100) default random_string(100),
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
    (merchant_id, api_id)
    VALUES(1, uuid_generate_v4());
  `))
  // collect the keys we want to use from it
  .then(_ => knex.raw('select * from merchant_link where merchant_id=1;'))
  // store it for later use with other tables
  .then(link => merchantLink = link.rows[0])

  .catch(error => {
    console.log('Error running knex seed for development:', error)
    return error
  })
