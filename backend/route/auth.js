import express from "express";
import Joi from "joi";
import { loginUser } from "../repo/auth.js";
import { body } from "../middleware/validate.js";

const router = express.Router();

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

export default router;
