import express from "express";
import UsersController from "../controllers/UsersController.js";
import { jwtCheck, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/me", jwtCheck, UsersController.getMe);
router.put("/me", jwtCheck, UsersController.updateMe);

router.get("/", jwtCheck, authorizeAdmin, UsersController.getAllUsers);
router.get("/:id", jwtCheck, authorizeAdmin, UsersController.getUserById);
router.post("/", jwtCheck, authorizeAdmin, UsersController.createUser);
router.put("/:id", jwtCheck, authorizeAdmin, UsersController.updateUser);
router.delete("/:id", jwtCheck, authorizeAdmin, UsersController.deleteUser);

export default router;
