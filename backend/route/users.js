import express from "express";
import usersController from "../controllers/usersController.js";
import { jwtCheck, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/",jwtCheck, authorizeAdmin, usersController.getAllUsers);
router.get("/:id", jwtCheck, authorizeAdmin, usersController.getUserById);
router.post("/", jwtCheck, authorizeAdmin, usersController.createUser);
router.put("/:id",jwtCheck, authorizeAdmin, usersController.updateUser);
router.delete("/:id",jwtCheck, authorizeAdmin, usersController.deleteUser);

export default router;
