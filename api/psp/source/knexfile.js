// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: {
      user:     'postgres',
      password: 'postgres'
    },
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'pg',
    connection: {
      user:     'postgres',
      password: 'postgres'
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
      password: 'postgres'
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
