import { trace } from 'console';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname + '\n' + path.resolve(__dirname, './migrations'));

// Load .env explicitly from backend folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('DB_PASSWORD u Knexu:', process.env.DB_PASSWORD); // <-- DODAJTE OVO

export const development = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'dev.sqlite3'),
  },
  useNullAsDefault: true,
  // debug: true,
  migrations: {
    directory: path.resolve(__dirname, './migrations'),
    tableName: 'knex_migrations',
    extension: 'mjs',
  },
  seeds: {
    directory: path.resolve(__dirname, './seeds'),
    extension: 'mjs',
  },
};

export const staging = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  pool: { min: 2, max: 10 },
  migrations: {
    directory: path.resolve(__dirname, './migrations'),
    tableName: 'knex_migrations',
    extension: 'mjs',
  },
  seeds: {
    directory: path.resolve(__dirname, './seeds'),
    extension: 'mjs',
  },
};

export const production = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  pool: { min: 2, max: 10 },
  migrations: {
    directory: path.resolve(__dirname, './migrations'),
    tableName: 'knex_migrations',
    extension: 'mjs',
  },
  seeds: {
    directory: path.resolve(__dirname, './seeds'),
    extension: 'mjs',
  },
};
