import db from "../DB_config/knex.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function checkPassword(hashPassword, plainPass) {
  return bcrypt.compare(plainPass, hashPassword);
}

export async function loginUser(email, password) {
  const user = await db("user").where({ email }).first();
  if (!user) {
    throw new Error("User not found"); //ovo i invalid maknuti u more basic error ali za prvu ruku u developmentu
  }

  const isPasswordValid = await checkPassword(user.password, password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "50d" } // Token vrijedi 50 dana za test aplikacije prije pokazivanja maknit cemo to
  );

  return { user, token };
}
