import express from "express";
import Joi from "joi";
import { loginUser } from "../repo/auth.js";
import { body } from "../middleware/validate.js";
import redisClient from "../config/redisClient.js";
import { jwtCheck } from "../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import db from "../DB_config/knex.js";

const router = express.Router();

// GET /auth/me - Get current logged in user info
router.get("/me", jwtCheck, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await db('user')
      .select('id', 'email', 'firstname', 'lastname', 'role', 'jmbag')
      .where('id', userId)
      .first();
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    

    user.full_name = `${user.firstname || ''} ${user.lastname || ''}`.trim();
    
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

router.post(
  "/login",
  body({
    email: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
  }),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const { user, token } = await loginUser(email, password);
      res.json({ user, token });
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: err.message });
    }
  }
);

router.post("/logout", jwtCheck, (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  console.error("logout sometihg.");

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Bearer token missing" });
  }

  try {
    const decoded = jwt.decode(token); // Decode the token to get its expiration time
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    // Add the token to Redis with an expiration time
    redisClient
      .set(token, "blacklisted", { EX: expiresIn })
      .then(() => {
        res.json({
          success: true,
          message: "Logged out successfully",
        });
      })
      .catch((err) => {
        console.error("Redis error:", err);
        res.status(500).json({ error: "Failed to blacklist token" });
      });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid token" });
  }
});

export default router;
