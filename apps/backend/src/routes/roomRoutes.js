import express from "express";
import roomService from "../services/roomService.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roomController from "../controllers/roomController.js";

const router = express.Router();

// Promote a user to admin
router.post("/makeAdmin", authMiddleware, async (req, res) => {
  try {
    const { roomId, targetUserId } = req.body;
    const adminId = req.user.userId;

    await roomService.makeAdmin(roomId, adminId, targetUserId);

    res.json({ message: "User promoted to admin" });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});




router.post("/create", roomController.createRoom);

export default router;

