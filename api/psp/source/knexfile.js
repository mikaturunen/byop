// Update with your config settings.

module.exports = {
  dev: {
    client: 'pg',
    connection: {
      user:     'postgres',
      password: 'password',
      database: 'postgres'
    },
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  stage: {
    client: 'pg',
    connection: {
      user:     'postgres',
      password: 'password'
    },
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'pg',
    connection: {
      user:     'postgres',
      password: 'password'
    },
    pool: {
      min: 1,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
