import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import chatController from "../controllers/chatController.js";

const router = express.Router();

router.post("/:roomId/messages", authMiddleware, chatController.postMessages);
router.get("/:roomId/messages", authMiddleware, chatController.getMessages);

export default router;
