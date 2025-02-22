import express from "express";
import roomController from "../controllers/roomController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Room creation (Only authenticated users)
router.post("/create", authMiddleware, roomController.createRoom);

// Join a room
router.post("/join", authMiddleware, roomController.joinRoom);

// Get users in a room
router.get("/:roomId/users", authMiddleware, roomController.getRoomUsers);


export default router;

