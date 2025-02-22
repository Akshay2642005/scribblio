import express from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getUser); // Protected route

export default router;

