import express from "express";
import roomService from "../controllers/roomController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const ownerId = req.user.userId;

    if (!name) return res.status(400).json({ error: "Room name is required!" });

    const room = await roomService.createRoom(name, ownerId);
    res.status(201).json({ message: "Room created successfully", roomId: room.id });
  } catch (error) {
    console.error("❌ Room creation failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});


export default router;

