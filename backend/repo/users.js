import db from "../DB_config/knex.js"; 

export async function getAllUsers() {
  return db("user").select("*");
}