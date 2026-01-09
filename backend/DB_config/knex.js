import knex from "knex";
import { development, staging, production } from "./knexfile.mjs";

// Odaberi okruzenje
const environment = process.env.NODE_ENV || "development";
const config = { development, staging, production }[environment];

const db = knex(config);

export default db;