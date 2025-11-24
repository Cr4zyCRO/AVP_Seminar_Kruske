require('dotenv').config();

export const development = {
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3',
  },
};
export const staging = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  pool: { min: 2, max: 10 },
  migrations: { tableName: 'knex_migrations' },
};
export const production = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  pool: { min: 2, max: 10 },
  migrations: { tableName: 'knex_migrations' },
};
